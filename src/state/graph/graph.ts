import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CSS_VARIABLES } from "../../data/css/variables";
import { swap } from "../../helpers/dts";
import {
  ClientExpressionData,
  ClientExpressionState,
  ClientGraphData,
  ClientItem,
  ClientItemData,
  Expression,
  ExpressionType,
  GraphData,
  Item,
  ItemType,
  Scope,
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

        if (items.data[action.payload.idx].type === "expression") {
          const scope = items.scope;
          deleteFromScope(
            items.data[action.payload.idx].data as ClientItemData["expression"],
            scope
          );
        }

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
    resetExprState: create.reducer(
      (
        state,
        action: PayloadAction<{
          id: number;
          idx: number;
          type: ExpressionType;
        }>
      ) => {
        const item = state.currentGraph.items.data[action.payload.idx];

        if (item.id !== action.payload.id || item.type !== "expression") return;

        const expr = item.data as ClientExpressionState;
        const scope = state.currentGraph.items.scope;

        // previous value
        deleteFromScope(expr, scope);
        // if (expr.type === "variable" && expr.clientState) {
        //   delete scope[
        //     (expr.clientState as ClientExpressionData["variable"]["clientState"])!
        //       .name
        //   ];
        // }

        // new type
        switch (action.payload.type) {
          case "function":
            expr.type = "function";
            expr.clientState = undefined;
            break;
          case "point":
            expr.type = "point";
            expr.clientState = undefined;
            break;
          case "variable":
            expr.type = "variable";
            expr.clientState = undefined;
            break;
        }
      }
    ),
    updateFunctionExpr: create.reducer(
      (
        state,
        action: PayloadAction<{
          id: number;
          idx: number;
          clientState: NonNullable<
            ClientExpressionData["function"]["clientState"]
          >;
        }>
      ) => {
        const item = state.currentGraph.items.data[action.payload.idx];

        if (item.id !== action.payload.id || item.type !== "expression") return;

        const expr = item.data as ClientExpressionState;

        expr.type = "function";
        expr.clientState = action.payload.clientState;
      }
    ),
    updatePointExpr: create.reducer(
      (
        state,
        action: PayloadAction<{
          id: number;
          idx: number;
          clientState: NonNullable<
            ClientExpressionData["point"]["clientState"]
          >;
        }>
      ) => {
        const item = state.currentGraph.items.data[action.payload.idx];

        if (item.id !== action.payload.id || item.type !== "expression") return;

        const expr = item.data as ClientExpressionState;

        expr.type = "point";
        expr.clientState = action.payload.clientState;
      }
    ),
    updateVariableExpr: create.reducer(
      (
        state,
        action: PayloadAction<{
          id: number;
          idx: number;
          clientState: NonNullable<
            ClientExpressionData["variable"]["clientState"]
          >;
        }>
      ) => {
        const item = state.currentGraph.items.data[action.payload.idx];

        if (item.id !== action.payload.id || item.type !== "expression") return;

        const expr = item.data as ClientExpressionState;
        const scope = state.currentGraph.items.scope;

        if (
          action.payload.clientState.name !== "x" &&
          action.payload.clientState.name !== "y" &&
          action.payload.clientState.name !== "f"
        ) {
          // allow multiple declarations of y, x and f,
          // we won't use them as variables
          scope[action.payload.clientState.name] =
            action.payload.clientState.value;
        }
        expr.clientState = action.payload.clientState;
        expr.type = "variable";
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
  resetExprState,
  updateFunctionExpr,
  updatePointExpr,
  updateVariableExpr,
} = graphSlice.actions;

// SELECTORS

const selectExpression = () => {};

// utils
function deleteFromScope(data: ClientItemData["expression"], scope: Scope) {
  if (data.type == "variable" && data.clientState) {
    delete scope[
      (
        data.clientState as NonNullable<
          ClientExpressionData["variable"]["clientState"]
        >
      ).name
    ];
  }
}

export function isInScope(
  target: string,
  data: ClientItemData["expression"],
  scope: Scope
): boolean {
  if (target in scope) {
    if (data.type === "function") return true;

    if (data.type === "variable" && data.clientState) {
      return (
        data.clientState as NonNullable<
          ClientExpressionData["variable"]["clientState"]
        >
      ).name === target // if name === target the var is trying to be created
        ? false
        : true;
    } else {
      return true;
    }
  }

  return false;
}
