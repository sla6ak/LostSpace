import { useThree, useFrame } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const CameraBattle = () => {
  const { camera, set } = useThree();
  const battleCam = useRef();

  useEffect(() => {
    // Устанавливаем параметры боевой камеры
    camera.position.set(0, 10, 15); // сверху и немного под углом
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    camera.updateProjectionMatrix();
  }, [camera]);

  return null; // ничего не рендерим, просто настраиваем
};
