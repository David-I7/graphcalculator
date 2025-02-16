import React, { useEffect } from "react";
import {
  handleDragEnd,
  handleDragOver,
  handleDragStart,
  handleTouchCancel,
  handleTouchEnd,
  handleTouchMove,
  handleTouchStart,
} from "../lib/draggable";

type UseDraggableProps<T extends HTMLElement, U extends HTMLElement> = {
  draggableContainerRef: React.RefObject<U | null>;
  sharedClassname: string;
  draggingClassname: string;
  proxyClassname?: string;
  setup?: (currentTarget: T) => void;
  cleanup?: (currentTarget: T) => void;
};

function useDraggable<T extends HTMLElement, U extends HTMLElement>({
  draggableContainerRef,
  sharedClassname,
  draggingClassname,
  proxyClassname,
  setup,
  cleanup,
}: UseDraggableProps<T, U>) {
  // SETUP
  useEffect(() => {
    if (!draggableContainerRef.current) return;

    const eventAborter = new AbortController();

    // DRAG EVENTS
    draggableContainerRef.current.addEventListener(
      "dragover",
      handleDragOver(sharedClassname, draggingClassname),
      { signal: eventAborter.signal, passive: false }
    );

    draggableContainerRef.current.addEventListener(
      "dragstart",
      (e) => {
        const target = e.target as T;
        if (proxyClassname) {
          e.dataTransfer?.setDragImage(new Image(), 0, 0);
          if (target.matches(`.${proxyClassname}`)) {
            let parent = target.parentElement;
            while (
              parent !== null &&
              parent !== draggableContainerRef.current
            ) {
              if (parent.matches(`.${sharedClassname}`)) {
                handleDragStart(parent as T, draggingClassname, setup);
                break;
              }
              parent = parent.parentElement;
            }
          }
        } else if (target.matches(`.${sharedClassname}`)) {
          handleDragStart(target, draggingClassname, setup);
        }
      },
      { signal: eventAborter.signal }
    );

    draggableContainerRef.current.addEventListener(
      "dragend",
      (e) => {
        const target = e.target as T;
        if (proxyClassname) {
          if (target.matches(`.${proxyClassname}`)) {
            let parent = target.parentElement;
            while (
              parent !== null &&
              parent !== draggableContainerRef.current
            ) {
              if (parent.matches(`.${draggingClassname}`)) {
                handleDragEnd(parent as T, draggingClassname, cleanup);
                break;
              }
              parent = parent.parentElement;
            }
          }
        } else if (target.matches(`.${draggingClassname}`)) {
          handleDragEnd(target, draggingClassname, cleanup);
        }
      },
      { signal: eventAborter.signal }
    );

    // TOUCH EVENTS

    draggableContainerRef.current.addEventListener(
      "touchmove",
      handleTouchMove(sharedClassname, draggingClassname),
      { signal: eventAborter.signal }
    );

    draggableContainerRef.current.addEventListener(
      "touchstart",
      (e) => {
        const target = e.target as T;
        if (proxyClassname) {
          if (target.matches(`.${proxyClassname}`)) {
            let parent = target.parentElement;
            while (
              parent !== null &&
              parent !== draggableContainerRef.current
            ) {
              if (parent.matches(`.${sharedClassname}`)) {
                handleTouchStart(parent as T, draggingClassname, setup);
                break;
              }
              parent = parent.parentElement;
            }
          }
        } else if (target.matches(`.${sharedClassname}`)) {
          handleTouchStart(target, draggingClassname, setup);
        }
      },
      { signal: eventAborter.signal }
    );

    draggableContainerRef.current.addEventListener(
      "touchend",
      (e) => {
        const target = e.target as T;
        if (proxyClassname) {
          if (target.matches(`.${proxyClassname}`)) {
            let parent = target.parentElement;
            while (
              parent !== null &&
              parent !== draggableContainerRef.current
            ) {
              if (parent.matches(`.${draggingClassname}`)) {
                handleTouchEnd(parent as T, draggingClassname, cleanup);
                break;
              }
              parent = parent.parentElement;
            }
          }
        } else if (target.matches(`.${draggingClassname}`)) {
          handleTouchEnd(target, draggingClassname, cleanup);
        }
      },
      { signal: eventAborter.signal }
    );

    draggableContainerRef.current.addEventListener(
      "touchcancel",
      (e) => {
        const target = e.target as T;
        if (proxyClassname) {
          if (target.matches(`.${proxyClassname}`)) {
            let parent = target.parentElement;
            while (
              parent !== null &&
              parent !== draggableContainerRef.current
            ) {
              if (parent.matches(`.${draggingClassname}`)) {
                handleTouchCancel(parent as T, draggingClassname, cleanup);
                break;
              }
              parent = parent.parentElement;
            }
          }
        } else if (target.matches(`.${draggingClassname}`)) {
          handleTouchCancel(target, draggingClassname, cleanup);
        }
      },
      { signal: eventAborter.signal }
    );

    return () => {
      eventAborter.abort();
    };
  }, [draggingClassname, sharedClassname, setup, cleanup]);
}

export default useDraggable;
