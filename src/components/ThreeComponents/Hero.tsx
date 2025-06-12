'use client';

import { RigidBody, RigidBodyApi, CapsuleCollider, BallCollider, Debug } from '@react-three/rapier';
import React, { useRef, Suspense } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useFrame } from '@react-three/fiber';
import { Group, Vector3, Euler, Quaternion, Matrix4 } from 'three';
import { useLordKeyboardControls } from '@/hooks/useLordKeyboardControls';
import { setPosition, setRotation } from '@/redux/slices/sliceStateHero';
import { useGLTF } from '@react-three/drei';

const Hero = React.forwardRef<Group>((props, ref) => {
  const model = useGLTF('/models/heroAnimations/format/Walking2.glb');
  const modelGroup = useRef<Group>(null);
  const dispatch = useDispatch();
  const rigidBody = useRef<RigidBodyApi>(null);
  const movement = useLordKeyboardControls();
  const planetName = useSelector((state: { heroSlice: any }) => state.heroSlice.planet);
  const planetSettings = useSelector((state: { planetsSlice: any }) => state.planetsSlice[planetName]);

  // Настройки движения
  const moveSpeed = 50;
  const rotationSpeed = 3;

  useFrame(() => {
    if (!rigidBody.current) return;
    const rb = rigidBody.current;

    // 1) Текущая позиция и вектор к центру
    const pos = new Vector3().copy(rb.translation());
    const center = new Vector3(planetSettings.center.x, planetSettings.center.y, planetSettings.center.z);
    const toCenter = new Vector3().subVectors(center, pos);

    // 2) Расстояние
    const distance = toCenter.length();

    // 3) Сам закон 1/r² с «минимальным радиусом» 0.5
    const gravityStrength = planetSettings.gravityPlanet || 10;
    const r = Math.max(distance, 0.5);
    const magnitude = (gravityStrength * rb.mass()) / (r * r);

    // 4) Сама сила (направление + модуль)
    const gravityForce = toCenter.normalize().multiplyScalar(magnitude);
    rb.addForce(gravityForce, true);

    // 5) Обнуление вертикальной скорости при контакте
    if (distance - planetSettings.radius <= 0.5) {
      const lv = rb.linvel();
      rb.setLinvel({ x: lv.x, y: 0, z: lv.z }, true);
    }
  });

  useFrame((state, delta) => {
    if (!rigidBody.current || !modelGroup.current) return;
    const rb = rigidBody.current;
    const model = modelGroup.current;

    // === Вычисляем локальный up-вектор ===
    const pos = new Vector3().copy(rb.translation());
    const center = new Vector3(planetSettings.center.x, planetSettings.center.y, planetSettings.center.z);
    const toCenter = new Vector3().subVectors(center, pos).normalize();
    const up = toCenter.clone().negate();

    // === Вращение модели клавишами (вдоль up) ===
    let modelQuat = model.quaternion.clone();
    if (movement.moveLeft || movement.moveRight) {
      const dir = movement.moveLeft ? 1 : -1;
      const angle = dir * rotationSpeed * delta;
      const q = new Quaternion().setFromAxisAngle(up, angle);
      modelQuat.premultiply(q);
    }

    // === Тангенциальный forward и выравнивание ногами вниз ===
    // 1) берем локальный forward
    const forward = new Vector3(0, 0, -1).applyQuaternion(modelQuat);
    // 2) убираем компоненту вдоль up — получаем касательную проекцию
    const forwardTangent = forward
      .clone()
      .sub(up.clone().multiplyScalar(forward.dot(up)))
      .normalize();
    // 3) на её основе строим нормали basis
    const right = new Vector3().crossVectors(up, forwardTangent).normalize();
    const correctedForward = new Vector3().crossVectors(right, up).normalize();
    // 4) формируем итоговую ориентацию (ногами вниз, forward вдоль correctedForward)
    const alignQuat = new Quaternion().setFromRotationMatrix(new Matrix4().makeBasis(right, up, correctedForward));
    // 5) плавно сливаем с управлением
    modelQuat = new Quaternion().slerpQuaternions(modelQuat, alignQuat, 0.1);
    model.quaternion.copy(modelQuat);

    // === Движение по касательной ===
    const moveDir = new Vector3();
    if (movement.moveForward) moveDir.add(correctedForward);
    if (movement.moveBackward) moveDir.sub(correctedForward);

    if (moveDir.lengthSq() > 0) {
      moveDir.normalize().multiplyScalar(moveSpeed);
    }

    // Применяем скорость целиком, включая Y
    const lv = rb.linvel();
    const targetLv = new Vector3(moveDir.x, moveDir.y, moveDir.z);
    const smoothLv = new Vector3().lerpVectors(lv, targetLv, 0.2);

    if (isFinite(smoothLv.x) && isFinite(smoothLv.y) && isFinite(smoothLv.z)) {
      rb.setLinvel({ x: smoothLv.x, y: smoothLv.y, z: smoothLv.z }, true);
    }

    // === Синхронизация Redux ===
    const newPos = rb.translation();
    dispatch(setPosition({ x: newPos.x, y: newPos.y, z: newPos.z }));
    const q = model.quaternion;
    dispatch(setRotation({ x: q.x, y: q.y, z: q.z, w: q.w }));
  });
  return (
    <Suspense fallback={null}>
      <RigidBody
        ref={rigidBody}
        colliders={false}
        mass={1}
        linearDamping={1.5}
        angularDamping={2}
        enabledRotations={[true, true, true]}
        position={[
          55,
          planetSettings.center.y + planetSettings.radius + 2, // запас по Y
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
