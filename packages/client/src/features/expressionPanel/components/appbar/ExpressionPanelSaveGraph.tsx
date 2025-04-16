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
import { isExpression } from "../../../../state/graph/types";

const ExpressionPanelSaveGraph = () => {
  const [message, setMessage] = useState<string>("Save");
  const dispatch = useAppDispatch();
  const [trigger, { data, isLoading, isError }] = useUpsertSavedGraphMutation();
  const { data: userSession } =
    apiSlice.endpoints.getUser.useQueryState(undefined);
  const currentGraph = useAppSelector((state) => state.graphSlice.currentGraph);
  const graph = useGraphContext();

  return (
    <>
      {message ? (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!graph || !userSession || !currentGraph.isModified) return;

            const image = await graph.takeImageSnapshot("blob");
            const snapshot = graph.takeStateSnapshot();
            const formData = new FormData();

            formData.append("id", currentGraph.id);
            formData.append("name", currentGraph.name);
            formData.append("modified_at", new Date().toJSON());
            formData.append("graph_snapshot", JSON.stringify(snapshot));
            formData.append(
              "items",
              JSON.stringify(
                currentGraph.items.data.map((item) => {
                  if (isExpression(item)) {
                    const { parsedContent, ...dataServer } = item.data;
                    return { ...item, data: dataServer };
                  }
                  return item;
                })
              )
            );
            formData.append("prevImage", currentGraph.image.server);
            formData.append("image", image);

            setMessage("");
            try {
              const fileUrl = await trigger(formData).unwrap();
              graph.revokeObjectUrl(currentGraph.image.client);
              dispatch(saveGraph({ image: fileUrl, snapshot }));

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
