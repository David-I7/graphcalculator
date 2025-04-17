import { useState } from "react";
import FilledButton from "../../../../components/buttons/common/FilledButton";
import Spinner from "../../../../components/Loading/Spinner/Spinner";
import { Check, Close, Reload } from "../../../../components/svgs";
import { CSS_VARIABLES } from "../../../../data/css/variables";
import apiSlice, {
  useUpsertSavedGraphMutation,
} from "../../../../state/api/apiSlice";
import { saveGraph } from "../../../../state/graph/graph";
import { useAppDispatch, useAppSelector } from "../../../../state/hooks";
import { useGraphContext } from "../../../graph/Graph";
import { wait } from "../../../../helpers/timing";
import {
  ClientGraphData,
  GraphData,
  isExpression,
} from "../../../../state/graph/types";
import { LibGraph } from "../../../graph/lib/graph/graph";
import { current } from "@reduxjs/toolkit";

async function buildGraphData(
  graph: LibGraph,
  currentGraph: ClientGraphData
): Promise<Omit<GraphData, "image"> & { image: Blob | string }> {
  const image = await graph.takeImageSnapshot("blob");
  const snapshot = graph.takeStateSnapshot();

  return {
    id: currentGraph.id,
    name: currentGraph.name,
    modified_at: new Date().toJSON(),
    graph_snapshot: snapshot,
    items: currentGraph.items.data.map((item) => {
      if (isExpression(item)) {
        const { parsedContent, ...dataServer } = item.data;
        return { ...item, data: dataServer };
      }
      return item;
    }),
    image,
  };
}

function buildFormData(
  graphData: Omit<GraphData, "image"> & { image: Blob | string },
  prevImg: string
) {
  const formData = new FormData();

  formData.append("id", graphData.id);
  formData.append("name", graphData.name);
  formData.append("modified_at", new Date().toJSON());
  formData.append("graph_snapshot", JSON.stringify(graphData.graph_snapshot));
  formData.append("items", JSON.stringify(graphData.items)),
    formData.append("prevImage", prevImg);
  formData.append("image", graphData.image);

  return formData;
}

const ExpressionPanelSaveGraph = () => {
  const [message, setMessage] = useState<string>("Save");
  const dispatch = useAppDispatch();
  const updateSavedGraph = (updatedGraph: GraphData) => {
    dispatch(
      apiSlice.util.updateQueryData("getSavedGraphs", undefined, (draft) => {
        let isUpdated = false;
        for (let i = 0; i < draft.pages.length; i++) {
          if (isUpdated) break;
          const graphs = draft.pages[i].graphs;
          for (let j = 0; j < graphs.length; j++) {
            if (graphs[j].id === updatedGraph.id) {
              graphs.splice(j, 1);
              isUpdated = true;
              break;
            }
          }
        }

        draft.pages[0].graphs.unshift(updatedGraph);
        console.log(current(draft.pages[0].graphs));
      })
    );
  };
  const [trigger, { data, isLoading, isError }] = useUpsertSavedGraphMutation();
  const currentGraph = useAppSelector((state) => state.graphSlice.currentGraph);
  const graph = useGraphContext();

  return (
    <>
      {message ? (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!graph || !currentGraph.isModified) return;

            const updatedGraph = await buildGraphData(graph, currentGraph);
            const formData = buildFormData(
              updatedGraph,
              currentGraph.image.server
            );

            setMessage("");
            try {
              const fileUrl = await trigger(formData).unwrap();
              graph.revokeObjectUrl(currentGraph.image.client);
              dispatch(
                saveGraph({
                  image: fileUrl,
                  snapshot: updatedGraph.graph_snapshot,
                })
              );
              updatedGraph.image = fileUrl;
              updateSavedGraph(updatedGraph as GraphData);

              await wait(5000);
              setMessage("Save");
            } catch (err) {
              await wait(5000);
              setMessage("Try again");
            }
          }}
        >
          <FilledButton
            aria-live="polite"
            disabled={!currentGraph.isModified}
            style={{ padding: "0 1rem" }}
          >
            {message === "Save" ? (
              "Save"
            ) : (
              <>
                <Reload width={18} height={18} /> {message}
              </>
            )}
          </FilledButton>
        </form>
      ) : (
        <SaveStatus
          isError={isError}
          isLoading={isLoading}
          data={data}
          aria-live="polite"
        />
      )}
    </>
  );
};

export default ExpressionPanelSaveGraph;

function SaveStatus<T extends any = any>({
  isError,
  isLoading,
  data,
}: {
  isLoading: boolean;
  isError: boolean;
  data: T | undefined;
}) {
  return (
    <>
      {isLoading && (
        <div
          className="flex-center font-medium"
          style={{
            padding: "0 0.5rem",
            gap: "6px",
            color: CSS_VARIABLES.onSurfaceHeading,
          }}
        >
          <Spinner
            style={{
              width: "14px",
              height: "14px",
            }}
          />
          Saving
        </div>
      )}
      {isError && (
        <div
          className="flex-center font-medium"
          style={{
            gap: "4px",
            padding: "0 0.5rem",
            color: CSS_VARIABLES.error,
          }}
        >
          <Close width={20} height={20} />
          Failed
        </div>
      )}
      {data && !isError && (
        <div
          style={{
            gap: "4px",
            padding: "0 0.5rem",
            color: CSS_VARIABLES.onSurfaceHeading,
          }}
          className="flex-center font-medium"
        >
          <Check width={18} height={18} />
          Saved
        </div>
      )}
    </>
  );
}
