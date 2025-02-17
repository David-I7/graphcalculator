import React, { MouseEvent } from "react";
import styles from "./scrim.module.scss";
import { createPortal } from "react-dom";

type ScrimProps = {
  portal?: { container: Element | DocumentFragment; key?: React.Key | null };
  className?: string;
  style?: React.CSSProperties;
  onClose: (e: MouseEvent<HTMLDivElement>) => void;
};

const Scrim = ({ portal, className, style, onClose }: ScrimProps) => {
  const mergedClassname = React.useMemo(() => {
    return className ? `${className} ${styles.scrim}` : styles.scrim;
  }, [className]);

  if (portal?.container) {
    return createPortal(
      <div
        onClick={(e) => {
          if (e.target !== e.currentTarget) return;
          onClose(e);
        }}
        style={style}
        className={mergedClassname}
      ></div>,
      portal.container,
      portal.key
    );
  }

  return (
    <div
      onClick={(e) => {
        if (e.target !== e.currentTarget) return;
        onClose(e);
      }}
      style={style}
      className={mergedClassname}
    ></div>
  );
};

export default Scrim;
