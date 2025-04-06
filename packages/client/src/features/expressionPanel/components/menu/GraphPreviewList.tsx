import { ReactNode } from "react";
import { GraphData } from "../../../../state/graph/types";
import { useAppDispatch } from "../../../../state/hooks";
import { restoreGraph } from "../../../../state/graph/graph";
import { useGraphContext } from "../../../graph/Graph";

const GraphPreviewList = ({
  data,
  children,
  toggleMenu,
}: {
  data: GraphData[];
  children: ReactNode;
  toggleMenu: () => void;
}) => {
  const dispatch = useAppDispatch();
  const libGraph = useGraphContext();

  return (
    <ul
      onClick={(e) => {
        if (!libGraph) return;

        let node: HTMLElement | null | undefined = e.target as HTMLElement;

        while (node?.tagName !== "LI" && node !== e.currentTarget) {
          node = node?.parentElement;
        }

        if (node.tagName === "LI") {
          const id = node.getAttribute("graph-id")!;
          const idx = Number(node.getAttribute("graph-idx"));
          if (isNaN(idx)) return;
          const graph = data[idx];
          if (graph.id !== id) return;

          libGraph.restoreStateSnapshot(graph.graphSnapshot);
          dispatch(restoreGraph(graph));
          toggleMenu();
        }
      }}
      className="preview-list"
    >
      {children}
    </ul>
  );
};

export const PreviewListItem = ({
  item,
  body,
  idx,
}: {
  item: Omit<GraphData, "items">;
  idx: number;
  body: string;
}) => {
  return (
    <li
      role="button"
      tabIndex={0}
      graph-id={item.id}
      graph-idx={idx}
      className="preview-list-item"
    >
      <div className="preview-list-item-left">
        <img
          src={
            item.graphSnapshot.image === ""
              ? undefined
              : item.graphSnapshot.image
          }
          loading="lazy"
        />
      </div>
      <div className="preview-list-item-right">
        <h3>{item.name}</h3>
        {body}
      </div>
    </li>
  );
};

export default GraphPreviewList;
