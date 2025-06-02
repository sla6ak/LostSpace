import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface HeroState {
  nickname: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  currentPlanet: string;
}

const initialState: HeroState = {
  nickname: '',
  position: {
    x: 0,
    y: 0,
    z: 0,
  },
  currentPlanet: 'HomePlanet',
};

const heroSlice = createSlice({
  name: 'hero',
  initialState,
  reducers: {
    setNickname: (state, action: PayloadAction<string>) => {
      state.nickname = action.payload;
    },
    setPosition: (state, action: PayloadAction<{ x: number; y: number; z: number }>) => {
      state.position = action.payload;
    },
    setCurrentPlanet: (state, action: PayloadAction<string>) => {
      state.currentPlanet = action.payload;
    },
  },
});

export const { setNickname, setPosition, setCurrentPlanet } = heroSlice.actions;
export default heroSlice;
