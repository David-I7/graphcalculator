import React, { useEffect } from "react";
import {
  handleDragEnd,
  handleDragOver,
  handleDragStart,
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
  // const isMobile = useAppSelector((state) => state.globalSlice.isMobile);
  // SETUP
  useEffect(() => {
    if (!draggableContainerRef.current) return;

    const eventAborter = new AbortController();

    // DRAG EVENTS

    draggableContainerRef.current.addEventListener(
      "dragstart",
      (e) => {
        let match: boolean = false;

        const target = e.target as HTMLElement | null;
        if (proxyClassname) {
          e.dataTransfer?.setDragImage(new Image(), 0, 0);
          let parent = target;
          while (parent !== null && parent !== draggableContainerRef.current) {
            if (parent.matches(`.${proxyClassname}`)) {
              handleDragStart(
                parent.parentElement as T,
                draggingClassname,
                setup
              );
              match = true;
              break;
            }
            parent = parent.parentElement;
          }
        } else if (target!.matches(`.${sharedClassname}`)) {
          handleDragStart(target as T, draggingClassname, setup);
          match = true;
        }

        if (match) {
          const wrapper = handleDragOver(sharedClassname, draggingClassname);

          draggableContainerRef.current?.addEventListener("dragover", wrapper, {
            signal: eventAborter.signal,
            passive: false,
          });

          draggableContainerRef.current?.addEventListener(
            "dragend",
            (e) => {
              const target = e.target as HTMLElement | null;
              if (proxyClassname) {
                let parent = target;
                while (
                  parent !== null &&
                  parent !== draggableContainerRef.current
                ) {
                  if (parent.matches(`.${proxyClassname}`)) {
                    if (parent.parentElement?.matches(`.${draggingClassname}`))
                      handleDragEnd(
                        parent.parentElement as T,
                        draggingClassname,
                        cleanup
                      );
                    break;
                  }
                  parent = parent.parentElement;
                }
              } else if (target!.matches(`.${draggingClassname}`)) {
                handleDragEnd(target as T, draggingClassname, cleanup);
              }

              draggableContainerRef.current?.removeEventListener(
                "dragover",
                wrapper
              );
            },
            { signal: eventAborter.signal, once: true }
          );
        }
      },
      { signal: eventAborter.signal }
    );

    // TOUCH EVENTS

    draggableContainerRef.current.addEventListener(
      "touchstart",
      (e) => {
        let match: boolean = false;

        const target = e.target as HTMLElement | null;
        if (proxyClassname) {
          let parent = target;
          while (parent !== null && parent !== draggableContainerRef.current) {
            if (parent.matches(`.${proxyClassname}`)) {
              handleTouchStart(
                parent.parentElement as T,
                draggingClassname,
                setup
              );
              match = true;
              break;
            }
            parent = parent.parentElement;
          }
        } else if (target!.matches(`.${sharedClassname}`)) {
          handleTouchStart(target as T, draggingClassname, setup);
          match = true;
        }

        if (match) {
          const wrapper = handleTouchMove(sharedClassname, draggingClassname);
          const touchcancelWrapper = () => {
            const ev = new Event("touchend");
            draggableContainerRef.current!.dispatchEvent(ev);
          };

          draggableContainerRef.current?.addEventListener(
            "touchmove",
            wrapper,
            { signal: eventAborter.signal, passive: false }
          );

          draggableContainerRef.current?.addEventListener(
            "touchend",
            (e) => {
              const target = e.target as HTMLElement | null;
              if (proxyClassname) {
                let parent = target;
                while (
                  parent !== null &&
                  parent !== draggableContainerRef.current
                ) {
                  if (parent.matches(`.${proxyClassname}`)) {
                    if (parent.parentElement?.matches(`.${draggingClassname}`))
                      handleTouchEnd(
                        parent.parentElement as T,
                        draggingClassname,
                        cleanup
                      );
                    break;
                  }
                  parent = parent.parentElement;
                }
              } else if (target!.matches(`.${draggingClassname}`)) {
                handleTouchEnd(target as T, draggingClassname, cleanup);
              }

              draggableContainerRef.current?.removeEventListener(
                "touchmove",
                wrapper
              );
              draggableContainerRef.current?.removeEventListener(
                "touchcancel",
                touchcancelWrapper
              );
            },
            { signal: eventAborter.signal, once: true }
          );

          draggableContainerRef.current?.addEventListener(
            "touchcancel",
            touchcancelWrapper,
            { signal: eventAborter.signal, once: true }
          );
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
