import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { GraphData } from "../graph/types";
import { User } from "./types";
import { baseUrl } from "./config";

const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl }),
  endpoints: (build) => ({
    getExampleGraphs: build.query<GraphData[], void>({
      query: () => ({
        url: "graphs/examples",
        credentials: "include",
      }),
      transformResponse: (response: { graphs: GraphData[] }) => response.graphs,
    }),
    getSavedGraphs: build.query<GraphData[], void>({
      query: () => ({
        url: "graphs/saved",
        credentials: "include",
      }),
      transformResponse: (response: { graphs: GraphData[] }) => response.graphs,
    }),
    getUser: build.query<User, void>({
      query: () => ({
        url: "auth/status",
        credentials: "include",
      }),
    }),
  }),
});

export const {
  useGetExampleGraphsQuery,
  useGetUserQuery,
  useGetSavedGraphsQuery,
} = apiSlice;
export default apiSlice;
