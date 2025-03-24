import { InputHTMLAttributes, useMemo } from "react";
import styles from "./input.module.scss";

type UnderlineInputProps = InputHTMLAttributes<HTMLInputElement>;

const UnderlineInput = (props: UnderlineInputProps) => {
  const mergedClassname = useMemo(() => {
    return props.className
      ? props.className + " " + styles.underlineInput
      : styles.underlineInput;
  }, [props.className]);

  return <input {...props} className={mergedClassname} type="number" />;
};

export default UnderlineInput;
