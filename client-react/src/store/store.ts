import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import giradischiReducer from './giradischiSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    giradischi: giradischiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
