import React, { InputHTMLAttributes, useMemo, useState } from "react";
import styles from "./input.module.scss";
import { CSS_VARIABLES } from "../../data/css/variables";
import ButtonTarget from "../buttons/target/ButtonTarget";
import { Invisible, Visible } from "../svgs";

type FormInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  isError?: boolean;
  message?: string;
};

const PasswordInput = ({ isError, message, ...inputProps }: FormInputProps) => {
  const [isVisble, setIsVisible] = useState<boolean>(false);
  const mergedClassname = useMemo(() => {
    return inputProps.className
      ? inputProps.className + " " + styles.formInput
      : styles.formInput;
  }, [inputProps.className]);

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget)
          (e.currentTarget.children[0] as HTMLInputElement).focus();
      }}
      className={styles.passwordInputContainer}
      style={
        isError
          ? {
              ...inputProps.style,
              border: `2px solid ${CSS_VARIABLES.error}`,
            }
          : inputProps.style
      }
    >
      <input
        {...inputProps}
        type={isVisble ? "text" : "password"}
        className={mergedClassname}
      />
      <ButtonTarget
        style={{
          outlineOffset: "-2px",
          outlineColor: CSS_VARIABLES.borderNormal,
        }}
        onClick={() => setIsVisible(!isVisble)}
        type="button"
      >
        {isVisble ? <Visible /> : <Invisible />}
      </ButtonTarget>
      {isError && <div className={styles.formErrorMessage}>{message}</div>}
      {message && <div className={styles.formInfoMessage}>{message}</div>}
    </div>
  );
};

export default PasswordInput;
