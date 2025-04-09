import {
  useGetExampleGraphsQuery,
  useGetSavedGraphsQuery,
} from "../../../../state/api/apiSlice";
import GraphPreviewList, { PreviewListItem } from "./GraphPreviewList";
import { useAppSelector } from "../../../../state/hooks";
import { getElapsedTime } from "../../../../helpers/date";
import React from "react";
import { useGraphContext } from "../../../graph/Graph";

type GraphProps = {
  onClose: () => void;
  isOpen: boolean;
};
type GraphPreviewsProps = {
  onClose: () => void;
  isAuthenticated: boolean;
  isOpen: boolean;
};

export default React.memo(function GraphPreviews({
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
});

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
                image={item.graphSnapshot.image}
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
      <CurrentGraph isOpen onClose={onClose} />
      <SavedGraphs isOpen onClose={onClose} />
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
                body={item.modifiedAt}
                image={item.graphSnapshot.image}
                item={item}
              />
            );
          })}
        </GraphPreviewList>
      </section>
    );
}

function CurrentGraph({ isOpen, onClose }: GraphProps) {
  const currentGraph = useAppSelector((state) => state.graphSlice.currentGraph);
  const libGraph = useGraphContext();

  if (!isOpen) return;

  return (
    <section>
      <div className="section-separator">
        <h2>Current Graph</h2>
      </div>
      <div onClick={onClose}>
        <PreviewListItem
          item={currentGraph}
          image={
            libGraph ? libGraph.toDataURL() : currentGraph.graphSnapshot.image
          }
          idx={0}
          body={
            currentGraph.isModified ? "unsaved changes" : "no unsaved changes"
          }
        />
      </div>
    </section>
  );
}
