import { useSelector } from 'react-redux';
import { useFrame, useThree } from '@react-three/fiber';
import { Quaternion, Vector3 } from 'three';

const CameraFollower = () => {
  const position = useSelector((state: any) => state.heroSlice.position);
  const rotation = useSelector((state: any) => state.heroSlice.rotation);
  const { camera } = useThree();
  camera.far = 1500;

  useFrame((state, delta) => {
    // 4) Защита от скачков FPS
    const safeDelta = Math.min(Math.max(delta, 0.001), 1 / 20); // Ограничиваем максимальное значение delta
    const { camera } = state;
    if (position && rotation) {
      // 1) Вычисляем смещение в мировых координатах
      const offset = new Vector3(0, 5, -9);
      const quat = new Quaternion(rotation.x, rotation.y, rotation.z, rotation.w);
      offset.applyQuaternion(quat);

      // 2) Вычисляем up-вектор героя для камеры
      const cameraUp = new Vector3(0, 1, 0).applyQuaternion(quat);

      // 3) Целевая позиция камеры = позиция героя + оффсет
      const targetPos = new Vector3(position.x, position.y, position.z).add(offset);

      // 4) Интерполируем текущую позицию к целевой с учётом delta
      //    Скорость слежения: чем больше множитель, тем быстрее камера «догоняет»
      const followSpeed = 5;
      camera.position.lerp(targetPos, safeDelta * followSpeed);

      // 5) Плавно обновляем up-вектор камеры
      camera.up.lerp(cameraUp, safeDelta * followSpeed);

      // 6) Смотрим на героя (не забываем прибавить вертикальный оффсет, если нужно)
      camera.lookAt(position.x, position.y + 1, position.z);
    }

    // Обновляем матрицу проекции (не зависит от delta, но нужен при любых изменениях)
    camera.updateProjectionMatrix();
  });

  return null;
};

export default CameraFollower;
