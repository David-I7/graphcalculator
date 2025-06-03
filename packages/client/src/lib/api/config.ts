import { Origins } from "@graphcalculator/types";

export const baseUrl = "https://graphcalculator.xyz/api";
export const SAVED_GRAPHS_LIMIT = 25;
export const ORIGINS: Origins[] = [
  "http://localhost",
  "https://graphcalculator.xyz",
] as const;
