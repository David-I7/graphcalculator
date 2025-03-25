export function swap<T>(a: number, b: number, arr: T[]) {
  const tmp = arr[a];
  arr[a] = arr[b];
  arr[b] = tmp;
}

export type SerializedAdjList = Record<string, string[]>;

export class AdjacencyList {
  constructor() {}

  static hasNode(node: string, graph: SerializedAdjList): boolean {
    return node in graph;
  }

  static addEdge(a: string, b: string, graph: SerializedAdjList) {
    if (!this.hasNode(a, graph)) return -1;

    let aEdges = graph[a];
    for (let i = 0; i < aEdges.length; i++) {
      if (aEdges[i] === b) {
        aEdges[i] = b;
        return;
      }
    }
    aEdges.push(b);
  }

  static addNode(a: string, graph: SerializedAdjList) {
    if (this.hasNode(a, graph)) return -1;
    graph[a] = [];
  }

  static deleteEdge(a: string, b: string, graph: SerializedAdjList) {
    if (!this.hasNode(a, graph)) return -1;

    let aEdges = graph[a];

    for (let i = 0; i < aEdges.length; i++) {
      if (aEdges[i] === b) {
        aEdges.splice(i, 1);
        return;
      }
    }

    return -1;
  }

  static isConnected(a: string, b: string, graph: SerializedAdjList) {
    if (!this.hasNode(a, graph)) return -1;

    let aEdges = graph[a];

    for (let i = 0; i < aEdges.length; i++) {
      if (aEdges[i] === b) return true;
    }

    return false;
  }

  static getAllSiblings(a: string, graph: SerializedAdjList): string[] | -1 {
    if (!this.hasNode(a, graph)) return -1;

    const aEdges = graph[a];
    return [...aEdges];
  }

  static repr(graph: SerializedAdjList) {
    for (const element of Object.keys(graph)) {
      console.log(`${element}: ${graph[element]}`);
    }
  }

  static topologicSort(graph: SerializedAdjList) {
    const degreeMap: Record<string, number> = {};
    const graphEntries = Object.entries(graph);
    graphEntries.forEach(([vertex, edges]) => {
      if (!(vertex in degreeMap)) degreeMap[vertex] = 0;
      edges.forEach((edge) => {
        if (edge in degreeMap) degreeMap[edge] += 1;
        else {
          degreeMap[edge] = 1;
        }
      });
    });

    const queue: string[] = [];
    graphEntries.forEach(([vertex, edge]) => {
      if (degreeMap[vertex] === 0) queue.push(vertex);
    });

    const topologicOrder: string[] = [];
    while (queue.length) {
      const v = queue.shift()!;
      topologicOrder.push(v);
      const dependants = graph[v];

      dependants.forEach((dep) => {
        degreeMap[dep] -= 1;
        if (degreeMap[dep] === 0) {
          queue.push(dep);
        }
      });
    }

    // cycle detected
    if (graphEntries.length !== topologicOrder.length) return null;

    return topologicOrder;
  }
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
