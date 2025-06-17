'use client';

import React from 'react';
import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const HeroPlayers = ({ player }: { player: any }) => {
  const groupRef = React.useRef<THREE.Group>(null!);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.set(player.position.x, player.position.y, player.position.z);
      groupRef.current.rotation.set(player.rotation.x, player.rotation.y, player.rotation.z);
    }
  });

  const handleClick = () => {
    alert(`Игрок: ${player.nickname}`);
    // Или вызвать свою функцию, например: openPlayerProfile(player.id)
  };

  return (
    <group ref={groupRef}>
      {/* Примитив тела персонажа */}
      <mesh>
        <boxGeometry args={[1, 2, 1]} />
        <meshStandardMaterial color="orange" />
      </mesh>

      {/* HTML-ник игрока над головой */}
      <Html
        position={[0, 1.5, 0]} // немного выше головы
        center
        distanceFactor={10} // масштабирует в зависимости от дистанции
        occlude // ник скрывается за объектами
        transform // позволяет Html "прикрепиться" к 3D
        onClick={handleClick}
        style={{
          color: 'white',
          fontWeight: 'bold',
          textShadow: '0 0 5px black',
          pointerEvents: 'auto',
          cursor: 'pointer',
        }}
      >
        {player.nickname}
      </Html>
    </group>
  );
};
