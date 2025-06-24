'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import SpriteText from 'three-spritetext';
import { HeroWalkingModel } from '../../3DModels/HeroWalkingModel';
import { Html } from '@react-three/drei';
import './HeroPlayers.css';

export const HeroPlayers = ({ player }: { player: any }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const groupRef = useRef<THREE.Group>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const previousPosition = useRef(new THREE.Vector3());
  const [isHovered, setIsHovered] = useState(false);
  const [isMoving, setIsMoving] = useState(false);

  const handleClick = () => {
    setIsModalVisible(true);
  };

  const handlePointerOver = () => setIsHovered(true);
  const handlePointerOut = () => setIsHovered(false);

  const onAttack = (userId: string) => {
    console.log(`Атака на игрока с ID: ${userId}`);
  };

  // Закрытие модалки при клике вне
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setIsModalVisible(false);
      }
    };

    if (isModalVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isModalVisible]);

  const createTextSprite = () => {
    const sprite = new SpriteText(player.nickname);
    sprite.textHeight = 0.5;
    sprite.padding = 0.1;

    if (isHovered) {
      sprite.color = '#ffdd00';
      sprite.backgroundColor = 'rgba(0, 0, 0, 0.2)';
      sprite.borderColor = '#ff9900';
      sprite.borderRadius = 0.1;
      sprite.borderWidth = 0.1;
    } else {
      sprite.color = 'white';
      sprite.backgroundColor = 'rgba(0, 0, 0, 0)';
      sprite.borderColor = '#555';
    }

    sprite.position.set(0, 2.5, 0);
    return sprite;
  };

  useEffect(() => {
    if (!groupRef.current) return;

    groupRef.current.children.forEach((child) => {
      if (child instanceof SpriteText) {
        groupRef.current!.remove(child);
      }
    });

    const newSprite = createTextSprite();
    groupRef.current.add(newSprite);
  }, [player.nickname, isHovered]);

  useFrame(({ camera }) => {
    if (!groupRef.current) return;

    const currentPos = groupRef.current.position;
    const targetPos = new THREE.Vector3(player.position.x, player.position.y, player.position.z);
    const lerpSpeed = 0.05;
    currentPos.lerp(targetPos, lerpSpeed);

    const distance = currentPos.distanceTo(previousPosition.current);
    const movementThreshold = 0.01;
    setIsMoving(distance > movementThreshold);
    previousPosition.current.copy(currentPos);

    groupRef.current.rotation.set(player.rotation.x, player.rotation.y, player.rotation.z);

    groupRef.current.children.forEach((child) => {
      if (child instanceof SpriteText) {
        child.lookAt(camera.position);
      }
    });
  });

  return (
    <group ref={groupRef} onClick={handleClick} onPointerOver={handlePointerOver} onPointerOut={handlePointerOut}>
      {isModalVisible && (
        <Html position={[0, 1, 2]} distanceFactor={10}>
          <div className="modal-circle" ref={modalRef}>
            <button
              className="sword-button"
              onClick={() => {
                onAttack(player.userId);
                setIsModalVisible(false);
              }}
            >
              ⚔️
            </button>
          </div>
        </Html>
      )}
      <HeroWalkingModel isMoving={isMoving} scale={isHovered ? 1.3 : 1} />
    </group>
  );
};
