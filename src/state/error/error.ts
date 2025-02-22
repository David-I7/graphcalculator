import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Error {
  message: string;
  type: string;
}

interface ErrorState {
  errors: Record<number, Error | null>;
}

const initialState: ErrorState = {
  errors: {},
};

const errorSlice = createSlice({
  name: "error",
  initialState,
  reducers: {
    setError: (state, action: PayloadAction<{ id: number; error: Error }>) => {
      const errorRef = state.errors[action.payload.id];

      if (errorRef) {
        if (errorRef.message === action.payload.error.message) return;
        state.errors[action.payload.id] = action.payload.error;
      } else {
        state.errors[action.payload.id] = action.payload.error;
      }
    },
    clearError: (state, action: PayloadAction<number>) => {
      if (state.errors[action.payload]) {
        state.errors[action.payload] = null;
      }
    },
    destroyError: (state, action: PayloadAction<number>) => {
      if (state.errors[action.payload]) delete state.errors[action.payload];
    },
  },
});

export default errorSlice.reducer;

export const { setError, clearError } = errorSlice.actions;
