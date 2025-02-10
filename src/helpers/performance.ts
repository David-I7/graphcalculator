export function debounce<T extends any[]>(
  cb: (...args: T) => void,
  delay: number = 300
) {
  let timerId: number | null = null;

  return (...args: T) => {
    if (timerId !== null) {
      clearTimeout(timerId);
    }

    timerId = setTimeout(() => {
      cb(...args);
    }, delay);
  };
}
