import React, { ReactNode, useEffect, ChangeEvent } from "react";
import styles from "./inputDropdown.module.scss";

type InputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type" | "onInput" | "onFocus" | "onBlur"
>;
type ComponentProps = {
  children: ReactNode;
  defaultValue: string;
  inputProps?: InputProps;
};

function calculateTextWidth(text: string, className: string): number {
  const div = document.createElement("div");
  div.className = className;
  div.innerText = text;
  div.style.position = "absolute";
  div.style.whiteSpace = "nowrap";
  div.style.visibility = "hidden";
  document.body.appendChild(div);
  const width = div.offsetWidth;
  document.body.removeChild(div);
  return width;
}

const InputDropdown = React.forwardRef<HTMLInputElement, ComponentProps>(
  ({ children, defaultValue, inputProps }: ComponentProps, ref) => {
    const mergedClassname = inputProps?.className
      ? `${inputProps.className} ${styles.containerInput}`
      : styles.containerInput;

    useEffect(() => {
      window.addEventListener(
        "load",
        () => {
          const width = calculateTextWidth(
            inputProps!.value as string,
            mergedClassname
          );
          const inputRef =
            (ref as React.RefObject<HTMLInputElement>)?.current ||
            document.querySelector(`.${styles.containerInput}`);
          inputRef.style.width = `${width}px`;
        },
        { once: true }
      );
    }, []);

    return (
      <div className={styles.container}>
        <input
          ref={ref}
          onFocus={(e) => {
            e.currentTarget.select();
            e.currentTarget.style.minWidth = `100%`;
          }}
          onBlur={(e) => {
            let value: string = inputProps!.value as string;

            if (value === "") {
              value = defaultValue;

              const descriptor = Object.getOwnPropertyDescriptor(
                HTMLInputElement.prototype,
                "value"
              );
              if (descriptor && descriptor.set) {
                descriptor.set.call(e.currentTarget, value); // Manually set the value
              }
              e.currentTarget.dispatchEvent(
                new Event("input", { bubbles: true })
              );
            }

            const width = calculateTextWidth(value, mergedClassname);

            if (width > e.currentTarget.offsetWidth) {
              e.currentTarget.style.width = `${e.currentTarget.offsetWidth}px`;
            } else {
              e.currentTarget.style.width = `${width}px`;
            }
            e.currentTarget.style.removeProperty("min-width");
          }}
          aria-label="File name"
          type="text"
          {...inputProps}
          className={mergedClassname}
        />
        {children}
      </div>
    );
  }
);

export default InputDropdown;
