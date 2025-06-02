'use client';

import React, { Suspense } from 'react';

// ************* Модели на планету ************************************
import SkyObject from '../ThreeComponents/SkyObject';
import PlanetaObject from '../ThreeComponents/PlanetaObject';

// ************** Конфигурации для пропсов ****************************
// import SkyTexture from '../../../public/SkyBlue.jpg';
// import BGTexture from '../../../public/BGice.jpg';
// *****************************************************************************************

export default function Planet3() {
  const namePlanet = 'HomePlanet';
  const boxes = [];
  for (let i = 0; i <= 10; i++) {
    boxes.push(i);
  }
  function randomCount(max: number) {
    return Math.floor(Math.random() * max);
  }
  return (
    <Suspense fallback={null}>
      <ambientLight color="#beebee" intensity={0.5} />
      <pointLight color="#f1eec3" intensity={1} position={[-54, 200, 0]} />
      <SkyObject namePlanet={namePlanet} />
      <PlanetaObject namePlanet={namePlanet} />
    </Suspense>
  );
}
