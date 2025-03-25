import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { MOBILE_BREAKPOINT } from "../../data/css/breakpoints";

function getCookie(name: string) {
  const regex = new RegExp(`(^| )${name}=([^;]*)`);
  const match = document.cookie.match(regex);
  if (match) {
    return match[2];
  }
}

interface GlobalState {
  isMobile: boolean;
  isAuthenticated: boolean;
}
const initialState: GlobalState = {
  isMobile: window.innerWidth <= MOBILE_BREAKPOINT,
  isAuthenticated: getCookie("sid") ? true : false,
};

const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    updateIsMobile: (state, action: PayloadAction<boolean>) => {
      if (state.isMobile === action.payload) return;
      state.isMobile = action.payload;
    },
    updateIsAuthenticated: (state, action: PayloadAction<boolean>) => {
      if (state.isAuthenticated === action.payload) return;
      state.isAuthenticated = action.payload;
    },
  },
});

export default globalSlice.reducer;

export const { updateIsMobile } = globalSlice.actions;
