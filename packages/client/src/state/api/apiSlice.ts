import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { GraphData } from "../graph/types";
import { UserSessionData } from "@graphcalculator/types";
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
      transformResponse: (response: { data: GraphData[] }) => response.data,
    }),
    getSavedGraphs: build.query<GraphData[], void>({
      query: () => ({
        url: "graphs/saved",
        credentials: "include",
      }),
      transformResponse: (response: { data: GraphData[] }) => response.data,
    }),
    upsertSavedGraph: build.mutation<string, GraphData>({
      query: (graph) => ({
        credentials: "include",
        url: "graphs/saved",
        method: "put",
        body: { graph },
        "content-type": "application/json",
        responseHandler: "text",
      }),
    }),
    getUser: build.query<UserSessionData, void>({
      query: () => ({
        url: "auth/status",
        credentials: "include",
      }),
      transformResponse: (response: { data: { user: UserSessionData } }) =>
        response.data.user,
    }),
  }),
});

export const {
  useGetExampleGraphsQuery,
  useGetUserQuery,
  useGetSavedGraphsQuery,
  useUpsertSavedGraphMutation,
} = apiSlice;
export default apiSlice;
