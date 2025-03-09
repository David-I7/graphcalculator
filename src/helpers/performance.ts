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

export class MinHeap<T> {
  private heap: T[] = [];

  constructor(private insertCb: (parent: T, child: T) => boolean) {}

  get length(): number {
    return this.heap.length;
  }

  private deepCopy<T>(target: T): T {
    if (Array.isArray(target)) {
      const res = [];
      for (let i = 0; i < target.length; i++) {
        res.push(this.deepCopy(target[i]));
      }
      return res as T;
    } else if (typeof target === "object") {
      const res: Record<string, T> = {};
      for (const item of Object.entries(target as object)) {
        res[item[0]] = this.deepCopy(item[1] as T);
      }
      return res as T;
    } else {
      return target;
    }
  }

  sort(): T[] {
    const clone = this.deepCopy(this.heap);
    const res: T[] = [];

    while (this.heap.length) {
      res.push(this.pop()!);
    }

    this.heap = clone;

    return res;
  }

  buildHeap(arr: T[]) {
    if (this.heap.length)
      throw new Error(
        "Build heap should only be called when creating the heap."
      );

    this.heap = arr;

    const lastNonLeafnode = Math.floor(arr.length / 2) - 1;

    for (let i = lastNonLeafnode; i >= 0; i--) {
      this.bubbleDown(i, this.insertCb);
    }
  }

  heapify(index: number, cb: (parent: T, child: T) => boolean = this.insertCb) {
    if (index === 0) return;

    const parent = Math.ceil(index / 2) - 1;

    const res = cb(this.heap[parent], this.heap[index]);

    if (res) {
      this.swap(parent, index);
      this.heapify(parent, cb);
    }
  }

  swap(a: number, b: number) {
    const tmp = this.heap[a];
    this.heap[a] = this.heap[b];
    this.heap[b] = tmp;
  }

  insert(data: T, cb: (parent: T, child: T) => boolean = this.insertCb) {
    this.heap.push(data);
    this.heapify(this.heap.length - 1, cb);
  }

  pop(): T | never {
    if (!this.heap.length) {
      throw new Error("Heap is empty");
    }

    if (this.heap.length === 1) {
      return this.heap.pop()!;
    }

    this.swap(0, this.heap.length - 1);
    const deleted = this.heap.pop()!;
    this.bubbleDown(0);

    return deleted;
  }

  delete(cb: (item: T) => boolean): T | never {
    if (!this.heap.length) {
      throw new Error("Heap is empty");
    }

    let foundIdx!: number | undefined;

    for (let i = 0; i < this.heap.length; i++) {
      if (cb(this.heap[i])) {
        foundIdx = i;
        break;
      }
    }

    if (!foundIdx) {
      throw new Error("Item not found");
    }

    this.swap(foundIdx, this.heap.length - 1);
    let res = this.heap.pop()!;
    this.bubbleDown(foundIdx);

    return res;
  }

  search(cb: (item: T) => boolean): T | never {
    if (!this.heap.length) {
      throw new Error("Heap is empty");
    }

    for (let i = 0; i < this.heap.length; i++) {
      if (cb(this.heap[i])) {
        return this.heap[i];
      }
    }

    throw new Error("Item not in the heap");
  }

  bubbleDown(
    index: number,
    cb: (parent: T, child: T) => boolean = this.insertCb
  ) {
    if (index === this.heap.length - 1) return;

    const left = index * 2 + 1;
    const right = index * 2 + 2;

    let minIdx = index;

    if (left < this.heap.length) {
      const res = cb(this.heap[minIdx], this.heap[left]);
      if (res) minIdx = left;
    }

    if (right < this.heap.length) {
      const res = cb(this.heap[minIdx], this.heap[right]);
      if (res) minIdx = right;
    }

    if (minIdx !== index) {
      this.swap(index, minIdx);
      this.bubbleDown(minIdx);
    }
  }
}
