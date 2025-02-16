import React, { useRef } from "react";

type ExpressionTextareaProps =
  React.TextareaHTMLAttributes<HTMLTextAreaElement>;

function adjustHeight(textarea: HTMLTextAreaElement) {
  textarea.style.height = "auto";
  textarea.style.height = `${textarea.scrollHeight}px`;
}

const ExpressionTextarea = (props: ExpressionTextareaProps) => {
  const measureRef = useRef<HTMLSpanElement>(null);

  return (
    <div
      style={{
        paddingBlock: "0.5rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <textarea
        {...props}
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
        className="expression-list__textarea"
      ></textarea>
      <span
        ref={measureRef}
        aria-hidden={true}
        className="font-body-xl"
        style={{ visibility: "hidden", position: "absolute" }}
      ></span>
    </div>
  );
};

export default ExpressionTextarea;
