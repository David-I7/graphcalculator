import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ApplicationError {
  message: string;
  type: string;
}

interface ErrorState {
  errors: {
    expressions: Record<number, ApplicationError | null>;
  };
}

const initialState: ErrorState = {
  errors: {
    expressions: {},
  },
};

const errorSlice = createSlice({
  name: "error",
  initialState,
  reducers: {
    setError: (
      state,
      action: PayloadAction<{ id: number; error: ApplicationError }>
    ) => {
      const errorRef = state.errors.expressions[action.payload.id];

      if (errorRef) {
        if (errorRef.message === action.payload.error.message) return;
        state.errors.expressions[action.payload.id] = action.payload.error;
      } else {
        state.errors.expressions[action.payload.id] = action.payload.error;
      }
    },
    clearError: (state, action: PayloadAction<number>) => {
      if (state.errors.expressions[action.payload]) {
        state.errors.expressions[action.payload] = null;
      }
    },
    destroyError: (state, action: PayloadAction<number>) => {
      if (state.errors.expressions[action.payload])
        delete state.errors.expressions[action.payload];
    },
  },
});

export default errorSlice.reducer;

export const { setError, clearError, destroyError } = errorSlice.actions;
