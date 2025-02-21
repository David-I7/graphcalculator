import { createSlice } from "@reduxjs/toolkit";

interface ErrorState {
  type: "";
}

const errorSlice = createSlice({
  name: "error",
  initialState: {},
  reducers: {},
});

export default errorSlice.reducer;

export const {} = errorSlice.actions;
