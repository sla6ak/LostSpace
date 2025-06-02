import React from 'react';
import { useLoader, useFrame } from '@react-three/fiber';
import { useSphere } from '@react-three/cannon';
import { TextureLoader, RepeatWrapping, Mesh, Texture } from 'three';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

interface PlanetaObjectProps {
  namePlanet: string;
}

const PlanetaObject: React.FC<PlanetaObjectProps> = ({ namePlanet }) => {
  // Получаем данные о планете из редакса
  const planet = useSelector((state: RootState) => state.planetsSlice[namePlanet]);

  // Устанавливаем значения по умолчанию, если данных о планете нет
  const texturePath = planet ? `/` + planet.BGTexture : '';
  const radius = planet?.radius || 1;

  // Загружаем текстуру
  const texture = useLoader(TextureLoader, texturePath) as Texture;

  // Статическая сфера в центре карты
  const [ref] = useSphere<Mesh>(() => ({
    type: 'Static',
    position: [0, 0, 0],
    args: [radius], // радиус планеты
  }));

  // Медленное вращение планеты (опционально)
  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y += 0.0005;
    }
  });

  // Если данных о планете нет, возвращаем null
  if (!planet) return null;

  // Настройка текстуры (опционально, если нужна "бесконечная" текстура)
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(1, 1);

  return (
    <mesh ref={ref} position={[0, 0, 0]}>
      <sphereGeometry args={[radius, 50, 50]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
};

export default PlanetaObject;
