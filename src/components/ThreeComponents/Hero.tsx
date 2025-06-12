'use client';

import { RigidBody, RigidBodyApi, BallCollider } from '@react-three/rapier';
import React, { useRef, Suspense, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useFrame } from '@react-three/fiber';
import { Group, Vector3, Euler, Quaternion, Matrix4 } from 'three';
import { useLordKeyboardControls } from '@/hooks/useLordKeyboardControls';
import { setPosition, setRotation } from '@/redux/slices/sliceStateHero';
import { useGLTF } from '@react-three/drei';
import { useGravity } from '@/hooks/useGravity';

// Настройки движения
// const moveSpeed = 10;
const impulseStrength = 10; // настройте по ощущению «толчка»
const rotationSpeed = 3;
const alignmentSpeed = 5.0; // Регулируемая скорость выравнивания

// В начало файла (снаружи компонента)
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
  const model = useGLTF('/models/heroAnimations/format/Walking2.glb');
  const modelGroup = useRef<Group>(null);
  const dispatch = useDispatch();
  const rigidBody = useRef<RigidBodyApi>(null);
  const movement = useLordKeyboardControls();
  const planetName = useSelector((state: { heroSlice: any }) => state.heroSlice.planet);
  const planetSettings = useSelector((state: { planetsSlice: any }) => state.planetsSlice[planetName]);

  const planetCenter = useMemo(
    () => new Vector3(planetSettings.center.x, planetSettings.center.y, planetSettings.center.z),
    [planetSettings.center.x, planetSettings.center.y, planetSettings.center.z]
  );

  useGravity(rigidBody, planetSettings, {
    safeDeltaMax: 1 / 20, // опционально
    zeroVerticalVelocity: false, // опционально при false враги отскакивают
  });

  useFrame((state, delta) => {
    // 4) Защита от скачков FPS с более гибким ограничением
    const safeDelta = Math.min(Math.max(delta, 0.001), 1 / 20); // Двойное ограничение

    if (!rigidBody.current || !modelGroup.current) return;
    const rb = rigidBody.current;
    const model = modelGroup.current;

    // 1) Вычисляем up-вектор относительно центра планеты
    const p = rb.translation();
    _pos.set(p.x, p.y, p.z);
    _center.copy(planetCenter);
    _toCenter.subVectors(_center, _pos).normalize();
    _up.copy(_toCenter).negate();

    // 2) Плавный поворот модели под ввод пользователя (A/D) с умножением на safeDelta
    _modelQuat.copy(model.quaternion);
    if (movement.moveLeft || movement.moveRight) {
      const dir = movement.moveLeft ? 1 : -1;
      const rotationAmount = dir * rotationSpeed * safeDelta;

      // Плавный поворот с использованием кватернионов
      _q.setFromAxisAngle(_up, rotationAmount);
      _modelQuat.premultiply(_q);
    }

    // 3) Строим касательное направление вперед относительно up
    _forward.set(0, 0, -1).applyQuaternion(_modelQuat);
    _forwardTangent
      .copy(_forward)
      .sub(_up.clone().multiplyScalar(_forward.dot(_up)))
      .normalize();

    // 4) Плавное выравнивание ориентации модели под поверхность
    _right.crossVectors(_up, _forwardTangent).normalize();
    _correctedForward.crossVectors(_right, _up).normalize();
    _basis.makeBasis(_right, _up, _correctedForward);
    _alignQuat.setFromRotationMatrix(_basis);

    // Добавляем плавность с помощью safeDelta
    const blendFactor = 1 - Math.exp(-alignmentSpeed * safeDelta);
    _modelQuat.slerp(_alignQuat, blendFactor);

    model.quaternion.slerp(_modelQuat, 0.2);

    // 5) Применяем импульс для движения (W/S) с safeDelta
    if (movement.moveForward || movement.moveBackward) {
      const direction = movement.moveForward ? -1 : 1;
      _moveForce.copy(_correctedForward).multiplyScalar(impulseStrength * direction);

      rb.applyImpulse(
        {
          x: _moveForce.x * safeDelta,
          y: _moveForce.y * safeDelta,
          z: _moveForce.z * safeDelta,
        },
        true
      );
    }

    // 6) Синхронизация состояния в Redux
    const newP = rb.translation();
    dispatch(setPosition({ x: newP.x, y: newP.y, z: newP.z }));
    const cq = model.quaternion;
    dispatch(setRotation({ x: cq.x, y: cq.y, z: cq.z, w: cq.w }));
  });

  return (
    <Suspense fallback={null}>
      <RigidBody
        ref={rigidBody}
        colliders={false}
        mass={1}
        linearDamping={1.5}
        angularDamping={2}
        enabledRotations={[false, false, false]}
        position={[
          planetSettings.center.x,
          planetSettings.center.y + planetSettings.radius + 1, // запас по Y
          planetSettings.center.z,
        ]}
        type="dynamic"
        {...props}
      >
        <BallCollider args={[1]} /> {/* Добавляем коллайдер */}
        <group ref={modelGroup}>
          {model ? (
            <primitive object={model.scene} scale={[0.01, 0.01, 0.01]} />
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
