import { useRef, useEffect } from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import { useFrame, useThree } from '@react-three/fiber';
import { Quaternion, Vector3 } from 'three';
import { useCameraControls } from '@/hooks/useCameraControls';

const CameraFollower = ({ heroPosa, heroRota }: any) => {
  // Берём позицию/ротацию героя
  // const position = useSelector((s: any) => s.heroSlice.position, shallowEqual);
  // const rotation = useSelector((s: any) => s.heroSlice.rotation, shallowEqual);

  const position = heroPosa;
  const rotation = heroRota;
  const { camera } = useThree();
  camera.far = 1500;

  // Ссылки на сглаженные и целевые значения
  const smoothPosition = useRef(new Vector3());
  const smoothRotation = useRef(new Quaternion());
  const targetPosition = useRef(new Vector3());
  const targetRotation = useRef(new Quaternion());

  // Позиция камеры
  const cameraTargetPos = useRef(new Vector3());
  const cameraCurrentPos = useRef(new Vector3());

  // Конфиг камеры (высота и отступ)
  const cameraConfig = useRef({ height: 5, distance: -10 });

  // Одиночная инициализация
  const mounted = useRef(false);

  // Обрабатываем зум
  const zoomDelta = useCameraControls();
  useEffect(() => {
    if (zoomDelta !== 0) {
      cameraConfig.current.height = Math.max(2, Math.min(15, cameraConfig.current.height - zoomDelta * 0.5));
      cameraConfig.current.distance = Math.max(-15, Math.min(-3, cameraConfig.current.distance + zoomDelta * 0.5));
    }
  }, [zoomDelta]);

  // Однократная установка камеры при монтировании
  useEffect(() => {
    if (!mounted.current && position && rotation) {
      // Сразу копируем цели в сглаженные
      targetPosition.current.set(position.x, position.y, position.z);
      targetRotation.current.set(rotation.x, rotation.y, rotation.z, rotation.w);
      smoothPosition.current.copy(targetPosition.current);
      smoothRotation.current.copy(targetRotation.current);

      // Считаем стартовую позицию за спиной героя
      const offset = new Vector3(0, cameraConfig.current.height, cameraConfig.current.distance);
      offset.applyQuaternion(smoothRotation.current);
      cameraCurrentPos.current.copy(smoothPosition.current).add(offset);
      camera.position.copy(cameraCurrentPos.current);

      mounted.current = true;
    }
  }, []); // пустой массив — выпустится лишь один раз

  // При каждом обновлении стора обновляем только target-значения
  useEffect(() => {
    if (position) targetPosition.current.set(position.x, position.y, position.z);
    if (rotation) targetRotation.current.set(rotation.x, rotation.y, rotation.z, rotation.w);
  }, [position, rotation]);

  // Основной loop — плавное следование
  useFrame((state, delta) => {
    if (!mounted.current) return;

    const safeDelta = Math.min(Math.max(delta, 0.001), 1 / 20);
    const posLerp = 1 - Math.exp(-safeDelta);
    const rotSlerp = posLerp;

    smoothPosition.current.lerp(targetPosition.current, posLerp);
    smoothRotation.current.slerp(targetRotation.current, rotSlerp);

    // Новый таргет-пойнт камеры
    const offset = new Vector3(0, cameraConfig.current.height, cameraConfig.current.distance).applyQuaternion(
      smoothRotation.current
    );
    cameraTargetPos.current.copy(smoothPosition.current).add(offset);

    // Плавный переход камеры к этому таргету
    const dir = cameraTargetPos.current.clone().sub(cameraCurrentPos.current);
    const dist = dir.length();
    dir.normalize();
    cameraCurrentPos.current.add(dir.multiplyScalar(dist * (1 - Math.exp(-4 * safeDelta))));
    camera.position.copy(cameraCurrentPos.current);

    // Обновляем up-вектор и lookAt
    camera.up.copy(new Vector3(0, 1, 0).applyQuaternion(smoothRotation.current));
    camera.lookAt(smoothPosition.current.x, smoothPosition.current.y + 1, smoothPosition.current.z);

    // Редко пересчитываем матрицу проекции
    if (state.clock.getElapsedTime() - (camera.userData.lastProjTime || 0) > 1) {
      camera.updateProjectionMatrix();
      camera.userData.lastProjTime = state.clock.getElapsedTime();
    }
  });

  return null;
};

export default CameraFollower;
