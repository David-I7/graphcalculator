import { useEffect, useRef, useState } from "react";

export function usePopulateRef<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  opt: { selector?: string; id?: string; cb?: () => T }
) {
  useEffect(() => {
    if (opt.cb) {
      ref.current = opt.cb();
    } else if (opt.id) {
      ref.current = document.getElementById(opt.id) as T;
    } else if (opt.selector) {
      ref.current = document.querySelector(opt.selector) as T;
    }
  }, []);
}

export function usePrevious<T>(next: T, initValue: T | null = null) {
  const prev = useRef<T>(initValue);

  useEffect(() => {
    prev.current = next;
  }, [next]);

  return prev.current;
}
