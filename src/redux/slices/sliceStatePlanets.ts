import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PlanetInfo {
  radius: number;
  players: string[];
  SkyTexture: string;
  BGTexture: string;
  intensity: number;
  center: { x: number; y: number; z: number };
  gravityPlanet: number;
}

interface PlanetsState {
  [planetName: string]: PlanetInfo;
}

const initialState: PlanetsState = {
  HomePlanet: {
    radius: 200,
    players: [],
    SkyTexture: 'SkyBlue.jpg',
    BGTexture: 'BGice.jpg',
    intensity: 0.7,
    center: { x: 0, y: 0, z: 0 },
    gravityPlanet: 10,
  },
  RedPlanet: {
    radius: 250,
    players: [],
    SkyTexture: 'SkyRed.jpg',
    BGTexture: 'BGstone.jpg',
    intensity: 0.7,
    center: { x: 0, y: 0, z: 0 },
    gravityPlanet: 10,
  },
  IcePlanet: {
    radius: 220,
    players: [],
    SkyTexture: 'Skydym.png',
    BGTexture: 'BGsnow1.jpg',
    intensity: 0.7,
    center: { x: 0, y: 0, z: 0 },
    gravityPlanet: 10,
  },
};

export const planetsSlice = createSlice({
  name: 'planets',
  initialState,
  reducers: {
    addPlayerToPlanet: (state, action: PayloadAction<{ planet: string; player: string }>) => {
      const { planet, player } = action.payload;
      if (state[planet] && !state[planet].players.includes(player)) {
        state[planet].players.push(player);
      }
    },
    removePlayerFromPlanet: (state, action: PayloadAction<{ planet: string; player: string }>) => {
      const { planet, player } = action.payload;
      if (state[planet]) {
        state[planet].players = state[planet].players.filter((p) => p !== player);
      }
    },
    // Можно добавить другие редьюсеры для изменения радиуса, текстур и т.д.
  },
});

export const { addPlayerToPlanet, removePlayerFromPlanet } = planetsSlice.actions;
