import { createSlice} from '@reduxjs/toolkit';
import type {PayloadAction } from '@reduxjs/toolkit';
import type { UtenteDb } from '../types/db_types';

interface UserState {
  utente: UtenteDb | null;
}

const initialState: UserState = { utente: null };

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUtente(state, action: PayloadAction<UtenteDb | null>) {
      state.utente = action.payload;
    },
    logout(state) {
      state.utente = null;
    },
  },
});

export const { setUtente, logout } = userSlice.actions;
export default userSlice.reducer;
