import { useEffect, useRef, useState } from "react";
import { MOBILE_BREAKPOINT } from "../../../data/css/breakpoints";
import ButtonTarget from "../../../components/buttons/target/ButtonTarget";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
} from "../../../components/svgs";
import { createPortal } from "react-dom";
import { throttle } from "../../../helpers/performance";

const MIN_SIZE = 280;
const MAX_SIZE_OFFSET = 280;
const ANIMATION_DURATION = 250;

const AnimateSlideLeft: Keyframe[] = [
  { offset: 0, transform: "translateX(0)" },
  {
    offset: 1,
    transform: "translateX(-100%)",
  },
];
const AnimateSlideDown: Keyframe[] = [
  { offset: 0, transform: "translateY(0)" },
  {
    offset: 1,
    transform: "translateY(100%)",
  },
];

const AnimationOptions: KeyframeAnimationOptions = {
  fill: "forwards",
  duration: ANIMATION_DURATION,
  easing: "ease-out",
};

const ExpressionPanelResizer = () => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [isMobile, setIsMobile] = useState<boolean>(
    window.innerWidth <= MOBILE_BREAKPOINT
  );
  const resizerRef = useRef<HTMLDivElement>(null);
  const graphContainerRef = useRef<HTMLDivElement>(null);
  const expressionPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    graphContainerRef.current = document.querySelector(
      ".graph-container"
    ) as HTMLDivElement;
    expressionPanelRef.current = document.querySelector(
      ".expression-panel"
    ) as HTMLDivElement;

    if (!graphContainerRef.current || !expressionPanelRef.current)
      throw new Error("No refernce to graph container or expression panel");

    const resizerController = new AbortController();
    let windowController: AbortController;

    isOpen &&
      resizerRef.current!.addEventListener(
        "mousedown",
        (e) => {
          if (isMobile) return;

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

          function onMouseLeave() {
            document.body.style.cursor = "default";
            windowController.abort();
          }
        },
        { signal: resizerController.signal }
      );

    window.addEventListener(
      "resize",
      throttle(() => {
        if (window.innerWidth <= MOBILE_BREAKPOINT) {
          expressionPanelRef.current!.style.removeProperty("width");
          graphContainerRef.current!.style.removeProperty("width");

          if (!isMobile) {
            setIsMobile(true);
          }
        } else {
          graphContainerRef.current!.style.removeProperty("height");

          graphContainerRef.current!.style.width = isOpen
            ? `calc(100% - ${expressionPanelRef.current!.offsetWidth}px)`
            : "100%";

          if (isMobile) {
            setIsMobile(false);
          }
        }
      }, 50),
      { signal: resizerController.signal }
    );

    return () => {
      resizerController.abort();
      windowController?.abort();
    };
  }, [isMobile, isOpen]);

  console.log(isMobile);

  return (
    <>
      {isOpen && (
        <>
          <ButtonTarget
            onClick={(e) => {
              if (isMobile) {
                expressionPanelRef.current!.animate(
                  AnimateSlideDown,
                  AnimationOptions
                );
                graphContainerRef.current!.style.height = "100%";
              } else {
                expressionPanelRef.current!.animate(
                  AnimateSlideLeft,
                  AnimationOptions
                );
                graphContainerRef.current!.style.width = "100%";
              }
              setTimeout(() => {
                setIsOpen(!isOpen);
              }, ANIMATION_DURATION);
            }}
            className="button--hovered bg-surface-container-low"
          >
            {isMobile ? <ArrowDown /> : <ArrowLeft />}
          </ButtonTarget>
          <div ref={resizerRef} className="expression-panel__resizer"></div>
        </>
      )}
      {!isOpen &&
        createPortal(
          <ButtonTarget
            onClick={(e) => {
              if (isMobile) {
                expressionPanelRef.current!.animate(AnimateSlideDown, {
                  ...AnimationOptions,
                  direction: "reverse",
                });
                graphContainerRef.current!.style.height = "50%";
              } else {
                expressionPanelRef.current!.animate(AnimateSlideLeft, {
                  ...AnimationOptions,
                  direction: "reverse",
                });
                graphContainerRef.current!.style.width = `calc(100% - ${
                  expressionPanelRef.current!.offsetWidth
                }px)`;
              }
              setTimeout(() => {
                setIsOpen(!isOpen);
              }, ANIMATION_DURATION);
            }}
            style={
              isMobile
                ? { position: "fixed", bottom: "0.5rem", right: "0.5rem" }
                : { position: "fixed", top: "0.5rem", left: "0.5rem" }
            }
            className="button--hovered bg-surface-container-low"
          >
            {isMobile ? <ArrowUp /> : <ArrowRight />}
          </ButtonTarget>,
          document.body
        )}
    </>
  );
};

export default ExpressionPanelResizer;
