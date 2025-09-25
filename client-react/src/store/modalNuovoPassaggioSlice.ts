import { createSlice } from '@reduxjs/toolkit';

interface ModalNuovoPassaggioState {
  isOpen: boolean;
}

const initialState: ModalNuovoPassaggioState = {
  isOpen: false,
};

const modalNuovoPassaggioSlice = createSlice({
  name: 'modalNuovoPassaggio',
  initialState,
  reducers: {
    openModal(state) {
      state.isOpen = true;
    },
    closeModal(state) {
      state.isOpen = false;
    },
  },
});

export const { openModal, closeModal } = modalNuovoPassaggioSlice.actions;
export default modalNuovoPassaggioSlice.reducer;