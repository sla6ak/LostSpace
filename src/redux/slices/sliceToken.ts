import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState = '';

export const currentToken = createSlice({
  name: 'token',
  initialState: initialState,
  reducers: {
    newToken(_state, action: PayloadAction<string>) {
      return action.payload;
    },
  },
});

export const { newToken } = currentToken.actions;
