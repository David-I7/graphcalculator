import {
  useGetExampleGraphsQuery,
  useGetSavedGraphsQuery,
} from "../../../../state/api/apiSlice";
import GraphPreviewList, { PreviewListItem } from "./GraphPreviewList";
import { useAppSelector } from "../../../../state/hooks";
import { getElapsedTime } from "../../../../helpers/date";

type GraphPreviewProps = {
  onClose: () => void;
  isAuthenticated: boolean;
};

const GraphPreviews = ({ onClose, isAuthenticated }: GraphPreviewProps) => {
  return (
    <>
      {isAuthenticated && (
        <>
          <CurrentGraph onClose={onClose} />
          <SavedGraphs onClose={onClose} isAuthenticated={isAuthenticated} />
        </>
      )}

      <ExampleGraphs onClose={onClose} />
    </>
  );
};

export default GraphPreviews;

function ExampleGraphs({ onClose }: { onClose: () => void }) {
  const { data, isLoading, isError } = useGetExampleGraphsQuery();

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

function SavedGraphs({
  onClose,
  isAuthenticated,
}: {
  onClose: () => void;
  isAuthenticated: boolean;
}) {
  const { data, isLoading, isError } = useGetSavedGraphsQuery(undefined, {
    skip: !isAuthenticated,
  });

  return (
    <section>
      <div className="section-separator">
        <h2>Saved Graphs</h2>
      </div>
      {isLoading && <>Loading...</>}
      {isError && <>Error</>}
      {data && (
        <GraphPreviewList toggleMenu={onClose} data={data}>
          {data.map((item, idx) => {
            return (
              <PreviewListItem
                idx={idx}
                key={item.id}
                body={item.modifiedAt}
                item={item}
              />
            );
          })}
        </GraphPreviewList>
      )}
    </section>
  );
}

function CurrentGraph({ onClose }: { onClose: () => void }) {
  const currentGraph = useAppSelector((state) => state.graphSlice.currentGraph);

  return (
    <section>
      <div className="section-separator">
        <h2>Current Graph</h2>
      </div>
      <div onClick={onClose}>
        <PreviewListItem
          item={currentGraph}
          idx={0}
          body={
            currentGraph.isModified ? "unsaved changes" : "no unsaved changes"
          }
        />
      </div>
    </section>
  );
}
