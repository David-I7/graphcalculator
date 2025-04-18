import {
  useGetExampleGraphsQuery,
  useGetSavedGraphsInfiniteQuery,
} from "../../../../state/api/apiSlice";
import GraphPreviewList, {
  PreviewListItem,
  PreviewListItemSaved,
} from "./GraphPreviewList";
import { useAppDispatch, useAppSelector } from "../../../../state/hooks";
import { getElapsedTime } from "../../../../helpers/date";
import React, { useEffect, useMemo } from "react";
import { useGraphContext } from "../../../graph/Graph";
import { upsertImageSnapshot } from "../../../../state/graph/graph";
import { useIntersectionObserver } from "../../../../hooks/dom";
import Spinner from "../../../../components/Loading/Spinner/Spinner";
import { CSS_VARIABLES } from "../../../../data/css/variables";

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
                image={item.image}
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
  const { data, isFetching, fetchNextPage, hasNextPage } =
    useGetSavedGraphsInfiniteQuery();
  const allData = useMemo(() => {
    if (!data || !data.pages[0].graphs.length) return;
    return data.pages.flatMap(({ graphs }) => graphs);
  }, [data]);

  useIntersectionObserver(
    () => document.querySelector(".preview-list-item-saved:last-child")!,
    (entries, observer) => {
      if (entries[0].isIntersecting) {
        observer.unobserve(entries[0].target);
        fetchNextPage();
      }
    },
    {
      enabled: isFetching || !hasNextPage ? false : isOpen,
      intersectionObserverOpt: {
        root: document.querySelector(".graph-menu"),
        rootMargin: "0px 0px 100px 0px",
      },
    }
  );

  if (!isOpen) return;
  if (!allData) return;

  return (
    <section>
      <div className="section-separator">
        <h2>Saved Graphs</h2>
      </div>

      <GraphPreviewList toggleMenu={onClose} data={allData}>
        {allData.map((item, idx) => {
          return (
            <PreviewListItemSaved
              idx={idx}
              key={item.id}
              body={getElapsedTime(item.modified_at)}
              image={item.image}
              item={item}
            />
          );
        })}
      </GraphPreviewList>
      {isFetching && (
        <div className="grid-center" style={{ paddingTop: "1rem" }}>
          <Spinner
            style={{
              borderColor: CSS_VARIABLES.inverseOnSurfaceHeading,
              borderTopColor: "black",
            }}
          />
        </div>
      )}
    </section>
  );
}

function CurrentGraph({ isOpen, onClose }: GraphProps) {
  const dispatch = useAppDispatch();
  const currentGraph = useAppSelector((state) => state.graphSlice.currentGraph);
  const libGraph = useGraphContext();

  useEffect(() => {
    if (!isOpen || !libGraph) return;

    (async () => {
      libGraph.revokeObjectUrl(currentGraph.image.client);
      const snapshot = await libGraph.takeImageSnapshot("url");
      dispatch(upsertImageSnapshot(snapshot));
    })();
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
          image={currentGraph.image.client}
          idx={0}
          body={
            currentGraph.isModified
              ? currentGraph.image.server !== ""
                ? `last saved: ${getElapsedTime(currentGraph.modified_at)}`
                : "unsaved changes"
              : "no unsaved changes"
          }
        />
      </div>
    </section>
  );
}
