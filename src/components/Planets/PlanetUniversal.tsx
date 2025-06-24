'use client';

import React, { Suspense } from 'react';
// ************* Модели на планету ************************************
import SkyObject from '../ThreeComponents/SkyObject';
import PlanetaObject from '../ThreeComponents/PlanetaObject';
import { useSelector } from 'react-redux';
import { HeroPlayers } from '../ThreeComponents/HeroPlayers';

export default function PlanetUniversal(getModel: any) {
  const heroSlice = useSelector((state: { heroSlice: any }) => state.heroSlice);
  const namePlanet = heroSlice.planet || 'HomePlanet';
  const planetSettings = useSelector((state: { planetsSlice: any }) => state.planetsSlice[namePlanet]);
  const nickname = heroSlice.nickname;
  const players = planetSettings.players || {};
  // Преобразуем объект в массив и фильтруем
  const filteredPlayers = Object.values(players).filter(
    (player: any) => player.online && player.planet === namePlanet && player.nickname !== nickname
  );
  return (
    <Suspense fallback={null}>
      <SkyObject namePlanet={namePlanet} />
      <PlanetaObject namePlanet={namePlanet} />
      {/* Рендер персонажей других игроков */}
      {filteredPlayers.map((player: any) => (
        <HeroPlayers key={player.nickname} player={player} />
      ))}
    </Suspense>
  );
}
