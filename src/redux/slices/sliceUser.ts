import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserState } from '../../types/store';

const initialState: UserState = {
  id: '',
  nikName: '',
  email: '',
  isAuth: false,
  oxigen: 0,
  position: {
    x: 0,
    y: 0,
    z: 0,
  },
  rating: 0,
  planet: 'HomePlanet',
  cristals: 0,
  energy: 0,
  bonuses: [''],
  disbonuses: [''],
  tehnologies: [''],
  qvests: [''],
  items: [''],
  robots: ['robot1', 'robot2', 'robot3'],
  specialization: '',
  data: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<Partial<UserState>>) => {
      Object.assign(state, action.payload);
      state.isAuth = true;
    },
    logout: (state) => {
      state.id = '';
      state.nikName = '';
      state.email = '';
      state.oxigen = 0;
      state.isAuth = false;
      state.rating = 0;
      state.position = {
        x: 0,
        y: 0,
        z: 0,
      };
      state.planet = 'HomePlanet';
      state.cristals = 0;
      state.energy = 0;
      state.bonuses = [''];
      state.disbonuses = [''];
      state.tehnologies = [''];
      state.qvests = [''];
      state.items = [''];
      state.robots = ['robot1', 'robot2', 'robot3'];
      state.specialization = '';
      state.data = null;
    },
  },
});

export const { setUser, logout } = userSlice.actions;
export default userSlice;
