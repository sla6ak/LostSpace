import React, { useRef } from 'react';
import { useLoader, useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import { TextureLoader, RepeatWrapping, Texture, Mesh } from 'three';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

interface PlanetaObjectProps {
  namePlanet: string;
}

const PlanetaObject: React.FC<PlanetaObjectProps> = ({ namePlanet }: any) => {
  // Получаем данные о планете из редакса
  const planet = useSelector((state: RootState) => state.planetsSlice[namePlanet]);
  // Безопасный путь для useLoader (если planet нет — подставляем существующую заглушку)
  const texturePath = planet ? `/${planet.BGTexture}` : '/BGice.jpg';
  const radius = planet?.radius || 200;
  const texture = useLoader(TextureLoader, texturePath) as Texture;
  const meshRef = useRef<Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      // meshRef.current.rotation.y += 0.0005;
    }
  });

  // Если данных о планете нет, не рендерим компонент
  if (!planet) return null;

  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(100, 100);

  return (
    <>
      <ambientLight color="#beebee" intensity={planet.intensity} />
      <RigidBody type="fixed" colliders="ball" position={[0, 0, 0]}>
        {/* Для сложных ландшафтов, зданий, неправильных форм colliders="trimesh" */}
        <mesh ref={meshRef} position={[0, 0, 0]}>
          <sphereGeometry args={[radius, 24, 24]} />
          <meshStandardMaterial map={texture} />
        </mesh>
      </RigidBody>
    </>
  );
};

export default PlanetaObject;
