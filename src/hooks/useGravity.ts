import { useFrame } from '@react-three/fiber';
import { MutableRefObject, useRef } from 'react';
import { Vector3 } from 'three';
import { RigidBodyApi } from '@react-three/rapier';

interface PlanetSettings {
  center: Vector3 | { x: number; y: number; z: number };
  radius: number;
  gravityPlanet?: number;
  minRadius?: number;
}

interface GravityOptions {
  safeDeltaMax?: number;
  zeroVerticalVelocity?: boolean;
}

export const useGravity = (
  rigidBodyRef: MutableRefObject<RigidBodyApi | null>,
  planetSettings: PlanetSettings,
  options: GravityOptions = {}
) => {
  // Значения по умолчанию
  const { safeDeltaMax = 1 / 20, zeroVerticalVelocity = true } = options;

  // Векторы для вычислений (создаём один раз)
  const centerVec = new Vector3();
  const toCenter = new Vector3();
  const gravityForce = new Vector3();
  // Добавляем векторы для расчета направления
  // const radialDir = useRef(new Vector3());
  // const velocity = useRef(new Vector3());
  // const radialVelocity = useRef(new Vector3());
  // const tangentialVelocity = useRef(new Vector3());

  const debugDataRef = useRef({
    frameCount: 0,
    lastLog: 0,
  });

  useFrame((state, delta) => {
    const rb = rigidBodyRef.current;
    if (!rb) return;

    // Защита от скачков FPS
    const safeDelta = Math.min(Math.max(delta, 0.001), safeDeltaMax);

    // Обновляем центр планеты
    if (planetSettings.center instanceof Vector3) {
      centerVec.copy(planetSettings.center);
    } else {
      centerVec.set(planetSettings.center.x, planetSettings.center.y, planetSettings.center.z);
    }

    // Вычисляем вектор к центру
    const position = rb.translation();
    toCenter.subVectors(centerVec, position);
    const distance = toCenter.length();

    // console.log('position', position);

    // ==============================
    // ПОДНИМАЕМ ПЕРСОНАЖА НА ПОВЕРХНОСТЬ ЕСЛИ ПОД ЗЕМЛЁЙ
    const tolerance = 1;
    const centerThreshold = 0.01; // почти 0
    // Игрок под землей (в том числе в центре планеты)
    const isTooDeep = distance < planetSettings.radius - tolerance;
    const isInCenter = distance < centerThreshold;
    if (isTooDeep || isInCenter) {
      // Если в центре — направляем вверх как запасной вариант
      const direction = distance > centerThreshold ? new Vector3().copy(toCenter).normalize() : new Vector3(0, 1, 0); // экстренно вверх

      const surfacePoint = new Vector3()
        .copy(centerVec)
        .add(direction.multiplyScalar(planetSettings.radius + tolerance));

      rb.setTranslation(surfacePoint, true);
      rb.setLinvel({ x: 0, y: 0, z: 0 }, true); // гасим скорость, чтобы не падал обратно
    }
    // ==============================

    // Рассчитываем силу гравитации
    const gravityStrength = planetSettings.gravityPlanet || 10;
    const minRadius = planetSettings.minRadius || 0.5;
    const r = Math.max(distance, minRadius);
    const magnitude = (gravityStrength * rb.mass()) / (r * r);

    // Применяем силу
    gravityForce
      .copy(toCenter)
      .normalize()
      .multiplyScalar(magnitude * safeDelta);

    rb.addForce(gravityForce, true);

    // Обнуление РАДИАЛЬНОЙ скорости при контакте
    // if (zeroVerticalVelocity && distance - planetSettings.radius <= 0.5) {
    //   // 1. Получаем направление к центру планеты (радиальное направление)
    //   radialDir.current.copy(toCenter).normalize();

    //   // 2. Получаем текущую скорость тела
    //   const currentVelocity = rb.linvel();
    //   velocity.current.set(currentVelocity.x, currentVelocity.y, currentVelocity.z);

    //   // 3. Вычисляем проекцию скорости на радиальное направление
    //   const dotProduct = velocity.current.dot(radialDir.current);
    //   radialVelocity.current.copy(radialDir.current).multiplyScalar(dotProduct);

    //   // 4. Вычисляем тангенциальную составляющую (перпендикулярную радиусу)
    //   tangentialVelocity.current.copy(velocity.current).sub(radialVelocity.current);

    //   // 5. Устанавливаем только тангенциальную скорость
    //   rb.setLinvel(
    //     {
    //       x: tangentialVelocity.current.x,
    //       y: tangentialVelocity.current.y,
    //       z: tangentialVelocity.current.z,
    //     },
    //     true
    //   );
    // }

    // Логирование (каждые 2 секунды)
    // Настройки логирования (раз в 2 секунды)
    const now = Date.now();
    const logInterval = 2000;
    const debugData = debugDataRef.current;
    debugData.frameCount++;
    if (now - debugData.lastLog > logInterval) {
      // СБРАСЫВАЕМ СИЛЫ ПЕРЕД РАСЧЕТОМ НОВОЙ ГРАВИТАЦИИ
      rb.resetForces(true);
      // console.group(`Gravity Debug (Frame ${debugData.frameCount})`);
      // console.log('Body position:', position);
      // console.log('Planet center:', centerVec);
      // console.log('Distance to center:', distance);
      // console.log('Calculated gravity magnitude:', magnitude);
      // console.log('Applied force vector:', gravityForce.clone());
      // console.log('Body mass:', rb.mass());
      // console.log('Min used radius:', r);
      // console.log('Delta time:', safeDelta);
      // console.groupEnd();
      debugData.lastLog = now;
    }
  });
};
