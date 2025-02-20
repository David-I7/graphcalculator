import "./assets/base.scss";
import GraphFunctions from "./components/GraphFunctions";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Graph as LibGraph } from "./lib/graph/graph";
import "./lib";
import { setup } from "./lib";

type GraphContextState = LibGraph;

const GraphContext = createContext<GraphContextState | undefined>(undefined);

const useInitGraphContext = () => {
  const [graph, setGraph] = useState<LibGraph | undefined>(undefined);

  // useEffect(() => {

  // }, []);

  return graph;
};

export const useGraphContext = () => useContext(GraphContext);

const GraphContextProvider = ({ children }: { children: ReactNode }) => {
  return (
    <GraphContext.Provider value={useInitGraphContext()}>
      {children}
    </GraphContext.Provider>
  );
};

const Graph = () => {
  return (
    <GraphContextProvider>
      <div className="graph-container">
        <canvas id="graph-calculator"></canvas>
        {/* <GraphFunctions /> */}
      </div>
    </GraphContextProvider>
  );
};

export default Graph;
