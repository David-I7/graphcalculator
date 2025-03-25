import { useCallback } from "react";
import { useGraphContext } from "../Graph";

const useScaleGraph = () => {
  const graph = useGraphContext();
  const AMPLIFIER = 1.25;

  const scaleGraph = useCallback(
    (zoomDirection: "IN" | "OUT") => {
      if (!graph) return;
      const cx = graph.canvas.width * 0.5;
      const cy = graph.canvas.height * 0.5;

      const dOrginX = cx - (graph.canvasCenterX + graph.offsetX);
      const dOriginY = cy - (graph.canvasCenterY + graph.offsetY);

      graph.scales.processScaleEvent(
        dOrginX,
        dOriginY,
        zoomDirection,
        AMPLIFIER
      );
    },
    [graph]
  );

  const resetScales = useCallback(() => {
    if (!graph) return;
    graph.reset();
  }, [graph]);

  return { resetScales, scaleGraph };
};

export default useScaleGraph;
