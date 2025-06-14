import { MouseEvent } from "react";
import { MOBILE_BREAKPOINT } from "../data/css/breakpoints";

export function calculateTextWidth(text: string, className: string): number {
  const div = document.createElement("div");
  div.className = className;
  div.innerText = text;
  div.style.position = "absolute";
  div.style.width = "max-content";
  div.style.whiteSpace = "nowrap";
  div.style.visibility = "hidden";
  document.body.appendChild(div);
  const width = div.offsetWidth;
  document.body.removeChild(div);
  return width;
}

export function getParentElement<T extends HTMLElement>(
  element: HTMLElement,
  cb: (parent: HTMLElement) => boolean
): T | null {
  let parent = element.parentElement;
  while (parent) {
    if (cb(parent)) {
      return parent as T;
    }
    parent = parent.parentElement!;
  }

  return parent;
}

export function isTouchEnabled() {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}

export function getCookie(name: string) {
  const regex = new RegExp(`(?:^| )${name}=([^;]*)`);
  const match = document.cookie.match(regex);
  if (match) {
    return match[2];
  }
}

export function isClickOutside(element: HTMLElement, e: MouseEvent) {
  const contentRect = element.getBoundingClientRect();
  return (
    e.clientX < contentRect.left ||
    e.clientX > contentRect.right ||
    e.clientY < contentRect.top ||
    e.clientY > contentRect.bottom
  );
}

export function isMobile(): boolean {
  return window.innerWidth <= MOBILE_BREAKPOINT;
}

export function pollPopupClose(
  popup: WindowProxy,
  onPopupClose: () => void,
  interval: number = 500
) {
  const id = setInterval(() => {
    if (popup.closed) {
      clearInterval(id);
      onPopupClose();
    }
  }, interval);

  return { clearPollRequest: () => clearInterval(id) };
}
