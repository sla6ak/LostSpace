import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PlanetInfo {
  radius: number;
  players: string[];
  SkyTexture: string;
  BGTexture: string;
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
  },
  RedPlanet: {
    radius: 250,
    players: [],
    SkyTexture: 'SkyRed.jpg',
    BGTexture: 'BGstone.jpg',
  },
  IcePlanet: {
    radius: 220,
    players: [],
    SkyTexture: 'Skydym.png',
    BGTexture: 'BGsnow1.jpg',
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
