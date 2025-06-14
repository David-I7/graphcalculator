import styles from "./input.module.scss";
import React, { useRef } from "react";

type ResizableTextareaProps = {
  textarea?: React.TextareaHTMLAttributes<HTMLTextAreaElement>;
  container?: { className?: string; style?: React.CSSProperties };
  ref?: React.RefObject<HTMLTextAreaElement | null>;
};

function adjustHeight(textarea: HTMLTextAreaElement) {
  textarea.style.height = "auto";
  textarea.style.height = `${textarea.scrollHeight}px`;
}

const ResizableTextarea = ({
  textarea,
  container,
  ref,
}: ResizableTextareaProps) => {
  const measureRef = useRef<HTMLSpanElement>(null);

  const mergedClassnameTextAreaContainer = React.useMemo(() => {
    return container?.className
      ? `${container.className} ${styles.textareaContainer}`
      : styles.textareaContainer;
  }, [container?.className]);
  const mergedClassnameTextArea = React.useMemo(() => {
    return textarea?.className
      ? `${textarea.className} ${styles.textarea}`
      : styles.textarea;
  }, [textarea?.className]);

  return (
    <div
      onClick={(e) => {
        if (e.currentTarget === e.target)
          (e.currentTarget.children[0] as HTMLTextAreaElement).focus();
      }}
      style={container?.style}
      className={mergedClassnameTextAreaContainer}
    >
      <textarea
        {...textarea}
        ref={ref}
        onInput={(e) => {
          measureRef.current!.innerText = e.currentTarget.value;
          if (
            measureRef.current!.offsetWidth >=
            e.currentTarget.offsetWidth - 4
          ) {
            adjustHeight(e.currentTarget);
          } else {
            e.currentTarget.style.removeProperty("height");
          }
        }}
        className={mergedClassnameTextArea}
      ></textarea>
      <span
        ref={measureRef}
        aria-hidden={true}
        style={{ visibility: "hidden", position: "absolute" }}
      ></span>
    </div>
  );
};

export default ResizableTextarea;
