import { Origins } from "@graphcalculator/types";

//https://graphcalculator.xyz/api
export const baseUrl = "http://localhost:80/api";
export const SAVED_GRAPHS_LIMIT = 25;
export const ORIGINS: Origins[] = [
  "http://localhost",
  //"https://graphcalculator.xyz",
] as const;
