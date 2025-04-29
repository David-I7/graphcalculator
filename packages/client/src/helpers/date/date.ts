import { buildElapsedHandler, buildRemaingHandler } from "./elapsedTime";

export const months = new Map([
  [1, "Jan"],
  [2, "Feb"],
  [3, "Mar"],
  [4, "Apr"],
  [5, "May"],
  [6, "Jun"],
  [7, "Jul"],
  [8, "Aug"],
  [9, "Sep"],
  [10, "Oct"],
  [11, "Nov"],
  [12, "Dec"],
]);

export function getElapsedTime(date: string): string {
  const curDate = new Date();
  const deltaSec = (curDate.getTime() - new Date(date).getTime()) * 1e-3;

  return buildElapsedHandler().handle(deltaSec, date) ?? "";
}

export function formatTimeout(timeout: number): string {
  return buildRemaingHandler().handle(timeout, timeout.toString()) || "";
}
