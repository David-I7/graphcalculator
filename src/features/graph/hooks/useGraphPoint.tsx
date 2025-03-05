import { useEffect, useMemo, useRef } from "react";
import { DrawPointCommand } from "../lib/graph/commands";
import { useGraphContext } from "../Graph";
import { useGraphExprProps } from "../components/GraphExpression";

export function useGraphPoint({
  id,
  data,
  scope,
  focused,
}: useGraphExprProps<"point">) {
  const graph = useGraphContext();
  const node = useMemo(() => {
    return data.parsedContent ? data.parsedContent : undefined;
  }, [data.parsedContent]);
  // const dispatch = useAppDispatch();
  const command = useRef<DrawPointCommand | null>(null);

  useEffect(() => {
    if (!node || !graph) return;

    const currentCommand = new DrawPointCommand(
      graph,
      data.parsedContent!,
      data.settings
    );
    command.current = currentCommand;

    return () => {
      currentCommand.destroy();
    };
  }, [node, scope]);

  // useEffect(() => {
  //   if (!command.current) return;
  //   if (command.current.state === "idle" && focused) {
  //     command.current.setState("focused");
  //   } else if (command.current.state === "focused" && !focused) {
  //     command.current.setState("idle");
  //   }
  // }, [focused]);

  useEffect(() => {
    if (!command.current) return;

    command.current.settings = data.settings;
  }, [data.settings.color, data.settings.hidden]);

  return null;
}

export const GraphPoint = ({
  data,
  id,
  focused,
  scope,
}: useGraphExprProps<"point">) => {
  useGraphPoint({ id, focused, data, scope });

  return null;
};
