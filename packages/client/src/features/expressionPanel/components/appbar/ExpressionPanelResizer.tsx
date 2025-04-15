import { useEffect, useRef, useState } from "react";
import ButtonTarget from "../../../../components/buttons/target/ButtonTarget";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
} from "../../../../components/svgs";
import { createPortal } from "react-dom";
import { throttle } from "../../../../helpers/timing";
import {
  AnimateSlideY,
  AnimateSlideX,
  KeyframeAnimationOptionsBuilder,
} from "../../../../lib/animations";
import { CSS_VARIABLES } from "../../../../data/css/variables";
import { useAppSelector } from "../../../../state/hooks";
import { usePopulateRef } from "../../../../hooks/reactutils";
import Tooltip from "../../../../components/tooltip/Tooltip";

const MIN_SIZE = 320;
const MAX_SIZE_OFFSET = 280;

const ExpressionPanelResizer = () => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const isMobile = useAppSelector((state) => state.globalSlice.isMobile);
  const resizerRef = useRef<HTMLDivElement>(null);
  const graphContainerRef = useRef<HTMLDivElement>(null);
  const expressionPanelRef = useRef<HTMLDivElement>(null);
  const animationOptions = useRef(
    new KeyframeAnimationOptionsBuilder().build()
  );

  usePopulateRef(graphContainerRef, { selector: ".graph-container" });
  usePopulateRef(expressionPanelRef, { selector: ".expression-panel" });

  useEffect(() => {
    if (!graphContainerRef.current || !expressionPanelRef.current) return;

    const resizerController = new AbortController();
    let windowController: AbortController;
    expressionPanelRef.current.inert = !isOpen;

    !isOpen && expressionPanelRef.current.blur();

    isOpen &&
      !isMobile &&
      resizerRef.current!.addEventListener(
        "pointerdown",
        (e) => {
          if (isMobile) return;

          // cleanup
          e.preventDefault();
          windowController?.abort();

          //setup
          if (e.pointerType !== "touch") {
            document.body.style.cursor = "e-resize";
          }
          windowController = new AbortController();
          resizerRef.current!.setPointerCapture(e.pointerId);

          resizerRef.current!.addEventListener("pointermove", onPointMove, {
            signal: windowController.signal,
          });
          resizerRef.current!.addEventListener("pointerleave", onPointLeave, {
            signal: windowController.signal,
          });
          resizerRef.current!.addEventListener("pointerup", onPointLeave, {
            signal: windowController.signal,
          });

          function onPointMove(e: PointerEvent) {
            const offsetX = e.clientX - expressionPanelRef.current!.offsetWidth;

            if (
              expressionPanelRef.current!.offsetWidth + offsetX < MIN_SIZE ||
              expressionPanelRef.current!.offsetWidth + offsetX >
                window.innerWidth - MAX_SIZE_OFFSET
            )
              return;

            expressionPanelRef.current!.style.width = `${
              expressionPanelRef.current!.offsetWidth + offsetX
            }px`;
            graphContainerRef.current!.style.width = `calc(100% - ${
              expressionPanelRef.current!.offsetWidth
            }px)`;
          }

          function onPointLeave(e: PointerEvent) {
            if (e.pointerType !== "touch") {
              document.body.style.cursor = "default";
            }
            windowController.abort();
          }
        },
        { signal: resizerController.signal, passive: false }
      );

    const throttledResize = throttle(() => {
      if (isMobile) {
        expressionPanelRef.current!.style.removeProperty("width");
        graphContainerRef.current!.style.removeProperty("width");
      } else {
        graphContainerRef.current!.style.removeProperty("height");
        graphContainerRef.current!.style.width = isOpen
          ? `calc(100% - ${expressionPanelRef.current!.offsetWidth}px)`
          : "100%";
      }
    }, 50);

    window.addEventListener("resize", throttledResize.throttleFunc, {
      signal: resizerController.signal,
    });

    throttledResize.throttleFunc();

    return () => {
      resizerController.abort();
      windowController?.abort();
      throttledResize.abort();
    };
  }, [isMobile, isOpen]);

  return (
    <>
      <>
        <Tooltip
          message="Hide Expression List"
          content={(id) => {
            return (
              <ButtonTarget
                aria-describedby={id}
                onClick={() => {
                  if (isMobile) {
                    expressionPanelRef.current!.animate(
                      AnimateSlideY(),
                      animationOptions.current
                    );
                    graphContainerRef.current!.style.height = "100%";
                  } else {
                    expressionPanelRef.current!.animate(
                      AnimateSlideX(),
                      animationOptions.current
                    );
                    graphContainerRef.current!.style.width = "100%";
                  }
                  setTimeout(() => {
                    setIsOpen(!isOpen);
                  }, CSS_VARIABLES.animationSpeedDefault);
                }}
                className="button--hovered bg-surface-container-low"
              >
                {isMobile ? <ArrowDown /> : <ArrowLeft />}
              </ButtonTarget>
            );
          }}
        />
        <div ref={resizerRef} className="expression-panel__resizer"></div>
      </>

      {!isOpen &&
        createPortal(
          <Tooltip
            style={
              isMobile
                ? { position: "fixed", bottom: "0.5rem", right: "0.5rem" }
                : { position: "fixed", top: "0.5rem", left: "0.5rem" }
            }
            message="Show List"
            content={(id) => {
              return (
                <ButtonTarget
                  aria-describedby={id}
                  onClick={() => {
                    if (isMobile) {
                      expressionPanelRef.current!.animate(
                        AnimateSlideY("100%", "0"),
                        animationOptions.current
                      );
                      graphContainerRef.current!.style.height = "50%";
                    } else {
                      expressionPanelRef.current!.animate(
                        AnimateSlideX("-100%", "0"),
                        animationOptions.current
                      );
                      graphContainerRef.current!.style.width = `calc(100% - ${
                        expressionPanelRef.current!.offsetWidth
                      }px)`;
                    }
                    setTimeout(() => {
                      setIsOpen(!isOpen);
                    }, CSS_VARIABLES.animationSpeedDefault);
                  }}
                  className="button--hovered bg-surface-container-low"
                >
                  {isMobile ? <ArrowUp /> : <ArrowRight />}
                </ButtonTarget>
              );
            }}
          />,
          document.getElementById("root")!
        )}
    </>
  );
};

export default ExpressionPanelResizer;
