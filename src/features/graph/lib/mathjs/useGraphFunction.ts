import React, { useEffect, useMemo, useRef } from "react";
import { ClientExpressionState } from "../../../../state/graph/types";
import { Graph } from "../graph/graph";
import { DrawFunctionCommand, FnCommandState } from "../graph/commands";
import { useAppDispatch } from "../../../../state/hooks";
import {
  resetFocusedItem,
  setFocusedItem,
} from "../../../../state/graph/graph";
import { functionParser } from "./parse";
import { reviver } from "mathjs";

type useGraphFunctionProps = {
  id: number;
  data: ClientExpressionState<"function">;
  focused: boolean;
  graph: Graph;
  scope: Record<string, number>;
};
export default function useGraphFunction({
  id,
  data,
  focused,
  graph,
  scope,
}: useGraphFunctionProps) {
  const node = useMemo(() => {
    return data.clientState ? JSON.parse(data.clientState, reviver) : undefined;
  }, [data.clientState]);
  const dispatch = useAppDispatch();
  const command = useRef<DrawFunctionCommand | null>(null);

  useEffect(() => {
    if (!node) return;

    const fnData = functionParser.parse(node, scope);

    if (!fnData) {
      throw new Error(`Validation failed! Node is not valid.\n\n
        ${node}`);
    }

    const stateSync: FnCommandState = {
      state: focused ? "focused" : "idle",
      onStateChange(prev, cur) {
        if (prev === cur) return;

        if (cur === "idle") {
          dispatch(resetFocusedItem(id));
        } else {
          dispatch(setFocusedItem(id));
        }
      },
    };

    const currentCommand = new DrawFunctionCommand(
      graph,
      fnData,
      data.settings,
      stateSync
    );
    command.current = currentCommand;
    graph.addCommand(currentCommand);

    return () => {
      currentCommand.destroy();
      graph.removeCommand(currentCommand);
    };
  }, [node]);

  useEffect(() => {
    if (!command.current) return;
    if (command.current.state === "idle" && focused) {
      command.current.setState("focused");
    } else if (command.current.state === "focused" && !focused) {
      command.current.setState("idle");
    }
  }, [focused]);

  useEffect(() => {
    if (!command.current) return;

    command.current.settings = data.settings;
  }, [data.settings.color, data.settings.hidden]);
}
