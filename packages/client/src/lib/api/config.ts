import { Origins } from "@graphcalculator/types";

export const baseUrl =
  import.meta.env.VITE_NODE_ENV === "production"
    ? "https://graphcalculator.xyz/api"
    : "http://localhost:8080/api";

export const examplesUrl =
  import.meta.env.VITE_NODE_ENV === "production"
    ? "https://graphcalculator.xyz/public/examples.json"
    : import.meta.env.VITE_NODE_ENV === "preview"
      ? "http://localhost/public/examplesPreview.json"
      : "http://localhost:8080/public/examplesDevelopment.json";

export const SAVED_GRAPHS_LIMIT = 25;
export const ORIGINS: Origins[] = [
  "http://localhost",
  "http://localhost:8080",
  "http://localhost:3000",
  "https://graphcalculator.xyz",
] as const;
