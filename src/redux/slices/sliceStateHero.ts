import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { HeroState, Robot } from '../../types/store';

const initialState: HeroState = {
  nickname: '',
  position: { x: 0, y: 0, z: 0 },
  rotation: { x: 0, y: 0, z: 0 },
  planet: 'HomePlanet',
  oxigen: 0,
  rating: 0,
  cristals: 0,
  energy: 0,
  bonuses: [],
  disbonuses: [],
  qvests: [],
  items: [],
  robots: [],
  specialization: '',
  data: null,
  online: false,
  updatedAt: '',
};

const heroSlice = createSlice({
  name: 'hero',
  initialState,
  reducers: {
    setHero: (state, action: PayloadAction<Partial<HeroState>>) => {
      Object.assign(state, action.payload);
    },
    setPosition: (state, action: PayloadAction<{ x: number; y: number; z: number }>) => {
      state.position = action.payload;
    },
    setRotation: (state, action: PayloadAction<{ x: number; y: number; z: number }>) => {
      state.rotation = action.payload;
    },
    setRobots: (state, action: PayloadAction<Robot[]>) => {
      state.robots = action.payload;
    },
    setRobotStatus: (state, action: PayloadAction<{ name: string; status: 'active' | 'repairing' | 'destroyed' }>) => {
      const robot = state.robots.find(r => r.name === action.payload.name);
      if (robot) robot.status = action.payload.status;
    },
    // ...другие редьюсеры по необходимости
  },
});

export const { setHero, setPosition, setRotation, setRobots, setRobotStatus } = heroSlice.actions;
export default heroSlice;
