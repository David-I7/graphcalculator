import React, { useEffect } from "react";

export const useClickOutside = <T extends HTMLElement | null>(
  enabled: boolean = true,
  element: React.RefObject<T>,
  onClose: () => void
) => {
  useEffect(() => {
    if (!enabled) return;
    const eventController = new AbortController();

    document.addEventListener(
      "click",
      (e) => {
        const target = e.target as Node;
        console.log(
          element.current?.contains(e.target as Node),
          element,
          e.target
        );
        if (!element.current!.contains(target)) {
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
