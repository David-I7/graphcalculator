import { InputHTMLAttributes, useMemo } from "react";
import styles from "./input.module.scss";
import { CSS_VARIABLES } from "../../data/css/variables";
type FormInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  isError?: boolean;
  message?: string;
};

const CodeInput = ({ isError, message, ...inputProps }: FormInputProps) => {
  const mergedClassname = useMemo(() => {
    return inputProps.className
      ? inputProps.className + " " + styles.codeInput
      : styles.codeInput;
  }, [inputProps.className]);

  return (
    <div className={styles.formInputContainer}>
      <input
        {...inputProps}
        type="number"
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

export default CodeInput;
