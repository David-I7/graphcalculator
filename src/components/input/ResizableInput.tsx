import React, {
  ChangeEvent,
  FocusEvent,
  KeyboardEvent,
  useEffect,
  useState,
} from "react";
import styles from "./input.module.scss";
import { calculateTextWidth } from "../../helpers/dom";

type ResizableInputProps = {
  defaultValue?: string;
  initialValue: string;
  inputProps?: Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    | "value"
    | "defaultValue"
    | "onBlur"
    | "onChange"
    | "onFocus"
    | "onKeyDown"
    | "type"
  >;
  onSave?: (inputValue: string) => void;
};

export const ResizableInput = React.forwardRef<
  HTMLInputElement,
  ResizableInputProps
>(
  (
    {
      defaultValue = " ",
      initialValue,
      inputProps,
      onSave,
    }: ResizableInputProps,
    ref
  ) => {
    const [inputValue, setInputVal] = useState<string>(initialValue);

    useEffect(() => {
      if (initialValue !== inputValue) {
        setInputVal(initialValue);
      }
    }, [initialValue]);

    const handleChange = (e: ChangeEvent) => {
      setInputVal((e.target as HTMLInputElement).value);
    };
    const handleFocus = (e: FocusEvent) => {
      const input = e.currentTarget! as HTMLInputElement;
      input.select();
      input.style.removeProperty("max-width");
    };

    const handleBlur = (e: FocusEvent) => {
      const input = e.currentTarget as HTMLInputElement;
      let value: string = inputValue;

      if (value === "") {
        value = defaultValue;
        setInputVal(defaultValue);
      }

      const width = calculateTextWidth(value, mergedClassname);

      if (width > input.offsetWidth) {
        input.style.maxWidth = `${input.offsetWidth}px`;
      } else {
        input.style.maxWidth = `${width}px`;
      }
      onSave?.(value);
    };

    const handleEnter = (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.currentTarget.blur();
        if (inputValue === "") {
          setInputVal(defaultValue);
          onSave?.(defaultValue);
          return;
        }
        onSave?.(inputValue);
      }
    };

    const mergedClassname = React.useMemo(
      () =>
        inputProps?.className
          ? `${inputProps?.className} ${styles.resizeInput}`
          : styles.resizeInput,
      [inputProps?.className]
    );

    useEffect(() => {
      window.addEventListener(
        "load",
        () => {
          const width = calculateTextWidth(inputValue, mergedClassname);
          const inputRef =
            (ref as React.RefObject<HTMLInputElement>)?.current ||
            document.querySelector(`.${styles.resizeInput}`);
          inputRef.style.maxWidth = `${width}px`;
        },
        { once: true }
      );
    }, []);

    return (
      <input
        ref={ref}
        {...inputProps}
        type="text"
        className={mergedClassname}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        onKeyDown={handleEnter}
        value={inputValue}
      />
    );
  }
);
