import { createSlice} from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface ErrorState {
    genericError: string | null;
}

const initialState: ErrorState = {
    genericError: null,
};

const errorSlice = createSlice({
    name: 'error',
    initialState,
    reducers: {
        setGenericError(state, action: PayloadAction<{ message: string, error: unknown }>) {
            if (action.payload.error) {
                state.genericError = "La connessione al server è stata persa. Riprova più tardi.";
            } else {
                state.genericError = action.payload.message;
            }
        },
        clearGenericError(state) {
            state.genericError = null;
        },
    },
});

export const { setGenericError, clearGenericError } = errorSlice.actions;
export default errorSlice.reducer;
