import {
  JSX,
  ReactNode,
  RefObject,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import styles from "./tooltip.module.scss";
import { CSS_VARIABLES } from "../../data/css/variables";

type TooltipProps = {
  content: (ariaDescribedByID: string) => JSX.Element;
  message: string;
  style?: React.CSSProperties;
  fixedPosition?: "left" | "right" | "bottom" | "top";
};

const Tooltip = ({ style, content, message, fixedPosition }: TooltipProps) => {
  const ariaDescribedByID = useId();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const timeoutId: RefObject<NodeJS.Timeout | null> = useRef(null);
  const tooltipRef: RefObject<HTMLDivElement | null> = useRef(null);

  useEffect(() => {
    if (!tooltipRef.current || !isOpen) return;
    const currentTooltip = tooltipRef.current;
    const triangle = tooltipRef.current.nextElementSibling as HTMLDivElement;

    if (isOpen) {
      queueMicrotask(() => {
        triangle.style.opacity = "1";
        currentTooltip.style.opacity = "1";
      });

      if (!fixedPosition) repositionTooltip(currentTooltip, triangle);
      else {
        repositionFixedTooltip(fixedPosition, currentTooltip, triangle);
      }
    }
  }, [isOpen]);

  return (
    <div
      style={style}
      // onFocus={(e) => {
      //   setIsOpen(true);
      // }}
      // onBlurCapture={(e) => {
      //   console.log(e);
      //   setIsOpen(false);
      // }}
      onMouseEnter={(e) => {
        if (timeoutId.current) return;
        timeoutId.current = setTimeout(() => {
          setIsOpen(true);
        }, CSS_VARIABLES.animationSpeedSlowest);
      }}
      onMouseLeave={(e) => {
        if (!timeoutId.current) return;
        clearTimeout(timeoutId.current);
        timeoutId.current = null;
        if (isOpen) {
          setIsOpen(false);
        }
      }}
      className={styles.tooltipContainer}
    >
      {content(ariaDescribedByID)}
      {isOpen && (
        <>
          <div
            ref={tooltipRef}
            role="tooltip"
            id={ariaDescribedByID}
            className={styles.tooltip}
          >
            {message}
          </div>
          <div className={styles.tooltipTriangle}></div>
        </>
      )}
    </div>
  );
};

export default Tooltip;

function repositionTooltip(tooltip: HTMLDivElement, triangle: HTMLDivElement) {
  const contentRect = tooltip.getBoundingClientRect();

  if (contentRect.left <= 0) {
    tooltip.style.translate = `${Math.abs(contentRect.left) + 2}px`;
  } else if (contentRect.right >= window.innerWidth) {
    const offset = contentRect.right - window.innerWidth;
    tooltip.style.translate = `-${offset + 2}px`;
  }

  if (contentRect.bottom > window.innerHeight) {
    triangle.style.rotate = "180deg";
    triangle.style.top = "-0.25rem";
    triangle.style.transform = "translateY(0) translateX(50%)";

    tooltip.style.top = "-0.25rem";
    tooltip.style.translate = tooltip.style.translate + ` -${100}%`;
  }
}

function repositionFixedTooltip(
  postion: "left" | "right" | "top" | "bottom",
  tooltip: HTMLDivElement,
  triangle: HTMLDivElement
) {
  switch (postion) {
    case "bottom":
      //default is bottom
      return;
    case "top":
      triangle.style.rotate = "180deg";
      triangle.style.top = "-0.25rem";
      triangle.style.transform = "translateY(0) translateX(50%)";

      tooltip.style.top = "-0.25rem";
      tooltip.style.translate = tooltip.style.translate + ` -${100}%`;
      break;
    case "left":
      triangle.style.rotate = "90deg";
      triangle.style.left = "-0.5rem";
      triangle.style.top = "calc(50% - 0.125rem)";
      triangle.style.transform = "translateX(0) translateY(-50%)";

      tooltip.style.left = "-0.25rem";
      tooltip.style.top = "50%";
      tooltip.style.transform = "translateX(-100%) translateY(-50%)";
      break;
    case "right":
      triangle.style.rotate = "-90deg";
      triangle.style.left = "100%";
      triangle.style.top = "calc(50% + 0.25rem)";
      triangle.style.transform = "translateX(100%) translateY(-50%)";

      tooltip.style.left = "calc(100% + 0.25rem)";
      tooltip.style.top = "50%";
      tooltip.style.transform = "translateX(0) translateY(-50%)";
      break;
  }
}
