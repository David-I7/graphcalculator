import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { GraphData } from "../graph/types";
import { UserSessionData } from "./types";
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
    getUser: build.query<UserSessionData, void>({
      query: () => ({
        url: "auth/status",
        credentials: "include",
      }),
      transformResponse: (response: { data: UserSessionData }) => response.data,
    }),
  }),
});

export const {
  useGetExampleGraphsQuery,
  useGetUserQuery,
  useGetSavedGraphsQuery,
} = apiSlice;
export default apiSlice;
