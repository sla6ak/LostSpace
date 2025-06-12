import { useSelector } from 'react-redux';
import { useFrame, useThree } from '@react-three/fiber';
import { Quaternion, Vector3 } from 'three';

const CameraFollower = () => {
  const position = useSelector((state: any) => state.heroSlice.position);
  const rotation = useSelector((state: any) => state.heroSlice.rotation);
  const { camera } = useThree();
  camera.far = 1500;

  useFrame(() => {
    if (position && rotation) {
      // 1) Compute offset in world space
      const offset = new Vector3(0, 5, -9);
      const quat = new Quaternion(rotation.x, rotation.y, rotation.z, rotation.w);
      offset.applyQuaternion(quat);

      // 2) Compute hero's “up” vector
      const cameraUp = new Vector3(0, 1, 0).applyQuaternion(quat);

      // 3) Lerp camera position toward hero + offset
      const targetPos = new Vector3(position.x, position.y, position.z).add(offset);
      camera.position.lerp(targetPos, 0.1);

      // 4) Update camera.up so it follows hero’s up …
      camera.up.copy(cameraUp);
      // 5) … then look back at the hero
      camera.lookAt(position.x, position.y + 1, position.z);
    }

    camera.updateProjectionMatrix();
  });

  return null;
};

export default CameraFollower;
