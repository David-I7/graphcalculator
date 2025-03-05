import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CSS_VARIABLES } from "../../data/css/variables";
import { swap } from "../../helpers/dts";
import {
  ClientGraphData,
  Expression,
  ExpressionType,
  GraphData,
  isExpression,
  Item,
  ItemData,
  ItemType,
  Scope,
} from "./types";
import { functionParser } from "../../features/graph/lib/mathjs/parse";
import { reviver } from "mathjs";

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

function saveCurrentGraph(currentGraph: ClientGraphData): GraphData {
  // apiReq to server in the background

  return {
    ...currentGraph,
    modifiedAt: new Date().toJSON(),
    thumb: "", //base64encoded canvasGetImageData
    items: currentGraph.items.data,
  };
}

function restoreSavedGraph(graph: GraphData): ClientGraphData {
  const scope: Scope = {};
  let maxId: number = 1;

  for (let i = 0; i < graph.items.length; i++) {
    const item = graph.items[i];
    maxId = Math.max(maxId, item.id);

    if (isExpression(item) && item.data.parsedContent) {
      if (item.data.type === "variable") {
        scope[item.data.parsedContent.name] = item.data.parsedContent.value;
      } else if (item.data.type == "function") {
        const fnName = item.data.parsedContent.name;

        if (fnName === "f" || fnName === "x" || fnName === "y") continue;
        scope[fnName] = item.data.content;
      }
    }
  }

  return {
    ...graph,
    items: {
      scope,
      nextId: maxId + 1,
      focusedId: -1,
      data: graph.items,
    },
  };
}

function createNewItem<T extends ItemType>(
  type: T,
  id: number,
  content?: string
): Item {
  if (type === "expression") {
    return {
      id,
      type,
      data: {
        type: "function",
        content: content ? content : "",
        parsedContent: undefined,
        settings: {
          color: `hsl(${Math.floor(Math.random() * 360)},${
            CSS_VARIABLES.baseSaturation
          },${CSS_VARIABLES.baseLightness})`,
          hidden: false,
        },
      },
    } as Item<"expression">;
  }

  return {
    id,
    type,
    data: {
      content: "",
    },
  } as Item<"note">;
}

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
    restoreGraph: create.reducer(
      (state, action: PayloadAction<{ id: string; idx: number }>) => {
        const graph = state.savedGraphs[action.payload.idx];
        if (graph.id !== action.payload.id) return;

        state.currentGraph = restoreSavedGraph(graph);
      }
    ),
    saveGraph: create.reducer((state, action: PayloadAction<string>) => {
      let graphIdx: number | null = null;

      for (let i = 0; i < state.savedGraphs.length; i++) {
        if (state.savedGraphs[i].id === action.payload) {
        }
      }

      const savedGraph = saveCurrentGraph(state.currentGraph);

      if (graphIdx === null) {
        state.savedGraphs.push(savedGraph);
      } else {
        state.savedGraphs[graphIdx] = savedGraph;
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
            items.data[action.payload.idx].data as ItemData["expression"],
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

    // SCOPE CASES
    // setToScope:create.reducer(
    //   (
    //     state,
    //     action: PayloadAction<{key:string,value}>
    //   ) => {
    //     const item = state.currentGraph.items.data[action.payload.idx];

    //     if (item.id !== action.payload.id) return;
    //     if (item.type !== "expression") return

    //     const expr = item.data as ItemData["expression"]

    //     if (expr.type === "function" || expr.type === "point") {
    //       expr.settings.hidden = !expr.settings.hidden;
    //     }
    //   }
    // ),

    // EXPRESSION CASES
    toggleExpressionVisibility: create.reducer(
      (
        state,
        action: PayloadAction<{ hidden: boolean; id: number; idx: number }>
      ) => {
        const item = state.currentGraph.items.data[action.payload.idx];

        if (item.id !== action.payload.id) return;
        if (item.type !== "expression") return;

        const expr = item.data as ItemData["expression"];

        if (expr.type === "function" || expr.type === "point") {
          expr.settings.hidden = !expr.settings.hidden;
        }
      }
    ),
    removeParsedContent: create.reducer(
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

        const expr = item.data as ItemData["expression"];
        const scope = state.currentGraph.items.scope;

        // previous value
        deleteFromScope(expr, scope);

        expr.type = action.payload.type;
        expr.parsedContent = undefined;
      }
    ),
    updateFunctionExpr: create.reducer(
      (
        state,
        action: PayloadAction<{
          id: number;
          idx: number;
          parsedContent: NonNullable<Expression<"function">["parsedContent"]>;
        }>
      ) => {
        const item = state.currentGraph.items.data[action.payload.idx];

        if (item.id !== action.payload.id || item.type !== "expression") return;

        const expr = item.data as ItemData["expression"];
        const scope = state.currentGraph.items.scope;

        if (
          action.payload.parsedContent.name !== "x" &&
          action.payload.parsedContent.name !== "y" &&
          action.payload.parsedContent.name !== "f"
        ) {
          scope[action.payload.parsedContent.name] = expr.content;
        }

        expr.type = "function";
        expr.parsedContent = action.payload.parsedContent;
      }
    ),
    updatePointExpr: create.reducer(
      (
        state,
        action: PayloadAction<{
          id: number;
          idx: number;
          parsedContent: NonNullable<Expression<"point">["parsedContent"]>;
        }>
      ) => {
        const item = state.currentGraph.items.data[action.payload.idx];

        if (item.id !== action.payload.id || item.type !== "expression") return;

        const expr = item.data as ItemData["expression"];

        expr.type = "point";
        expr.parsedContent = action.payload.parsedContent;
      }
    ),
    updateVariableExpr: create.reducer(
      (
        state,
        action: PayloadAction<{
          id: number;
          idx: number;
          parsedContent: NonNullable<Expression<"variable">["parsedContent"]>;
        }>
      ) => {
        const item = state.currentGraph.items.data[action.payload.idx];

        if (item.id !== action.payload.id || item.type !== "expression") return;

        const expr = item.data as ItemData["expression"];
        const scope = state.currentGraph.items.scope;

        if (
          action.payload.parsedContent.name !== "x" &&
          action.payload.parsedContent.name !== "y" &&
          action.payload.parsedContent.name !== "f"
        ) {
          scope[action.payload.parsedContent.name] =
            action.payload.parsedContent.value;
        }
        expr.parsedContent = action.payload.parsedContent;
        expr.type = "variable";
        expr.parsedContent.scopeDeps = [];
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
  removeParsedContent,
  updateFunctionExpr,
  updatePointExpr,
  updateVariableExpr,
} = graphSlice.actions;

// SELECTORS

const selectExpression = () => {};

// utils
function deleteFromScope(data: ItemData["expression"], scope: Scope) {
  if (data.type == "variable" && data.parsedContent) {
    delete scope[data.parsedContent.name];
  } else if (data.type === "function" && data.parsedContent) {
    if (scope[data.parsedContent.name]) {
      delete scope[data.parsedContent.name];
    }
  }
}

export function isInScope(
  target: string,
  data: ItemData["expression"],
  scope: Set<string>
): boolean {
  if (scope.has(target)) {
    if (data.type === "variable" && data.parsedContent) {
      return data.parsedContent.name === target ? false : true;
    } else if (data.type === "function" && data.parsedContent) {
      return data.parsedContent.name === target ? false : true;
    }
    return true;
  }

  return false;
}
