import styles from "./input.module.scss";
import React, { useRef } from "react";

type ResizableTextareaProps = {
  textarea?: React.TextareaHTMLAttributes<HTMLTextAreaElement>;
  container?: { className?: string; style?: React.CSSProperties };
};

function adjustHeight(textarea: HTMLTextAreaElement) {
  textarea.style.height = "auto";
  textarea.style.height = `${textarea.scrollHeight}px`;
}

const ResizableTextarea = ({ textarea, container }: ResizableTextareaProps) => {
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
    <div style={container?.style} className={mergedClassnameTextAreaContainer}>
      <textarea
        {...textarea}
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
