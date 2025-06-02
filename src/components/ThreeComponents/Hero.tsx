'use client';

import { useSphere } from '@react-three/cannon';
import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3, Mesh } from 'three';
import { useLordKeyboardControls } from '@/hooks/useLordKeyboardControls';

const Hero = forwardRef<Mesh, {}>((props, ref) => {
  const [localRef, api] = useSphere<Mesh>(() => ({
    type: 'Dynamic',
    mass: 1,
    position: [0, 5, 0],
    args: [1],
  }));
  const velocity = useRef([0, 0, 0]);
  const movement = useLordKeyboardControls();

  // Прокидываем ref наружу для камеры
  useImperativeHandle(ref, () => localRef.current as Mesh, [localRef]);

  // Получаем скорость из физики
  useEffect(() => {
    const unsubscribe = api.velocity.subscribe((v) => (velocity.current = v));
    return unsubscribe;
  }, [api.velocity]);

  // Управление героем (без управления камерой!)
  useFrame(() => {
    const direction = new Vector3(
      (movement.moveRight ? 1 : 0) - (movement.moveLeft ? 1 : 0),
      0,
      (movement.moveBackward ? 1 : 0) - (movement.moveForward ? 1 : 0)
    );
    if (direction.lengthSq() > 0) {
      direction.normalize().multiplyScalar(5);
      api.velocity.set(direction.x, velocity.current[1], direction.z);
    }
  });

  return (
    <mesh ref={localRef} castShadow>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  );
});
Hero.displayName = 'Hero';
export default Hero;
