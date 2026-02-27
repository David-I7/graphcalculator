export type PROVIDERS = "graphCalculator" | "google";
export enum Provider {
  "graphCalculator" = 0,
  "google" = 1,
}

export type Origins =
  | "http://localhost:3000"
  | "http://localhost:8080"
  | "https://graphcalculator.xyz";
