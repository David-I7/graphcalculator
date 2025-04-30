import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { GraphData } from "../graph/types";
import { UserSessionData } from "@graphcalculator/types";
import { baseUrl, SAVED_GRAPHS_LIMIT } from "../../lib/api/config";

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
    getSavedGraphs: build.infiniteQuery<
      { graphs: GraphData[]; totalPages: number },
      void,
      number
    >({
      infiniteQueryOptions: {
        initialPageParam: 1,
        getNextPageParam(lastPage, allPages, lastPageParam, allPageParams) {
          return lastPageParam < lastPage.totalPages
            ? lastPageParam + 1
            : undefined;
        },
      },
      query: ({ pageParam }) => ({
        url: `graphs/saved?page=${pageParam}&limit=${SAVED_GRAPHS_LIMIT}`,
        credentials: "include",
      }),
      transformResponse: (response: {
        data: { graphs: GraphData[]; totalPages: number };
      }) => response.data,
    }),
    upsertSavedGraph: build.mutation<string, FormData>({
      query: (formData) => ({
        credentials: "include",
        url: "graphs/saved",
        method: "put",
        body: formData,
      }),
      transformResponse: (response: { data: string }) => response.data,
    }),
    deleteSavedGraph: build.mutation<string, string>({
      query: (graphId) => ({
        credentials: "include",
        url: "graphs/saved",
        method: "delete",
        body: { graphId },
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
  useGetSavedGraphsInfiniteQuery,
  useUpsertSavedGraphMutation,
  useDeleteSavedGraphMutation,
} = apiSlice;
export default apiSlice;
