import { useEffect, useRef } from "react";
import { MOBILE_BREAKPOINT } from "../../../data/css/breakpoints";

const MIN_SIZE = 280;
const MAX_SIZE_OFFSET = 280;

const ExpressionPanelResizer = () => {
  const resizerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!resizerRef.current) return;

    const graphContainer = document.querySelector(
      ".graph-container"
    ) as HTMLDivElement;
    const panel = resizerRef.current.parentElement!;
    const resizerController = new AbortController();
    let windowController: AbortController;

    resizerRef.current.addEventListener(
      "mousedown",
      (e) => {
        // cleanup
        e.preventDefault();
        windowController?.abort();

        //setup
        document.body.style.cursor = "e-resize";
        windowController = new AbortController();

        window.addEventListener("mousemove", onMouseMove, {
          signal: windowController.signal,
        });
        window.addEventListener("mouseleave", onMouseLeave, {
          signal: windowController.signal,
        });
        window.addEventListener("mouseup", onMouseLeave, {
          signal: windowController.signal,
        });

        function onMouseMove(e: MouseEvent) {
          if (window.innerWidth < MOBILE_BREAKPOINT) return;
          const offsetX = e.clientX - panel.offsetWidth;
          if (offsetX <= 0 && panel.offsetWidth <= MIN_SIZE) return;
          if (
            offsetX > 0 &&
            window.innerWidth - panel.offsetWidth <= MAX_SIZE_OFFSET
          )
            return;

          panel.style.width = `${panel.offsetWidth + offsetX}px`;
          graphContainer.style.width = `${
            graphContainer.offsetWidth - offsetX
          }px`;
        }

        function onMouseLeave() {
          document.body.style.cursor = "default";
          windowController.abort();
        }
      },
      { signal: resizerController.signal }
    );

    window.addEventListener(
      "resize",
      () => {
        if (window.innerWidth <= MOBILE_BREAKPOINT) {
          panel.style.removeProperty("width");
          graphContainer.style.removeProperty("width");
        }
      },
      { signal: resizerController.signal }
    );

    return () => {
      resizerController.abort();
      windowController?.abort();
    };
  }, []);

  return <div ref={resizerRef} className="expression-panel__resizer"></div>;
};

export default ExpressionPanelResizer;
