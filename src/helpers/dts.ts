export function swap<T>(a: number, b: number, arr: T[]) {
  const tmp = arr[a];
  arr[a] = arr[b];
  arr[b] = tmp;
}
