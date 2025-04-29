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

    const currentRef = ref.current;

    let cur = duration / 1000;

    const interval = setInterval(() => {
      cur -= 1;
      currentRef.textContent = timeFormatter.handle(cur / 60, "");
      if (cur === 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [fastForward]);

  return (
    <span role="timer" className={className} style={style} ref={ref}>
      {!fastForward && timeFormatter.handle(duration / 1000 / 60, "")}
      {fastForward && timeFormatter.handle(0, "")}
    </span>
  );
};

export default TimeoutLiteral;
