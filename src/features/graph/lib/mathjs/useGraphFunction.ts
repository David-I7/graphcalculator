import React, { useEffect, useRef } from "react";
import {
  ClientExpressionState,
  RequiredFnState,
} from "../../../../state/graph/types";
import { Graph } from "../graph/graph";
import { DrawFunctionCommand, FnCommandState } from "../graph/commands";
import { useAppDispatch } from "../../../../state/hooks";
import {
  resetFocusedItem,
  setFocusedItem,
} from "../../../../state/graph/graph";

type useGraphFunctionProps = {
  id: number;
  data: ClientExpressionState<"function">;
  focused: boolean;
  graph: Graph;
};
export default function useGraphFunction({
  id,
  data,
  focused,
  graph,
}: useGraphFunctionProps) {
  const dispatch = useAppDispatch();
  const command = useRef<DrawFunctionCommand | null>(null);

  useEffect(() => {
    if (!data.state.f.node) return;

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
      data.state as RequiredFnState,
      data.settings,
      stateSync
    );
    command.current = currentCommand;

    return () => {
      currentCommand.destroy();
    };
  }, [data]);

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
