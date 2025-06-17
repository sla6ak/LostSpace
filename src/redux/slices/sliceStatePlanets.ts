import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PlanetInfo {
  radius: number;
  players: object;
  SkyTexture: string;
  BGTexture: string;
  intensity: number;
  intensityColor: string;
  center: { x: number; y: number; z: number };
  gravityPlanet: number;
}

interface PlanetsState {
  [planetName: string]: PlanetInfo;
}

const initialState: PlanetsState = {
  HomePlanet: {
    radius: 200,
    players: {},
    SkyTexture: 'SkyBlue.jpg',
    BGTexture: 'BGtr.jpg',
    intensity: 0.9,
    intensityColor: '#beebee',
    center: { x: 0, y: 0, z: 0 },
    gravityPlanet: 30000,
  },
  RedPlanet: {
    radius: 250,
    players: {},
    SkyTexture: 'SkyRed.jpg',
    BGTexture: 'BGstone.jpg',
    intensity: 0.7,
    intensityColor: '#beebee',
    center: { x: 0, y: 0, z: 0 },
    gravityPlanet: 10000,
  },
  IcePlanet: {
    radius: 220,
    players: {},
    SkyTexture: 'Skydym.png',
    BGTexture: 'BGsnow1.jpg',
    intensity: 0.7,
    intensityColor: '#beebee',
    center: { x: 0, y: 0, z: 0 },
    gravityPlanet: 10000,
  },
};

export const planetsSlice = createSlice({
  name: 'planets',
  initialState,
  reducers: {
    updatePlayersPlanet: (state, action: PayloadAction<Record<string, any>>) => {
      // Получаем первого игрока из объекта
      const players = action.payload;

      const playerKeys = Object.keys(players);

      if (playerKeys.length === 0) {
        console.log('Нет игроков в action.payload');
        return;
      }

      // Берем первого игрока (любого, так как порядок не гарантирован)
      const firstPlayerKey = playerKeys[0];
      const firstPlayer = players[firstPlayerKey];

      // Извлекаем название планеты
      const planetName = firstPlayer.planet;
      // console.log('Планета первого игрока:', planetName);

      // Если планета не существует в состоянии, выходим
      if (!state[planetName]) {
        return;
      }

      // Обновляем данные игроков для планеты
      state[planetName].players = players;
    },
  },
});

export const { updatePlayersPlanet } = planetsSlice.actions;
