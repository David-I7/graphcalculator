import { Origins } from "@graphcalculator/types";

export const baseUrl = "http://192.168.1.131:8080/api";
export const SAVED_GRAPHS_LIMIT = 25;
export const ORIGINS: Origins[] = [
  "http://localhost:8080",
  "http://localhost:3000",
] as const;
