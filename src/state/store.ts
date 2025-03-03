import { configureStore } from "@reduxjs/toolkit";
import globalSlice from "./global/global";
import graphSlice from "./graph/graph";

export const store = configureStore({
  reducer: {
    globalSlice,
    graphSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
