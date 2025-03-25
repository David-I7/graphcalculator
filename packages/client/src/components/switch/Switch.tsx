import { InputHTMLAttributes, useId, useMemo } from "react";
import styles from "./switch.module.scss";

type SwitchProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "id">;

const Switch = (props: SwitchProps) => {
  const mergedClassname = useMemo(() => {
    return props.className
      ? styles.switch + " " + props.className
      : styles.switch;
  }, [props.className]);
  const id = useId();
  return (
    <>
      <input {...props} id={id} type="checkbox" className={mergedClassname} />
      <label htmlFor={id} />
    </>
  );
};

export default Switch;
