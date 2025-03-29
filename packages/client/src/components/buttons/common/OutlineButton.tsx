import { ButtonHTMLAttributes, ReactNode, RefObject, useMemo } from "react";
import styles from "./common.module.scss";

type OutlinedButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  ref?: RefObject<HTMLButtonElement | null>;
};

const OutlinedButton = ({ children, ref, ...props }: OutlinedButtonProps) => {
  const mergedClassname = useMemo(() => {
    return props.className
      ? props.className + " " + styles.outlinedButton
      : styles.outlinedButton;
  }, [props.className]);

  return (
    <button ref={ref} {...props} className={mergedClassname}>
      {children}
    </button>
  );
};

export default OutlinedButton;
