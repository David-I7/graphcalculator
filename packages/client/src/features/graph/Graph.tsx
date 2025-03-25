import "./assets/base.scss";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { Graph as LibGraph } from "./lib/graph/graph";
import { setup } from "./lib";
import GraphScaler from "./components/GraphScaler";

type GraphContextState = LibGraph;

const GraphContext = createContext<GraphContextState | undefined>(undefined);

const useInitGraphContext = () => {
  const [graph, setGraph] = useState<LibGraph | undefined>(undefined);

  useEffect(() => {
    const canvas = document.getElementById(
      "graph-calculator"
    ) as HTMLCanvasElement;
    const ctx = canvas.getContext("2d")!;
    const initializedGraph = setup(canvas, ctx);

    setGraph(initializedGraph);

    return () => {
      initializedGraph.destroy();
    };
  }, []);

  return graph;
};

export const useGraphContext = () => useContext(GraphContext);

export const GraphContextProvider = ({ children }: { children: ReactNode }) => {
  return (
    <GraphContext.Provider value={useInitGraphContext()}>
      {children}
    </GraphContext.Provider>
  );
};

const Graph = () => {
  return (
    <div className="graph-container">
      <canvas id="graph-calculator"></canvas>
      <GraphScaler />
    </div>
  );
};

export default Graph;
