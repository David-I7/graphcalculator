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
};

const Tooltip = ({ content, message }: TooltipProps) => {
  const ariaDescribedByID = useId();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const timeoutId: RefObject<NodeJS.Timeout | null> = useRef(null);
  const tooltipRef: RefObject<HTMLDivElement | null> = useRef(null);

  useEffect(() => {
    if (!tooltipRef.current || !isOpen) return;

    const contentRect = tooltipRef.current.getBoundingClientRect();
    if (contentRect.left <= 0) {
      tooltipRef.current.style.translate = `${
        Math.abs(contentRect.left) + 2
      }px`;
    } else if (contentRect.right >= window.innerWidth) {
      const offset = contentRect.right - window.innerWidth;
      tooltipRef.current.style.translate = `${offset - 2}px`;
    }
  }, [isOpen]);

  return (
    <div
      onFocus={(e) => {
        setIsOpen(true);
      }}
      onBlur={(e) => {
        setIsOpen(false);
      }}
      onMouseEnter={() => {
        if (timeoutId.current) clearTimeout(timeoutId.current);
        timeoutId.current = setTimeout(() => {
          setIsOpen(true);
        }, CSS_VARIABLES.animationSpeedSlowest);
      }}
      onMouseLeave={(e) => {
        if (timeoutId.current) clearTimeout(timeoutId.current);
        setIsOpen(false);
      }}
      className={styles.tooltipContainer}
    >
      {content(ariaDescribedByID)}
      <div
        ref={tooltipRef}
        role="tooltip"
        id={ariaDescribedByID}
        className={styles.tooltip}
        style={isOpen ? { opacity: 1 } : { opacity: 0 }}
      >
        {message}
      </div>
      <div
        style={
          isOpen
            ? { opacity: 1, pointerEvents: "initial" }
            : { opacity: 0, pointerEvents: "none" }
        }
        className={styles.tooltipTriangle}
      ></div>
    </div>
  );
};

export default Tooltip;
