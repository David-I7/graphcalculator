import React, { RefObject, useEffect, useState } from "react";

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
      onFocus?.();
    }

    if (!toggle) {
      onBlur?.();
    }
  }, [toggle, onFocus]);
}

type IOHookOpt = {
  enabled?: boolean;
  intersectionObserverOpt?: IntersectionObserverInit;
};

export function useIntersectionObserver(
  target: HTMLElement | (() => HTMLElement) | RefObject<HTMLElement | null>,
  cb: (
    entries: IntersectionObserverEntry[],
    observer: IntersectionObserver
  ) => void,
  opt?: IOHookOpt
) {
  useEffect(
    () => {
      if (opt?.enabled !== undefined && !opt.enabled) return;

      const observer = new IntersectionObserver(
        (entries) => cb(entries, observer),
        opt?.intersectionObserverOpt
      );

      if (typeof target === "function") {
        observer.observe(target());
      } else if ("current" in target) {
        observer.observe(target.current!);
      } else {
        observer.observe(target);
      }

      return () => {
        observer.disconnect();
      };
    },
    opt?.enabled === undefined ? [] : undefined
  );
}

type TimeoutState = {
  done: boolean;
};

export function useTimeout({
  duration,
  onComplete,
}: {
  duration: number;
  onComplete?: () => void;
}) {
  const [state, setState] = useState<TimeoutState>({
    done: false,
  });

  function reset() {
    setState({ done: false });
  }

  function removeTimeout() {
    if (!state.done) {
      setState({ done: true });
    }
  }

  useEffect(() => {
    if (state.done) return;

    const timeout = setTimeout(() => {
      setState({ done: true });
      onComplete?.();
    }, duration);

    return () => {
      clearTimeout(timeout);
    };
  }, [state.done]);

  return { done: state.done, removeTimeout, reset };
}

export function useSearchParams<
  QueryKeys extends string[] | undefined = undefined
>(
  keys?: QueryKeys
): QueryKeys extends undefined
  ? URLSearchParams
  : Record<string, string | null | string[]> {
  const params = new URLSearchParams(window.location.search);
  if (keys) {
    const queryVals: Record<string, string | null | string[]> = {};
    for (let i = 0; i < keys.length; i++) {
      const res = params.getAll(keys[i]);
      queryVals[keys[i]] = res.length ? res : null;
    }
    return queryVals as any;
  }

  return params as any;
}
