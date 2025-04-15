export function debounce<T extends any[]>(
  cb: (...args: T) => void,
  delay: number = 300
) {
  let timerId: NodeJS.Timeout | null = null;

  return (...args: T) => {
    if (timerId !== null) {
      clearTimeout(timerId);
    }

    timerId = setTimeout(() => {
      cb(...args);
    }, delay);
  };
}

export function throttle<T extends any[]>(
  cb: (...args: T) => void,
  delay: number = 300
) {
  let timerId: NodeJS.Timeout | null = null;
  let finalTimerId: NodeJS.Timeout | null = null;
  let waitingArgs: T | null = null;

  return {
    abort: () => {
      if (timerId) clearTimeout(timerId);
      if (finalTimerId) clearTimeout(finalTimerId);
    },
    throttleFunc: (...args: T) => {
      waitingArgs = args;

      if (finalTimerId) {
        timerId = finalTimerId;
        return;
      }

      if (!timerId) {
        cb(...waitingArgs);
        waitingArgs = null;
        timerId = setTimeout(() => {
          if (waitingArgs !== null) {
            finalTimerId = setTimeout(() => {
              cb(...(waitingArgs as T));
              waitingArgs = null;
              finalTimerId = null;
              timerId = null;
            }, delay);
          }
          timerId = null;
        }, delay);
      }
    },
  };
}

export async function wait(timeMS: number): Promise<void> {
  return new Promise((res) => {
    setTimeout(res, timeMS);
  });
}
