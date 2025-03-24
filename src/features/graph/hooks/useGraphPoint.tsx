import { useEffect, useMemo, useRef } from "react";
import { CommandState, DrawPointCommand } from "../lib/graph/commands";
import { useGraphContext } from "../Graph";
import { useGraphExprProps } from "../components/GraphExpression";
import { resetFocusedItem, setFocusedItem } from "../../../state/graph/graph";
import { useAppDispatch } from "../../../state/hooks";

export function useGraphPoint({
  id,
  data,
  scope,
  focused,
  graphId,
  prevGraphId,
}: useGraphExprProps<"point">) {
  const graph = useGraphContext();
  const node = useMemo(() => {
    return data.parsedContent ? data.parsedContent : undefined;
  }, [data.parsedContent]);
  const dispatch = useAppDispatch();
  const command = useRef<DrawPointCommand | null>(null);

  useEffect(() => {
    if (!node || !graph) return;

    const stateSync: CommandState = {
      status: focused ? "focused" : "idle",
      onStateChange(prev, cur) {
        if (prev === cur) return;
        if (cur === "idle") {
          dispatch(resetFocusedItem(id));
        } else {
          dispatch(setFocusedItem(id));
        }
      },
    };

    const currentCommand = new DrawPointCommand(
      graph,
      data.parsedContent!,
      data.settings,
      stateSync
    );
    command.current = currentCommand;

    return () => {
      currentCommand.destroy();
    };
  }, [node, scope]);

  useEffect(() => {
    if (!command.current) return;
    if (graphId !== prevGraphId) return;
    if (command.current.commandState.status === "idle" && focused) {
      command.current.setStatus("focused");
    } else if (command.current.commandState.status === "focused" && !focused) {
      command.current.setStatus("idle");
    }
  }, [focused]);

  useEffect(() => {
    if (!command.current) return;

    command.current.settings = data.settings;
  }, [data.settings]);

  return null;
}

export const GraphPoint = ({
  data,
  id,
  focused,
  scope,
  graphId,
  prevGraphId,
}: useGraphExprProps<"point">) => {
  useGraphPoint({ id, focused, data, scope, graphId, prevGraphId });

  return null;
};
