import { configureStore } from "@reduxjs/toolkit";
import globalSlice from "./global/global";
import graphSlice from "./graph/graph";
import nextIdSlice from "./graph/nextId";

export const store = configureStore({
  reducer: {
    globalSlice,
    graphSlice,
    nextIdSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
