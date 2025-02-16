import { useState } from "react";

export interface State {
  id: number;
}

export default function useNextId<T extends State>(
  state: T[]
): [number, React.Dispatch<React.SetStateAction<number>>] {
  const [nextId, setNextId] = useState<number>(() => {
    let max = 1;
    for (let i = 0; i < state.length; i++) {
      max = Math.max(max, state[i].id);
    }
    return max;
  });

  return [nextId, setNextId];
}
