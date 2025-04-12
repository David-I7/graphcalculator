import { PredefinedColors } from "@graphcalculator/types";

export const CSS_VARIABLES = {
  // TEXT || BUTTONS || ICONS
  primary: "#3d5cc2",
  secondary: "#4d4d4d",
  onPrimary: "#f0f0f0",
  onSecondary: "#f0f0f0",
  error: "#c74440",

  // Inverse (contrasting effects)
  inverseSurface: "black",
  inverseOnSurfaceBody: "#AAAAAA",
  inverseOnSurfaceHeading: "#F0F0F0",
  inversePrimary: "",
  inverseOnPrimary: "",

  // CONTAINERS (lower emphasis than their non-container values)
  primaryContainer: "#99aff7",
  primaryContainerVarient: "#ccd7fb",
  secondaryContainer: "#a8a8a8",
  onPrimaryContainer: "#0f0f0f",
  onSecondaryContainer: "#0f0f0f",

  // SURFACE (large areas, such as navbars)
  surface: "white",
  surfaceContainerLow: "#ececec",
  surfaceContainer: "#bcbcbc",
  surfaceContainerHigh: "#aaaaaa",
  onSurfaceBodyLow: "#7a7a7a",
  onSurfaceBody: "#606060",
  onSurfaceBodyHigh: "#404040",
  onSurfaceHeading: "#0f0f0f",

  // BORDER
  borderLowest: "#7f7f7f",
  borderLow: "#606060",
  borderNormal: "#404040",
  borderHigh: "#0f0f0f",

  // SHADOW
  shadowLevel1: "rgba(0,0,0,0.15)",
  shadowLevel2: "rgba(0,0,0,0.30)",

  // SCRIM
  scrim: "rgba(0,0,0,0.38)",
  scrimLight: "rgba(255,255,255,0.62)",

  // ANIMATION
  animationSpeedFast: 150,
  animationSpeedDefault: 250,
  animationSpeedSlow: 350,
  animationSpeedSlowest: 750,
};

export const PREDEFINED_COLORS: PredefinedColors = [
  `#c74440`, // red
  `#fa7e19`, // orange
  `#e5d438`, //yellow
  `hsl(144,50%,50%)`, //green
  `hsl(257,60%,65%)`, //purple
  `#000`, //black
];
