import { ButtonHTMLAttributes, ReactNode, RefObject, useMemo } from "react";
import styles from "./common.module.scss";

type FilledButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  ref?: RefObject<HTMLButtonElement | null>;
};

const FilledButton = ({ children, ref, ...props }: FilledButtonProps) => {
  const mergedClassname = useMemo(() => {
    return props.className
      ? props.className + " " + styles.filledButton
      : styles.filledButton;
  }, [props.className]);

  return (
    <button ref={ref} {...props} className={mergedClassname}>
      {children}
    </button>
  );
};

export default FilledButton;
