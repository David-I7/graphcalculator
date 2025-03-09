import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AdjacencyList, SerializedAdjList, swap } from "../../helpers/dts";
import {
  ClientGraphData,
  Expression,
  ExpressionType,
  GraphData,
  Item,
  ItemData,
  ItemType,
  Scope,
} from "./types";
import {
  addDependencies,
  createNewGraph,
  createNewItem,
  deleteFromScope,
  dependenciesInScope,
  removeDependencies,
  restoreSavedGraph,
  saveCurrentGraph,
} from "./controllers";
import {
  pointParser,
  variableParser,
} from "../../features/graph/lib/mathjs/parse";
import { AssignmentNode, MathNode, ObjectNode, parse } from "mathjs";
import { restrictedVariables } from "../../features/graph/data/math";

interface GraphState {
  currentGraph: ClientGraphData;
  savedGraphs: GraphData[];
  exampleGraphs: GraphData[];
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

        const item = items.data[action.payload.id];

        if (
          isExpression(item) &&
          item.data.parsedContent &&
          "name" in item.data.parsedContent
        ) {
          const scope = items.scope;
          const depGraph = items.dependencyGraph;
          deleteFromScope(item.data.parsedContent.name, depGraph, scope);
          removeDependencies(
            item.data.parsedContent.name,
            item.data.parsedContent.scopeDeps,
            depGraph
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
      if (state.currentGraph.items.focusedId === action.payload) {
        return;
      }

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
        const depGraph = state.currentGraph.items.dependencyGraph;

        // previous value
        if (expr.type !== "point" && expr.parsedContent) {
          if (!restrictedVariables.has(expr.parsedContent.name)) {
            deleteFromScope(expr.parsedContent.name, depGraph, scope);
            removeDependencies(
              expr.parsedContent.name,
              expr.parsedContent.scopeDeps,
              depGraph
            );
          }
        }

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

        const expr = item.data as Expression<"function">;

        if (
          expr.parsedContent &&
          expr.parsedContent.node === action.payload.parsedContent.node
        )
          return;

        const scope = state.currentGraph.items.scope;
        const depGraph = state.currentGraph.items.dependencyGraph;

        if (!restrictedVariables.has(action.payload.parsedContent.name)) {
          scope[action.payload.parsedContent.name] =
            action.payload.parsedContent.node;

          addDependencies(
            action.payload.parsedContent.name,
            action.payload.parsedContent.scopeDeps,
            depGraph
          );

          updateScopeSync(
            action.payload.parsedContent.name,
            state.currentGraph.items.data,
            depGraph,
            scope
          );
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
        if (
          expr.parsedContent &&
          expr.parsedContent.node === action.payload.parsedContent.node
        )
          return;

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
        if (
          expr.parsedContent &&
          expr.parsedContent.node === action.payload.parsedContent.node
        )
          return;

        const scope = state.currentGraph.items.scope;
        const depGraph = state.currentGraph.items.dependencyGraph;

        if (!restrictedVariables.has(action.payload.parsedContent.name)) {
          scope[action.payload.parsedContent.name] =
            action.payload.parsedContent.value;

          addDependencies(
            action.payload.parsedContent.name,
            action.payload.parsedContent.scopeDeps,
            depGraph
          );

          updateScopeSync(
            action.payload.parsedContent.name,
            state.currentGraph.items.data,
            depGraph,
            scope
          );
        }
        expr.parsedContent = action.payload.parsedContent;
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
  removeParsedContent,
  updateFunctionExpr,
  updatePointExpr,
  updateVariableExpr,
} = graphSlice.actions;

// SELECTORS

const selectExpression = () => {};

function updateScopeSync(
  updated: string,
  items: Item[],
  depGraph: SerializedAdjList,
  scope: Scope
) {
  let topologyOrder = AdjacencyList.topologicSort(depGraph);
  if (!topologyOrder) throw new Error("Cycle has been detected");

  const updatedIdx = topologyOrder.findIndex((v) => v === updated);
  if (updatedIdx === -1 || updatedIdx === topologyOrder.length - 1) return;

  topologyOrder = topologyOrder.slice(updatedIdx + 1);

  const exprMap: Record<string, Expression> = {};
  items.forEach((item) => {
    if (
      isExpression(item) &&
      item.data.parsedContent &&
      "name" in item.data.parsedContent
    ) {
      exprMap[item.data.parsedContent.name] = item.data;
    }
  });

  for (const v of topologyOrder) {
    const expr = exprMap[v];

    if (!expr || !dependenciesInScope(expr.parsedContent!.scopeDeps, scope))
      continue;

    switch (expr.type) {
      case "variable": {
        const node = parse(expr.parsedContent!.node) as AssignmentNode;
        const newContent = variableParser.parse(node, scope);
        expr.parsedContent = newContent;
        scope[newContent.name] = newContent.value;
        break;
      }
      case "function": {
        // this means that it is now safe to compute function
        // for dependents
        break;
      }
      default: {
        throw new Error(`Type is not implemented.`);
      }
    }
  }
}
