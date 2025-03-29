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
