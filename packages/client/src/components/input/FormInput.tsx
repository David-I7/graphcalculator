import React, { InputHTMLAttributes, useMemo } from "react";
import styles from "./input.module.scss";
import { CSS_VARIABLES } from "../../data/css/variables";
type FormInputProps = InputHTMLAttributes<HTMLInputElement> & {
  isError?: boolean;
  message?: string;
};

const FormInput = ({ isError, message, ...inputProps }: FormInputProps) => {
  const mergedClassname = useMemo(() => {
    return inputProps.className
      ? inputProps.className + " " + styles.formInput
      : styles.formInput;
  }, [inputProps.className]);

  return (
    <div className={styles.formInputContainer}>
      <input
        {...inputProps}
        style={
          isError
            ? {
                ...inputProps.style,
                border: `2px solid ${CSS_VARIABLES.error}`,
              }
            : inputProps.style
        }
        className={mergedClassname}
      />
      {isError && <div className={styles.formErrorMessage}>{message}</div>}
      {message && <div className={styles.formInfoMessage}>{message}</div>}
    </div>
  );
};

export default FormInput;
