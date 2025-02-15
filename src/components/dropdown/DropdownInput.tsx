import React, {
  ChangeEvent,
  FocusEvent,
  KeyboardEvent,
  ReactNode,
  useEffect,
  useState,
} from "react";
import styles from "./dropdown.module.scss";
import { calculateTextWidth } from "../../helpers/dom";

type ComponentProps = {
  defaultValue: string;
  initialValue: string;
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onSave?: () => void;
};

const DropdownInput = React.forwardRef<HTMLInputElement, ComponentProps>(
  (
    {
      defaultValue,
      initialValue,
      children,
      className,
      style,
      onSave,
    }: ComponentProps,
    ref
  ) => {
    const [inputValue, setInputVal] = useState<string>(initialValue);

    const handleChange = (e: ChangeEvent) => {
      setInputVal((e.target as HTMLInputElement).value);
    };
    const handleFocus = (e: FocusEvent) => {
      const input = e.currentTarget! as HTMLInputElement;
      input.select();
      input.style.minWidth = `100%`;
      input.parentElement!.style.minWidth = `100%`;
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
        input.style.width = `${input.offsetWidth}px`;
      } else {
        input.style.width = `${width}px`;
      }
      input.style.removeProperty("min-width");
      input.parentElement!.style.removeProperty("min-width");
      onSave?.();
    };

    const handleEnter = (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.currentTarget.blur();
      }
    };

    const mergedClassname = React.useMemo(
      () =>
        className
          ? `${className} ${styles.dropdownInputContainerInput}`
          : styles.dropdownInputContainerInput,
      [className]
    );

    useEffect(() => {
      window.addEventListener(
        "load",
        () => {
          const width = calculateTextWidth(inputValue, mergedClassname);
          const inputRef =
            (ref as React.RefObject<HTMLInputElement>)?.current ||
            document.querySelector(`.${styles.dropdownInputContainerInput}`);
          inputRef.style.width = `${width}px`;
        },
        { once: true }
      );
    }, []);

    return (
      <div className={styles.dropdownInputContainer}>
        <input
          ref={ref}
          value={inputValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={onSave ? handleEnter : undefined}
          style={style}
          className={mergedClassname}
          type="text"
          aria-label="File name"
        />
        {children}
      </div>
    );
  }
);

export default DropdownInput;
