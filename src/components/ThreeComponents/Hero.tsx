'use client';

import { RigidBody, RigidBodyApi, BallCollider } from '@react-three/rapier';
import React, { useRef, Suspense, useMemo, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useFrame } from '@react-three/fiber';
import { Group, Vector3, Quaternion, Matrix4 } from 'three';
import { useLordKeyboardControls } from '@/hooks/useLordKeyboardControls';
import { setPosition, setRotation } from '@/redux/slices/sliceStateHero';
import { useGLTF, useAnimations } from '@react-three/drei';
import { useGravity } from '@/hooks/useGravity';
import * as THREE from 'three';
import CameraFollower from './CameraFollower';
import { HeroPosit } from '@/types/store';

// Настройки движения
const BASE_IMPULSE_STRENGTH = 20;
const MAX_IMPULSE = 100; // Увеличим максимальный импульс
const ROTATION_SPEED = 3;
const ALIGNMENT_SPEED = 5.0;
const MIN_ROTATION_THRESHOLD = 0.01;
const DISPATCH_INTERVAL = 0.5;

// Векторы и матрицы для вычислений
const _pos = new Vector3();
const _center = new Vector3();
const _toCenter = new Vector3();
const _up = new Vector3();
const _modelQuat = new Quaternion();
const _q = new Quaternion();
const _forward = new Vector3();
const _forwardTangent = new Vector3();
const _right = new Vector3();
const _correctedForward = new Vector3();
const _alignQuat = new Quaternion();
const _basis = new Matrix4();
const _moveForce = new Vector3();

const Hero = React.forwardRef<Group>((props, ref) => {
  const lastDispatchTime = useRef(0);
  const model = useGLTF('/models/heroAnimations/walking.glb');
  const lastMoveTime = useRef(0);
  const velocityRef = useRef(new Vector3()); // Для отслеживания скорости
  // Состояния для управления анимациями
  const [isMoving, setIsMoving] = useState(false);
  const [isStuck, setIsStuck] = useState(false); // Состояние "залипания"
  const modelGroup = useRef<Group>(null);
  const dispatch = useDispatch();
  const rigidBody = useRef<RigidBodyApi>(null);
  const movement = useLordKeyboardControls();
  const planetName = useSelector((state: { heroSlice: any }) => state.heroSlice.planet);
  const planetSettings = useSelector((state: { planetsSlice: any }) => state.planetsSlice[planetName]);
  const heroPositionState = useSelector((state: { heroSlice: any }) => state.heroSlice.position);

  // настройки позиции героя передаем в камеру чаще чем диспатчим и камера использует мгновенную позицию
  const [heroPosa, setHeroPosa] = useState<HeroPosit>({ x: 0, y: 0, z: 0 });
  const [heroRota, setHeroRota] = useState({ x: 0, y: 0, z: 0, w: 0 });

  const filteredClips = useMemo(() => {
    return model.animations.map((clip) => {
      const tracks = clip.tracks.filter((t) => !t.name.endsWith('.position'));
      return new THREE.AnimationClip(clip.name, clip.duration, tracks);
    });
  }, [model.animations]);

  const { actions, names } = useAnimations(filteredClips, model.scene);

  const planetCenter = useMemo(
    () => new Vector3(planetSettings.center.x, planetSettings.center.y, planetSettings.center.z),
    [planetSettings.center.x, planetSettings.center.y, planetSettings.center.z]
  );

  useEffect(() => {
    const newIsMoving = movement.moveForward || movement.moveBackward;
    setIsMoving(newIsMoving);

    if (newIsMoving) {
      lastMoveTime.current = performance.now();
    }
  }, [movement.moveForward, movement.moveBackward]);

  // Управление анимациями
  useEffect(() => {
    const walkAction = actions['mixamo.com'] || (names[0] && actions[names[0]]);
    if (!walkAction) return;

    // Всегда держим анимацию активной, но регулируем скорость
    if (!walkAction.isRunning()) {
      walkAction.play().setEffectiveTimeScale(0.1);
    }

    if (isMoving) {
      walkAction.setEffectiveTimeScale(1);
    } else {
      walkAction.setEffectiveTimeScale(0.1);
    }
  }, [isMoving, actions, names]);

  useFrame((state, delta) => {
    const safeDelta = Math.min(Math.max(delta, 0.001), 1 / 20);
    if (!rigidBody.current || !modelGroup.current) return;

    const rb = rigidBody.current;
    const model = modelGroup.current;

    // Текущая скорость персонажа
    const currentVelocity = rb.linvel();
    velocityRef.current.set(currentVelocity.x, currentVelocity.y, currentVelocity.z);

    // Проверка на "залипание"
    if (isMoving && velocityRef.current.length() < 0.5) {
      if (!isStuck) {
        console.log('Character stuck detected!');
        setIsStuck(true);
      }
    } else if (isStuck) {
      setIsStuck(false);
    }

    // Вычисление векторов и ориентации
    const p = rb.translation();
    _pos.set(p.x, p.y, p.z);
    _center.copy(planetCenter);
    _toCenter.subVectors(_center, _pos).normalize();
    _up.copy(_toCenter).negate();

    // Поворот модели
    _modelQuat.copy(model.quaternion);
    if (movement.moveLeft || movement.moveRight) {
      const dir = movement.moveLeft ? 1 : -1;
      const rotationAmount = dir * ROTATION_SPEED * safeDelta;
      _q.setFromAxisAngle(_up, rotationAmount);
      _modelQuat.premultiply(_q);
    }

    // Выравнивание модели
    _modelQuat.normalize();
    _forward.setFromMatrixColumn(model.matrix, 2).normalize();
    _forwardTangent
      .copy(_forward)
      .sub(_up.clone().multiplyScalar(_forward.dot(_up)))
      .normalize();

    _right.crossVectors(_up, _forwardTangent).normalize();
    _correctedForward.crossVectors(_right, _up).normalize();
    _basis.makeBasis(_right, _up, _correctedForward);
    _alignQuat.setFromRotationMatrix(_basis);

    if (_modelQuat.angleTo(_alignQuat) > MIN_ROTATION_THRESHOLD) {
      const blendFactor = 1 - Math.exp(-ALIGNMENT_SPEED * safeDelta);
      _modelQuat.slerp(_alignQuat, blendFactor);
    }

    model.quaternion.slerp(_modelQuat, 0.2);

    // Применение импульса движения
    if (isMoving) {
      const direction = movement.moveForward ? 1 : -1;

      // Рассчитываем силу импульса с плавным стартом
      const moveDuration = (performance.now() - lastMoveTime.current) / 1000;
      const accelerationFactor = Math.min(1, moveDuration * 5);

      // Базовый импульс + дополнительный "толчок" для старта
      let impulsePower = BASE_IMPULSE_STRENGTH + (MAX_IMPULSE - BASE_IMPULSE_STRENGTH) * (1 - accelerationFactor);

      // Усиливаем импульс, если персонаж "залип"
      if (isStuck) {
        impulsePower *= 10; // Тройная сила для "растормаживания"
        console.log('Applying extra impulse to unstuck character', impulsePower);
      }

      _moveForce.copy(_correctedForward).multiplyScalar(impulsePower * direction);

      rb.applyImpulse(
        {
          x: _moveForce.x * safeDelta,
          y: _moveForce.y * safeDelta,
          z: _moveForce.z * safeDelta,
        },
        true
      );
    }

    // Синхронизация состояния

    const newP = rb.translation();
    const cq = model.quaternion;
    setHeroPosa({ x: newP.x, y: newP.y, z: newP.z });
    setHeroRota({ x: cq.x, y: cq.y, z: cq.z, w: cq.w });
    const currentTime = state.clock.elapsedTime;
    if (currentTime - lastDispatchTime.current > DISPATCH_INTERVAL) {
      lastDispatchTime.current = currentTime;
      dispatch(setPosition({ x: newP.x, y: newP.y, z: newP.z }));
      dispatch(setRotation({ x: cq.x, y: cq.y, z: cq.z, w: cq.w }));
    }
  });

  useGravity(rigidBody, planetSettings, {});

  return (
    <Suspense fallback={null}>
      {/* рендерим камеру возле персонажа */}
      {heroPosa.y !== 0 && <CameraFollower heroPosa={heroPosa} heroRota={heroRota} />}
      <RigidBody
        ref={rigidBody}
        colliders={false}
        mass={10}
        linearDamping={0.8} // Оптимизированное демпфирование
        angularDamping={0.5}
        canSleep={true} // Отключаем сон, чтобы предотвратить "залипание"
        enabledRotations={[false, false, false]}
        position={[
          heroPositionState.x,
          heroPositionState.y, // Уменьшили высоту старта
          heroPositionState.z,
        ]}
        type="dynamic"
        {...props}
      >
        <BallCollider args={[1.2]} /> {/* Увеличим радиус коллайдера */}
        <group ref={modelGroup}>
          {model ? (
            <primitive object={model.scene} scale={[1, 1, 1]} />
          ) : (
            <mesh>
              <boxGeometry args={[2, 2, 2]} />
              <meshStandardMaterial color="red" />
            </mesh>
          )}
        </group>
      </RigidBody>
    </Suspense>
  );
});
Hero.displayName = 'Hero';
export default Hero;
