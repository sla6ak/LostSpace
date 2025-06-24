'use client';

import React from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { CameraBattle } from '../ThreeComponents/CameraBattle';
import { OrbitControls } from '@react-three/drei';
// import { RobotDummy } from './RobotDummy'; // временный компонент робота-заглушки

// Позиции роботов по сторонам
const getRobotPositions = (count: number, side = 'player') => {
  const spacing = 2.5;
  const offset = (count - 1) * spacing * 0.5;
  return Array.from({ length: count }, (_, i) => {
    const x = i * spacing - offset;
    const z = side === 'player' ? -5 : 5;
    return new THREE.Vector3(x, 0, z);
  });
};

export const BattleArena = ({ playerRobots = 3, enemyRobots = 3 }) => {
  const playerPositions = getRobotPositions(playerRobots, 'player');
  const enemyPositions = getRobotPositions(enemyRobots, 'enemy');

  return (
    <group>
      <ambientLight color="#beebee" intensity={0.8} />
      <CameraBattle />
      {/* <OrbitControls target={[0, 0, 0]} minDistance={5} maxDistance={20} /> */}
      {/* Основание */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#777" />
      </mesh>
      {/* Роботы игрока */}
      {playerPositions.map((pos, idx) => (
        <group key={`player-robot-${idx}`} position={pos}>
          {/* <RobotDummy color="orange" label={`R${idx + 1}`} /> */}
        </group>
      ))}
      {/* Роботы соперника */}
      {enemyPositions.map((pos, idx) => (
        <group key={`enemy-robot-${idx}`} position={pos}>
          {/* <RobotDummy color="red" label={`E${idx + 1}`} /> */}
        </group>
      ))}
    </group>
  );
};
