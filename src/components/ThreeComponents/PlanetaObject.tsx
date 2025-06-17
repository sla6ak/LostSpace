import React, { useMemo, useEffect } from 'react';
import { useLoader } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import { TextureLoader, RepeatWrapping, MeshStandardMaterial, SphereGeometry } from 'three';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

interface PlanetaObjectProps {
  namePlanet: string;
}

const PlanetaObject: React.FC<PlanetaObjectProps> = ({ namePlanet }) => {
  const planet = useSelector((state: RootState) => state.planetsSlice[namePlanet]);
  // console.log('players', planet.players);

  const radius = useMemo(() => planet.radius - 0.01, [planet.radius]);
  const texture = useLoader(TextureLoader, `/${planet.BGTexture}`);
  useEffect(() => {
    if (!texture) return;
    texture.wrapS = texture.wrapT = RepeatWrapping;
    texture.repeat.set(100, 100);
    texture.anisotropy = 2;
    texture.needsUpdate = true;
  }, [texture]);

  const geometry = useMemo(() => {
    const geo = new SphereGeometry(radius, 32, 32);
    geo.computeVertexNormals();
    return geo;
  }, [radius]);

  const material = useMemo(() => new MeshStandardMaterial({ map: texture, roughness: 0.8, metalness: 0.2 }), [texture]);
  if (!planet) return null;
  return (
    <>
      <ambientLight color="#beebee" intensity={planet.intensity} />
      <RigidBody type="fixed" colliders="trimesh">
        <mesh geometry={geometry} material={material} />
      </RigidBody>
    </>
  );
};

export default PlanetaObject;
