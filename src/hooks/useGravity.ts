import { useFrame } from '@react-three/fiber';
import { MutableRefObject } from 'react';
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

    // Обнуление вертикальной скорости при контакте
    if (zeroVerticalVelocity && distance - planetSettings.radius <= 0.5) {
      const lv = rb.linvel();
      rb.setLinvel({ x: lv.x, y: 0, z: lv.z }, true);
    }
  });
};
