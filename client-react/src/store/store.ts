import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import giradischiReducer from './giradischiSlice';
import modalPassaggioReducer from './modalPassaggioSlice';
import modalNuovoPassaggioReducer from './modalNuovoPassaggioSlice';
import errorReducer from './errorSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    giradischi: giradischiReducer,
    modalPassaggio: modalPassaggioReducer,
    modalNuovoPassaggio: modalNuovoPassaggioReducer,
    error: errorReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
