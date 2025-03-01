import React, { useEffect } from "react";

export const useClickOutside = <T extends HTMLElement | null>(
  enabled: boolean = true,
  element: React.RefObject<T> | (() => T),
  onClose: () => void
) => {
  useEffect(() => {
    if (!enabled) return;
    const currentElement =
      typeof element === "function" ? element() : element.current;
    if (!currentElement) return;

    const eventController = new AbortController();

    document.addEventListener(
      "click",
      (e) => {
        const target = e.target as Node;
        if (!currentElement.contains(target)) {
          onClose();
          eventController.abort();
        }
      },
      { signal: eventController.signal }
    );

    return () => {
      eventController.abort();
    };
  }, [enabled, element, onClose]);
};

export const useSetDynamicProp = <T extends HTMLElement>(
  ref: React.RefObject<T | null> | (() => T),
  key: string,
  value: string | null
) => {
  useEffect(() => {
    if (typeof ref === "function") {
      const element = ref();
      element.style.setProperty(key, value);
    } else {
      ref.current!.style.setProperty(key, value);
    }
  }, [ref]);
};

export function useFocus<T extends HTMLElement>(
  toggle: boolean,
  ref: React.RefObject<T | null>,
  onFocus?: () => void,
  onBlur?: () => void
) {
  useEffect(() => {
    if (!ref.current) return;

    if (toggle) {
      ref.current.focus();
      onFocus?.();
    }

    if (!toggle) {
      onBlur?.();
    }
  }, [toggle, onFocus]);
}
