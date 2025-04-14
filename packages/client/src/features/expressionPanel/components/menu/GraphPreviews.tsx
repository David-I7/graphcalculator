import {
  useGetExampleGraphsQuery,
  useGetSavedGraphsQuery,
} from "../../../../state/api/apiSlice";
import GraphPreviewList, { PreviewListItem } from "./GraphPreviewList";
import { useAppDispatch, useAppSelector } from "../../../../state/hooks";
import { getElapsedTime } from "../../../../helpers/date";
import React, { useEffect } from "react";
import { useGraphContext } from "../../../graph/Graph";
import { upsertGraphSnapshot } from "../../../../state/graph/graph";

type GraphProps = {
  onClose: () => void;
  isOpen: boolean;
};
type GraphPreviewsProps = {
  onClose: () => void;
  isAuthenticated: boolean;
  isOpen: boolean;
};

export default React.memo(
  function GraphPreviews({
    onClose,
    isAuthenticated,
    isOpen,
  }: GraphPreviewsProps) {
    return (
      <>
        {isAuthenticated && <UserGraphs isOpen={isOpen} onClose={onClose} />}
        <ExampleGraphs isOpen={isOpen} onClose={onClose} />
      </>
    );
  },
  (prev, cur) =>
    prev.isOpen === cur.isOpen && prev.isAuthenticated === cur.isAuthenticated
);

function ExampleGraphs({ isOpen, onClose }: GraphProps) {
  const { data, isLoading, isError } = useGetExampleGraphsQuery();

  if (!isOpen) return;

  return (
    <section>
      <div className="section-separator">
        <h2>Examples</h2>
      </div>
      {isLoading && <>Loading...</>}
      {isError && <>Error</>}
      {data && (
        <GraphPreviewList toggleMenu={onClose} data={data}>
          {data.map((item, idx) => {
            return (
              <PreviewListItem
                image={item.graph_snapshot.image}
                idx={idx}
                key={item.id}
                body={"example"}
                item={item}
              />
            );
          })}
        </GraphPreviewList>
      )}
    </section>
  );
}

function UserGraphs({ isOpen, onClose }: GraphProps) {
  return (
    <>
      <CurrentGraph isOpen={isOpen} onClose={onClose} />
      <SavedGraphs isOpen={isOpen} onClose={onClose} />
    </>
  );
}

function SavedGraphs({ isOpen, onClose }: GraphProps) {
  const { data, isLoading, isError } = useGetSavedGraphsQuery();

  if (!isOpen) return;

  if (data && data.length)
    return (
      <section>
        <div className="section-separator">
          <h2>Saved Graphs</h2>
        </div>

        <GraphPreviewList toggleMenu={onClose} data={data}>
          {data.map((item, idx) => {
            return (
              <PreviewListItem
                idx={idx}
                key={item.id}
                body={item.modified_at}
                image={item.graph_snapshot.image}
                item={item}
              />
            );
          })}
        </GraphPreviewList>
      </section>
    );
}

function CurrentGraph({ isOpen, onClose }: GraphProps) {
  const dispatch = useAppDispatch();
  const currentGraph = useAppSelector((state) => state.graphSlice.currentGraph);
  const libGraph = useGraphContext();

  useEffect(() => {
    if (!isOpen || !libGraph) return;

    dispatch(upsertGraphSnapshot(libGraph.takeGraphStateSnapshot()));
  }, [isOpen]);

  if (!isOpen) return;

  return (
    <section>
      <div className="section-separator">
        <h2>Current Graph</h2>
      </div>
      <div onClick={onClose}>
        <PreviewListItem
          item={currentGraph}
          image={currentGraph.graph_snapshot.image}
          idx={0}
          body={
            currentGraph.isModified ? "unsaved changes" : "no unsaved changes"
          }
        />
      </div>
    </section>
  );
}
