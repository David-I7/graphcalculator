import { configureStore } from "@reduxjs/toolkit";
import globalSlice from "./global/global";
import graphSlice from "./graph/graph";
import errorSlice from "./error/error";

export const store = configureStore({
  reducer: {
    globalSlice,
    graphSlice,
    errorSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
