import { useEffect, useState } from "react";
import FilledButton from "../../../../components/buttons/common/FilledButton";
import Spinner from "../../../../components/Loading/Spinner/Spinner";
import { Check, Close } from "../../../../components/svgs";
import { CSS_VARIABLES } from "../../../../data/css/variables";
import apiSlice, {
  useUpsertSavedGraphMutation,
} from "../../../../state/api/apiSlice";
import { saveGraph } from "../../../../state/graph/graph";
import { useAppDispatch, useAppSelector } from "../../../../state/hooks";
import { useGraphContext } from "../../../graph/Graph";

const ExpressionPanelSaveGraph = () => {
  const [message, setMessage] = useState<string>("Save");
  const dispatch = useAppDispatch();
  const [trigger, { data, isLoading, isError, error, reset }] =
    useUpsertSavedGraphMutation();
  const { data: userSession } =
    apiSlice.endpoints.getUser.useQueryState(undefined);
  const currentGraph = useAppSelector((state) => state.graphSlice.currentGraph);
  const graph = useGraphContext();

  const onComplete = (status: "error" | "success") => {
    reset();
    if (status === "error") setMessage("Try again");
    else {
      dispatch(saveGraph());
      setMessage("Save");
    }
  };

  return (
    <>
      {!isLoading && !isError && !data ? (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!graph || !userSession) return;
            if (currentGraph.isModified) {
              // trigger({ ...currentGraph, items: currentGraph.items.data });
            }

            const image = await graph.takeImageSnapshot();
            const formData = new FormData();

            formData.append("id", currentGraph.id);
            formData.append("name", currentGraph.name);
            formData.append("modified_at", new Date().toJSON());
            formData.append(
              "graph_snapshot",
              JSON.stringify(currentGraph.graph_snapshot)
            );
            formData.append("items", JSON.stringify(currentGraph.items.data));
            formData.append("image", image.blob);

            fetch("http://localhost:8080/api/test", {
              method: "post",
              credentials: "include",
              body: formData,
            });
          }}
        >
          <FilledButton
            aria-live="polite"
            disabled={!currentGraph.isModified}
            style={{ padding: "0 1rem" }}
          >
            {message}
          </FilledButton>
        </form>
      ) : (
        <SaveStatus
          onComplete={onComplete}
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
  onComplete,
}: {
  isLoading: boolean;
  isError: boolean;
  data: T | undefined;
  onComplete: (status: "error" | "success") => void;
}) {
  useEffect(() => {
    if (!data && !isError) return;

    setTimeout(() => {
      if (isError) return onComplete("error");
      onComplete("success");
    }, 5000);
  }, [data, isError]);

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
