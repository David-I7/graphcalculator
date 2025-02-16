// import { DragEvent, TouchEvent } from "react";

export function handleDragStart<T extends HTMLElement>(
  currentTarget: T,
  draggingClassname: string,
  setup?: (currentTarget: T) => void
) {
  currentTarget.classList.add(draggingClassname);
  setup?.(currentTarget);
}
export function handleDragEnd<T extends HTMLElement>(
  currentTarget: T,
  draggingClassname: string,
  cleanUp?: (currentTarget: T) => void
) {
  currentTarget.classList.remove(draggingClassname);
  cleanUp?.(currentTarget);
}

function getDragAfterElement<T extends HTMLElement>(
  draggables: NodeListOf<T>,
  mouseY: number
) {
  let closestVal = Number.NEGATIVE_INFINITY;
  let closestElement: HTMLElement | null = null;

  draggables.forEach((draggable) => {
    const draggablePosition = draggable.getBoundingClientRect();
    const offset =
      mouseY - (draggablePosition.top + draggablePosition.height / 2);

    if (offset > closestVal && offset < 0) {
      closestElement = draggable as HTMLElement;
      closestVal = offset;
    }
  });

  return closestElement;
}

export function handleDragOver(
  sharedClassname: string,
  draggingClassname: string
) {
  return (e: DragEvent) => {
    e.preventDefault();
    const currentTarget = e.currentTarget as HTMLElement;
    const draggedElement = currentTarget.querySelector(`.${draggingClassname}`);
    const draggables = currentTarget.querySelectorAll(
      `.${sharedClassname}:not(.${draggingClassname})`
    ) as NodeListOf<HTMLElement>;

    if (!draggables || !draggedElement) return;

    const closest = getDragAfterElement(draggables, e.clientY);

    if (!closest) {
      currentTarget.appendChild(draggedElement);
    } else {
      currentTarget.insertBefore(draggedElement, closest);
    }
  };
}

// TOUCH EVENTS

export function handleTouchMove<T extends HTMLElement>(
  sharedClassname: string,
  draggingClassname: string
) {
  return (e: TouchEvent) => {
    e.preventDefault(); //prevents scrolling and click events and page refreshes
    const container = e.currentTarget! as T;
    const draggedElement = container.querySelector(
      `.${draggingClassname}`
    ) as T | null;

    const draggables = container.querySelectorAll(
      `.${sharedClassname}:not(.${draggingClassname})`
    ) as NodeListOf<T>;

    if (!draggedElement || !draggables) return;

    const closest = getDragAfterElement(draggables, e.targetTouches[0].clientY);

    if (!closest) {
      container.appendChild(draggedElement);
      return;
    } else {
      container.insertBefore(draggedElement, closest);
    }
  };
}

export function handleTouchStart<T extends HTMLElement>(
  currentTarget: T,
  draggingClassname: string,
  setup?: (currentTarget: T) => void
) {
  const draggedElement = currentTarget.parentElement!.querySelector(
    `.${draggingClassname}`
  );
  // prevent multiple touches
  if (draggedElement) return;
  currentTarget.classList.add(draggingClassname);
  setup?.(currentTarget);
}

export function handleTouchEnd<T extends HTMLElement>(
  currentTarget: T,
  draggingClassname: string,
  cleanUp?: (currentTarget: T) => void
) {
  currentTarget.classList.remove(draggingClassname);
  cleanUp?.(currentTarget);
}

export function handleTouchCancel<T extends HTMLElement>(
  currentTarget: T,
  draggingClassname: string,
  cleanUp?: (currentTarget: T) => void
) {
  handleTouchEnd(currentTarget, draggingClassname, cleanUp);
}
