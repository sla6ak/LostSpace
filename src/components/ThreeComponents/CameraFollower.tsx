import { useSelector } from 'react-redux';
import { useFrame, useThree } from '@react-three/fiber';
import { useRef } from 'react';

const CameraFollower = () => {
  const position = useSelector((state: any) => state.heroSlice.position);
  const rotation = useSelector((state: any) => state.heroSlice.rotation);
  const { camera } = useThree();
  const lastPos = useRef({ x: 0, y: 0, z: 0 });
  camera.far = 1500; // Устанавливаем дальность обзора камеры
  useFrame(() => {
    // console.log(position);
    if (position) {
      // Плавное следование камеры за героем
      const cameraOffset = { x: 0, y: 1, z: -5 };
      const target = {
        x: position.x + cameraOffset.x,
        y: position.y + cameraOffset.y,
        z: position.z + cameraOffset.z,
      };
      camera.position.lerp({ ...camera.position, ...target }, 0.15);
      camera.lookAt(position.x, position.y, position.z);
      lastPos.current = position;
    }
    if (rotation) {
      //   camera.rotation.set(rotation.x, rotation.y, rotation.z);
    }
    camera.updateProjectionMatrix();
  });

  return null;
};

export default CameraFollower;
