import React, { ReactNode } from "react";
import styles from "./buttonTarget.module.scss";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

const ButtonTarget = (props: Props) => {
  const mergedClassName = React.useMemo(
    () =>
      props.className
        ? styles.buttonTarget + ` ${props.className}`
        : styles.buttonTarget,
    [props.className]
  );

  return (
    <button {...props} className={mergedClassName}>
      {props.children}
    </button>
  );
};

export default ButtonTarget;
