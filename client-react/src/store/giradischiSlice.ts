import { createSlice} from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { BranoDb } from '../types/db_types';

interface GiradischiState {
  brano1: BranoDb | null;
  brano2: BranoDb | null;
}

const initialState: GiradischiState = { brano1: null, brano2: null };

const giradischiSlice = createSlice({
  name: 'giradischi',
  initialState,
  reducers: {
    setBrano1(state, action: PayloadAction<BranoDb | null>) {
      state.brano1 = action.payload;
      localStorage.setItem('brano1', JSON.stringify(action.payload));
    },
    setBrano2(state, action: PayloadAction<BranoDb | null>) {
      state.brano2 = action.payload;
      localStorage.setItem('brano2', JSON.stringify(action.payload));
    },
    resetGiradischi(state) {
      state.brano1 = null;
      state.brano2 = null;
    },
  },
});

export const { setBrano1, setBrano2, resetGiradischi } = giradischiSlice.actions;
export default giradischiSlice.reducer;
