import { createSlice} from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface ErrorState {
    genericMessage: { message: string, type: 'error' | 'warning' | 'info' } | null;
}

const initialState: ErrorState = {
    genericMessage: null,
};

const errorSlice = createSlice({
    name: 'error',
    initialState,
    reducers: {
        setGenericAlert(state, action: PayloadAction<{ message: string, type: 'error' | 'warning' | 'info' }>) {
            state.genericMessage = { message: action.payload.message, type: action.payload.type };
        },
        cleargenericMessage(state) {
            state.genericMessage = null;
        },
    },
});

export const { setGenericAlert, cleargenericMessage } = errorSlice.actions;
export default errorSlice.reducer;
