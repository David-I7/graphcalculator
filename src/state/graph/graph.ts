import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CSS_VARIABLES } from "../../data/css/variables";
import { swap } from "../../helpers/dts";
import {
  ClientExpressionState,
  ClientGraphData,
  ClientItem,
  Expression,
  ExpressionType,
  GraphData,
  Item,
  ItemType,
} from "./types";

interface GraphState {
  currentGraph: ClientGraphData;
  savedGraphs: GraphData[];
  exampleGraphs: GraphData[];
}

function createNewGraph(): ClientGraphData {
  const createdAt = new Date().toJSON();
  return {
    id: crypto.randomUUID(),
    createdAt,
    modifiedAt: createdAt,
    thumb: "",
    name: "Untitled",
    items: {
      scope: {},
      nextId: 2,
      focusedId: 1,
      data: [createNewItem("expression", 1)],
    },
  };
}

function createNewItem<T extends ItemType>(
  type: T,
  id: number,
  content?: string
): ClientItem<T> {
  if (type === "expression") {
    return {
      id,
      type,
      data: {
        type: "function",
        content: content ? content : "",
        settings: {
          color: `hsl(${Math.floor(Math.random() * 360)},${
            CSS_VARIABLES.baseSaturation
          },${CSS_VARIABLES.baseLightness})`,
          hidden: false,
        },
        clientState: undefined,
      },
    } as ClientItem<"expression">;
  }

  return {
    id,
    type,
    data: {
      content: "",
    },
  } as ClientItem<T>;
}

type t = ClientItem<"expression">["data"];

const initialState: GraphState = {
  currentGraph: createNewGraph(),
  savedGraphs: [],
  exampleGraphs: [],
};

const graphSlice = createSlice({
  name: "graph",
  initialState,
  reducers: (create) => ({
    // GRAPH CASES
    restoreGraph: create.reducer((state, action: PayloadAction<string>) => {
      const graph = state.savedGraphs.find(
        (graph) => graph.id === action.payload
      );
      if (!graph) return;
      // state.currentGraph = graph;
    }),
    saveGraph: create.reducer((state, action: PayloadAction<string | null>) => {
      if (!action.payload) {
        // state.savedGraphs.push(state.currentGraph);
      } else {
        // for (let i = 0; i < state.savedGraphs.length; ++i) {
        //   if (state.savedGraphs[i].id === action.payload) {
        //     state.savedGraphs[i] = state.currentGraph;
        //   }
        // }
      }
    }),

    // ITEM CASES
    createItem: create.reducer(
      (
        state,
        action: PayloadAction<{
          type: ItemType;
          loc: "start" | "end";
        }>
      ) => {
        if (action.payload.loc === "end") {
          state.currentGraph.items.data.push(
            createNewItem(action.payload.type, state.currentGraph.items.nextId)
          );
        } else {
          state.currentGraph.items.data.unshift(
            createNewItem(action.payload.type, state.currentGraph.items.nextId)
          );
        }
        state.currentGraph.items.focusedId = state.currentGraph.items.nextId;
        state.currentGraph.items.nextId += 1;
      }
    ),
    deleteItem: create.reducer(
      (state, action: PayloadAction<{ id: number; idx: number }>) => {
        const items = state.currentGraph.items;

        if (items.data[action.payload.idx].id !== action.payload.id) return;

        items.data.splice(action.payload.idx, 1);
      }
    ),
    updateItemPos: create.reducer(
      (
        state,
        action: PayloadAction<{ id: number; startPos: number; endPos: number }>
      ) => {
        if (action.payload.startPos < action.payload.endPos) {
          let i = action.payload.startPos;
          while (i < action.payload.endPos) {
            swap(i, i + 1, state.currentGraph.items.data);
            ++i;
          }
        } else if (action.payload.startPos > action.payload.endPos) {
          let i = action.payload.startPos;
          while (i > action.payload.endPos) {
            swap(i, i - 1, state.currentGraph.items.data);
            --i;
          }
        }
      }
    ),
    updateItemContent: create.reducer(
      (
        state,
        action: PayloadAction<{ content: string; id: number; idx: number }>
      ) => {
        const item = state.currentGraph.items.data[action.payload.idx];
        if (item.id !== action.payload.id) return;
        if (item.data.content === action.payload.content) return;
        item.data.content = action.payload.content;
      }
    ),
    setFocusedItem: create.reducer((state, action: PayloadAction<number>) => {
      if (state.currentGraph.items.focusedId === action.payload) return;
      state.currentGraph.items.focusedId = action.payload;
    }),
    resetFocusedItem: create.reducer((state, action: PayloadAction<number>) => {
      if (state.currentGraph.items.focusedId === action.payload) {
        state.currentGraph.items.focusedId = -1;
      }
    }),

    // EXPRESSION CASES
    toggleExpressionVisibility: create.reducer(
      (
        state,
        action: PayloadAction<{ hidden: boolean; id: number; idx: number }>
      ) => {
        const item = state.currentGraph.items.data[action.payload.idx];

        if (item.id !== action.payload.id) return;
        if (item.type === "expression") {
          const settings = (item.data as ClientExpressionState<"function">)[
            "settings"
          ];
          if (settings) settings.hidden = !settings.hidden;
        }
      }
    ),
    updateExpressionState: create.reducer(
      (
        state,
        action: PayloadAction<{
          id: number;
          idx: number;
          clientState: ClientExpressionState<ExpressionType>["clientState"];
          type: ExpressionType;
        }>
      ) => {
        const item = state.currentGraph.items.data[action.payload.idx];

        if (item.id !== action.payload.id || item.type !== "expression") return;

        const expr = item.data as ClientExpressionState;

        switch (action.payload.type) {
          case "function":
            expr.type = "function";
            expr.clientState = action.payload.clientState;
            break;
          case "point":
            expr.type = "point";
            expr.clientState = action.payload.clientState;
            break;
          case "variable":
            expr.type = "variable";
            expr.clientState = action.payload.clientState;
            break;
        }
      }
    ),
  }),
});

export default graphSlice.reducer;
export const {
  // graph
  restoreGraph,
  saveGraph,

  // item
  createItem,
  deleteItem,
  updateItemContent,
  updateItemPos,
  resetFocusedItem,
  setFocusedItem,

  //expression
  toggleExpressionVisibility,
  updateExpressionState,
} = graphSlice.actions;

// SELECTORS

const selectExpression = () => {};
