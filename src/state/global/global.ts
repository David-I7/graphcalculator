import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { MOBILE_BREAKPOINT } from "../../data/css/breakpoints";

interface GlobalState {
  isMobile: boolean;
}
const initialState: GlobalState = {
  isMobile: window.innerWidth <= MOBILE_BREAKPOINT,
};

const mobileSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    updateIsMobile: (state, action: PayloadAction<boolean>) => {
      if (state.isMobile === action.payload) return;
      state.isMobile = action.payload;
    },
  },
});

export default mobileSlice.reducer;

export const { updateIsMobile } = mobileSlice.actions;
