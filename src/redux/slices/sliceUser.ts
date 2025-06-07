import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserState } from '../../types/store';

const initialState: UserState = {
  id: '',
  nikName: '',
  email: '',
  online: false,
  registrationDate: '',
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<Partial<UserState>>) => {
      Object.assign(state, action.payload);
      state.online = true;
    },
    logout: (state) => {
      state.id = '';
      state.nikName = '';
      state.email = '';
      state.online = false;
      state.registrationDate = '';
    },
  },
});

export const { setUser, logout } = userSlice.actions;
export default userSlice;
