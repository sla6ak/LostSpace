'use client';

import { RigidBody } from '@react-three/rapier';
import React, { useRef } from 'react';
import { useSelector } from 'react-redux';
import { useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';
import { useLordKeyboardControls } from '@/hooks/useLordKeyboardControls';

const Hero = React.forwardRef((props, ref) => {
  const rigidBody = useRef<any>(null);
  const movement = useLordKeyboardControls();
  const planetName = useSelector((state: { heroSlice: any }) => state.heroSlice.planet);
  const planetSettings = useSelector((state: { planetsSlice: any }) => state.planetsSlice[planetName]);
  // console.log(planetSettings);
  // Управление героем (только x/z, y — под действием физики)
  useFrame(() => {
    if (!rigidBody.current) return;
    const rb = rigidBody.current;
    const linvel = rb.linvel();
    const direction = new Vector3(
      (movement.moveRight ? 1 : 0) - (movement.moveLeft ? 1 : 0),
      0,
      (movement.moveBackward ? 1 : 0) - (movement.moveForward ? 1 : 0)
    );
    // console.log(direction);
    if (direction.lengthSq() > 0) {
      direction.normalize().multiplyScalar(5);
      rb.setLinvel({ x: direction.x, y: linvel.y, z: direction.z }, true);
    }
  });

  // Гравитация к центру планеты
  // useFrame(() => {
  //   if (!rigidBody.current) return;
  //   const rb = rigidBody.current;
  //   const pos = rb.translation();
  //   const center = new Vector3(0, 0, 0);
  //   const position = new Vector3(pos.x, pos.y, pos.z);
  //   const direction = center.clone().sub(position);
  //   const distance = direction.length();
  //   if (distance > 0.01 && isFinite(distance)) {
  //     direction.normalize();
  //     const gravityStrength = 50;
  //     const force = direction.multiplyScalar(gravityStrength * rb.mass());
  //     rb.applyImpulse({ x: force.x, y: force.y, z: force.z }, true);
  //   }
  // });

  return (
    <RigidBody ref={rigidBody} colliders="ball" mass={1} position={[0, planetSettings.radius + 1, 0]} {...props}>
      <mesh castShadow>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color="orange" />
      </mesh>
    </RigidBody>
  );
});
Hero.displayName = 'Hero';
export default Hero;
