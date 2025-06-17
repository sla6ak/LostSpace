import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { HeroState, Robot, validKeysHeroUpdate } from '../../types/store';

const initialState: HeroState = {
  nickname: '',
  position: { x: 0, y: 0, z: 0 },
  rotation: { x: 0, y: 0, z: 0, w: 0 },
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
    setHero: (state: any, action: any) => {
      validKeysHeroUpdate.forEach((key: any) => {
        if (action.payload[key] !== undefined) {
          // Для вложенных объектов используем глубокое слияние вместо замены
          if (typeof action.payload[key] === 'object' && !Array.isArray(action.payload[key])) {
            state[key] = { ...state[key], ...action.payload[key] };
          } else {
            // Примитивы и массивы заменяем полностью
            state[key] = action.payload[key] as any;
          }
        }
      });
    },
    setPosition: (state, action: PayloadAction<{ x: number; y: number; z: number }>) => {
      state.position = action.payload;
    },
    setRotation: (state, action: PayloadAction<{ x: number; y: number; z: number; w: number }>) => {
      state.rotation = action.payload;
    },
    setRobots: (state, action: PayloadAction<Robot[]>) => {
      state.robots = action.payload;
    },
    setRobotStatus: (state, action: PayloadAction<{ name: string; status: 'active' | 'repairing' | 'destroyed' }>) => {
      const robot = state.robots.find((r) => r.name === action.payload.name);
      if (robot) robot.status = action.payload.status;
    },
    // ...другие редьюсеры по необходимости
  },
});

export const { setHero, setPosition, setRotation, setRobots, setRobotStatus } = heroSlice.actions;
export default heroSlice;
