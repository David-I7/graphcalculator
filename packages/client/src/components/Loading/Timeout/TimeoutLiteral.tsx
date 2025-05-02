import React, { useEffect, useRef } from "react";
import { buildRemaingHandler } from "../../../helpers/date/elapsedTime";

const TimeoutLiteral = ({
  style,
  duration,
  className,
  fastForward = false,
}: {
  duration: number;
  fastForward?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const timeFormatter = buildRemaingHandler();

  useEffect(() => {
    if (!ref.current || fastForward) return;

    let cur = duration / 1000;

    const interval = setInterval(() => {
      if (!ref.current) return;
      cur -= 1;
      ref.current.textContent = timeFormatter.handle(cur / 60, "");
      if (cur === 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [fastForward]);

  return (
    <span role="timer" className={className} style={style}>
      {!fastForward && (
        <span ref={ref}>{timeFormatter.handle(duration / 1000 / 60, "")}</span>
      )}
      {fastForward && <span>{timeFormatter.handle(0, "")}</span>}
    </span>
  );
};

export default TimeoutLiteral;
