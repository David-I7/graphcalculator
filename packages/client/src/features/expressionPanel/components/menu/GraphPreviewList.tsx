import { MouseEvent, ReactNode } from "react";
import { GraphData } from "../../../../state/graph/types";
import { useAppDispatch } from "../../../../state/hooks";
import { restoreGraph } from "../../../../state/graph/graph";
import { useGraphContext } from "../../../graph/Graph";
import ButtonTarget from "../../../../components/buttons/target/ButtonTarget";
import { Check, Close } from "../../../../components/svgs";
import apiSlice, {
  useDeleteSavedGraphMutation,
} from "../../../../state/api/apiSlice";
import Spinner from "../../../../components/Loading/Spinner/Spinner";
import { CSS_VARIABLES } from "../../../../data/css/variables";
import { wait } from "../../../../helpers/timing";

function findGraph(e: MouseEvent, data: GraphData[]) {
  let node: HTMLElement | null | undefined = e.target as HTMLElement;

  while (node?.tagName !== "LI" && node !== e.currentTarget) {
    node = node?.parentElement;
  }

  if (node?.tagName === "LI") {
    const id = node.getAttribute("graph-id")!;
    const idx = Number(node.getAttribute("graph-idx"));
    if (isNaN(idx)) return;
    const graph = data[idx];
    if (graph.id !== id) return;
    return graph;
  }
}

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

        const graph = findGraph(e, data);
        if (!graph) return;
        else {
          libGraph.restoreStateSnapshot(graph.graph_snapshot);
          libGraph.revokeObjectUrl(graph.image);
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
  image,
}: {
  item: Omit<GraphData, "items" | "image">;
  idx: number;
  body: string;
  image: string;
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
        {image && <img src={image} loading="lazy" />}
      </div>
      <div className="preview-list-item-right">
        <div>
          <h3>{item.name}</h3>
          {body}
        </div>
      </div>
    </li>
  );
};

export const PreviewListItemSaved = ({
  item,
  body,
  idx,
  image,
}: {
  item: Omit<GraphData, "items" | "image">;
  idx: number;
  body: string;
  image: string;
}) => {
  const [trigger, { data, isLoading, isError, reset }] =
    useDeleteSavedGraphMutation();
  const dispatch = useAppDispatch();
  const deleteSavedGraph = (graphId: string) => {
    dispatch(
      apiSlice.util.updateQueryData("getSavedGraphs", undefined, (draft) => {
        for (const page of draft.pages) {
          for (let i = 0; i < page.graphs.length; i++) {
            if (page.graphs[i].id === graphId) {
              page.graphs.splice(i, 1);
              return;
            }
          }
        }
      })
    );
  };

  return (
    <li
      role="button"
      tabIndex={0}
      graph-id={item.id}
      graph-idx={idx}
      className="preview-list-item-saved"
      onClick={
        isLoading || isError
          ? (e) => {
              e.stopPropagation();
            }
          : undefined
      }
    >
      <div className="preview-list-item-left">
        {image && <img src={image} loading="lazy" />}
      </div>
      <div className="preview-list-item-right-saved">
        <h3>{item.name}</h3>
        {body}

        <ButtonTarget
          onClick={async (e) => {
            if (isLoading) return;
            e.stopPropagation();
            try {
              await trigger(item.id).unwrap();
              deleteSavedGraph(item.id);
            } catch (err) {
              await wait(5000);
              reset();
            }
          }}
          className="delete-graph"
          title="Delete Graph"
        >
          {isLoading ? (
            <Spinner
              style={{
                borderTopColor: "transparent",
                borderColor: CSS_VARIABLES.inverseOnSurfaceHeading,
              }}
            />
          ) : (
            <Close color={isError ? CSS_VARIABLES.error : "currentColor"} />
          )}
          {data && (
            <Check
              width={20}
              height={20}
              color={CSS_VARIABLES.inverseOnSurfaceHeading}
            />
          )}
        </ButtonTarget>
      </div>
    </li>
  );
};

export default GraphPreviewList;
