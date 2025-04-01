import React from "react";
import {
  useGetExampleGraphsQuery,
  useGetSavedGraphsQuery,
} from "../../../../state/api/apiSlice";
import GraphPreviewList, { PreviewListItem } from "./GraphPreviewList";

type GraphPreviewProps = {
  onClose: () => void;
  isAuthenticated: boolean;
};

const GraphPreviews = ({ onClose, isAuthenticated }: GraphPreviewProps) => {
  const { data, isLoading, isError } = useGetExampleGraphsQuery();
  const {
    data: savedGraphs,
    isLoading: isLoadingSaved,
    isError: isErrorSaved,
    isUninitialized,
  } = useGetSavedGraphsQuery(undefined, { skip: !isAuthenticated });
  // console.log(isUninitialized);
  return (
    <>
      {isAuthenticated && (
        <>
          <section>
            <h2>Current Graph</h2>
          </section>
          <section>
            <h2>Saved Graphs</h2>
          </section>
        </>
      )}

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
    </>
  );
};

export default GraphPreviews;
