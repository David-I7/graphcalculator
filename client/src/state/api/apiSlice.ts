import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { GraphData } from "../graph/types";

const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:8080/" }),
  endpoints: (build) => ({
    getExampleGraphs: build.query<GraphData[], void>({
      query: () => "graphs",
      transformResponse: (response: GraphData[]) => response,
    }),
    getSavedGraphs: build.query<GraphData[], void>({
      query: () => "saved",
    }),
  }),
});

export const { useGetExampleGraphsQuery } = apiSlice;
export default apiSlice;
