import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface ModalPassaggioState {
  idPassaggio: number | null;
  isOpen: boolean;
}

const initialState: ModalPassaggioState = {
  idPassaggio: null,
  isOpen: false,
};

const modalPassaggioSlice = createSlice({
  name: 'modalPassaggio',
  initialState,
  reducers: {
    openModal(state, action: PayloadAction<number>) {
      state.idPassaggio = action.payload;
      state.isOpen = true;
    },
    closeModal(state) {
      state.isOpen = false;
      state.idPassaggio = null;
    },
    setIdPassaggio(state, action: PayloadAction<number | null>) {
      state.idPassaggio = action.payload;
    },
  },
});

export const { openModal, closeModal, setIdPassaggio } = modalPassaggioSlice.actions;
export default modalPassaggioSlice.reducer;
