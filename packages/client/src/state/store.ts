import { configureStore } from "@reduxjs/toolkit";
import globalSlice from "./global/global";
import graphSlice from "./graph/graph";
import apiSlice from "./api/apiSlice";

export const store = configureStore({
  reducer: {
    globalSlice,
    graphSlice,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
