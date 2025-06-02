import React, { useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { BackSide, TextureLoader, Mesh } from 'three';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

const SkyObject = ({ namePlanet }: { namePlanet: string }) => {
  // Получаем данные о планете из Redux
  const planet = useSelector((state: RootState) => state.planetsSlice[namePlanet]);

  // Устанавливаем путь к текстуре или значение по умолчанию
  const texturePath = planet ? `/${planet.SkyTexture}` : '';

  // Загружаем текстуру
  const textureCosmos = useLoader(TextureLoader, texturePath);
  const ref = useRef<Mesh>(null);

  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.x += 0.000016;
      ref.current.rotation.y += 0.00004;
    }
  });

  // Если данных о планете нет, возвращаем null
  if (!planet) return null;

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[1000, 10, 10]} />
      <meshStandardMaterial map={textureCosmos} side={BackSide} fog={true} />
    </mesh>
  );
};

export default SkyObject;
