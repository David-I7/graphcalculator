import React, { useEffect } from "react";

const useClickOutside = <T extends HTMLElement | null>(
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

export default useClickOutside;
