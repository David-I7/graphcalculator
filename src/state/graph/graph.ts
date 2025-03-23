import { createSlice, current, PayloadAction } from "@reduxjs/toolkit";
import { swap } from "../../helpers/dts";
import {
  ClientGraphData,
  Expression,
  ExpressionSettings,
  ExpressionType,
  GraphData,
  isExpression,
  ItemData,
  ItemType,
  PointType,
} from "./types";
import {
  addDependencies,
  createNewGraph,
  createNewItem,
  createSettings,
  deleteScopeSync,
  removeDependencies,
  restoreSavedGraph,
  saveCurrentGraph,
  updateScopeSync,
} from "./controllers";
import { restrictedVariables } from "../../features/graph/data/math";
import { PREDEFINED_COLORS } from "../../data/css/variables";
import { GraphSnapshot, LibGraph } from "../../features/graph/lib/graph/graph";

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
    saveGraph: create.preparedReducer(
      (graph: LibGraph) => {
        const snapshot = graph.getStateSnapshot();
        return { payload: { ...snapshot, image: graph.toDataURL() } };
      },
      (state, action: PayloadAction<GraphSnapshot>) => {
        let graphIdx: number | null = null;

        for (let i = 0; i < state.savedGraphs.length; i++) {
          if (state.savedGraphs[i].id === state.currentGraph.id) {
            graphIdx = i;
          }
        }

        const savedGraph = saveCurrentGraph(state.currentGraph, action.payload);

        console.log(current(state.currentGraph));
        console.log(savedGraph);
        return;

        // if (graphIdx === null) {
        //   state.savedGraphs.unshift(savedGraph);
        // } else {
        //   state.savedGraphs[graphIdx] = savedGraph;
        // }
      }
    ),
    createBlankGraph: create.preparedReducer(
      (graph: LibGraph) => {
        const newGraph = createNewGraph();
        graph.restoreStateSnapshot(newGraph.graphSnapshot);

        return {
          payload: newGraph,
        };
      },
      (state, action: PayloadAction<ClientGraphData>) => {
        const nonOverlappingId = action.payload.items.nextId;
        action.payload.items.data[0].id = nonOverlappingId;
        action.payload.items.nextId = nonOverlappingId + 1;
        action.payload.items.focusedId = nonOverlappingId;
        state.currentGraph = action.payload;
      }
    ),
    changeGraphName: create.reducer((state, action: PayloadAction<string>) => {
      if (state.currentGraph.name !== action.payload)
        state.currentGraph.name = action.payload;
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

        const item = items.data[action.payload.idx];

        if (
          isExpression(item) &&
          item.data.parsedContent &&
          "name" in item.data.parsedContent
        ) {
          const scope = items.scope;
          const depGraph = items.dependencyGraph;
          deleteScopeSync(item.data.parsedContent.name, depGraph, scope);
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
    //SETTINGS
    toggleVisibility: create.reducer(
      (state, action: PayloadAction<{ id: number; idx: number }>) => {
        const item = state.currentGraph.items.data[action.payload.idx];

        if (item.id !== action.payload.id) return;
        if (item.type !== "expression") return;

        const expr = item.data as ItemData["expression"];

        if (expr.type === "function" || expr.type === "point") {
          expr.settings.hidden = !expr.settings.hidden;
        }
      }
    ),
    changeColor: create.reducer(
      (
        state,
        action: PayloadAction<{
          color: (typeof PREDEFINED_COLORS)[number];
          id: number;
          idx: number;
        }>
      ) => {
        const item = state.currentGraph.items.data[action.payload.idx];

        if (item.id !== action.payload.id) return;
        if (item.type !== "expression") return;

        const expr = item.data as ItemData["expression"];

        if (expr.type === "function" || expr.type === "point") {
          expr.settings.color = action.payload.color;
        }
      }
    ),
    changeOpacity: create.reducer(
      (
        state,
        action: PayloadAction<{
          opacity: number;
          id: number;
          idx: number;
        }>
      ) => {
        const item = state.currentGraph.items.data[action.payload.idx];

        if (item.id !== action.payload.id) return;
        if (item.type !== "expression") return;

        const expr = item.data as ItemData["expression"];

        if (expr.type === "function" || expr.type === "point") {
          const sign = Math.sign(action.payload.opacity);
          const clamped = Math.min(Math.abs(action.payload.opacity), 1);
          expr.settings.opacity = Math.max(clamped * sign, 0);
        }
      }
    ),
    changeStrokeSize: create.reducer(
      (
        state,
        action: PayloadAction<{
          strokeSize: number;
          id: number;
          idx: number;
        }>
      ) => {
        const item = state.currentGraph.items.data[action.payload.idx];

        if (item.id !== action.payload.id) return;
        if (item.type !== "expression") return;

        const expr = item.data as ItemData["expression"];

        if (expr.type === "function" || expr.type === "point") {
          const sign = Math.sign(action.payload.strokeSize);
          const clamped = Math.min(Math.abs(action.payload.strokeSize), 10);
          expr.settings.strokeSize = Math.max(clamped * sign, 0);
        }
      }
    ),
    changeLineType: create.reducer(
      (
        state,
        action: PayloadAction<{
          lineType: ExpressionSettings["function"]["lineType"];
          id: number;
          idx: number;
        }>
      ) => {
        const item = state.currentGraph.items.data[action.payload.idx];

        if (item.id !== action.payload.id) return;
        if (item.type !== "expression") return;

        const expr = item.data as ItemData["expression"];

        if (expr.type === "function") {
          if (expr.settings.lineType === action.payload.lineType) return;
          expr.settings.lineType = action.payload.lineType;
        }
      }
    ),
    changePointType: create.reducer(
      (
        state,
        action: PayloadAction<{
          pointType: PointType;
          id: number;
          idx: number;
        }>
      ) => {
        const item = state.currentGraph.items.data[action.payload.idx];

        if (item.id !== action.payload.id) return;
        if (item.type !== "expression") return;

        const expr = item.data as ItemData["expression"];

        if (expr.type === "point") {
          if (expr.settings.pointType === action.payload.pointType) return;
          expr.settings.pointType = action.payload.pointType;
        }
      }
    ),

    //CONTENT
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
            deleteScopeSync(expr.parsedContent.name, depGraph, scope);
            removeDependencies(
              expr.parsedContent.name,
              expr.parsedContent.scopeDeps,
              depGraph
            );
          }
        }

        if (action.payload.type === "variable") {
          //@ts-ignore
          delete ["settings"];
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

        const expr = item.data as Expression;

        const scope = state.currentGraph.items.scope;
        const depGraph = state.currentGraph.items.dependencyGraph;

        if (expr.type !== "function") {
          //@ts-ignore
          expr.settings = createSettings("function");
        }
        expr.type = "function";
        expr.parsedContent = action.payload.parsedContent;

        if (!restrictedVariables.has(action.payload.parsedContent.name)) {
          scope[action.payload.parsedContent.name] = {
            type: "function",
            node: action.payload.parsedContent.node,
            deps: action.payload.parsedContent.scopeDeps,
          };

          addDependencies(
            action.payload.parsedContent.name,
            action.payload.parsedContent.scopeDeps,
            depGraph
          );

          updateScopeSync(
            action.payload.parsedContent.name,
            depGraph,
            state.currentGraph.items.data,
            scope
          );
        }
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

        const expr = item.data as Expression;

        if (expr.type !== "point") {
          //@ts-ignore
          expr.settings = createSettings("point");
        }
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

        const expr = item.data as Expression;

        const scope = state.currentGraph.items.scope;
        const depGraph = state.currentGraph.items.dependencyGraph;

        if (expr.type !== "variable") {
          //@ts-ignore
          delete expr.settings;
        }
        expr.parsedContent = action.payload.parsedContent;
        expr.type = "variable";

        if (!restrictedVariables.has(action.payload.parsedContent.name)) {
          scope[action.payload.parsedContent.name] = {
            type: "variable",
            node: action.payload.parsedContent.node,
            value: action.payload.parsedContent.value,
            deps: action.payload.parsedContent.scopeDeps,
          };

          addDependencies(
            action.payload.parsedContent.name,
            action.payload.parsedContent.scopeDeps,
            depGraph
          );

          updateScopeSync(
            action.payload.parsedContent.name,
            depGraph,
            state.currentGraph.items.data,
            scope
          );
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
  createBlankGraph,
  changeGraphName,

  // item
  createItem,
  deleteItem,
  updateItemContent,
  updateItemPos,
  resetFocusedItem,
  setFocusedItem,

  //expression
  changeLineType,
  changePointType,
  changeColor,
  changeOpacity,
  changeStrokeSize,
  toggleVisibility,
  removeParsedContent,
  updateFunctionExpr,
  updatePointExpr,
  updateVariableExpr,
} = graphSlice.actions;
