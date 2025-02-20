import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  nextId: 2,
};

const nextIdSlice = createSlice({
  name: "nextId",
  initialState,
  reducers: {
    incrementNextId: (state) => {
      state.nextId += 1;
    },
  },
});

export default nextIdSlice.reducer;

export const { incrementNextId } = nextIdSlice.actions;
