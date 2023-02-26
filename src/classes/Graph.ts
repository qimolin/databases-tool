export class Graph {
  private vertices: number;
  private edges: number;
  private adjacencyList: Map<number, number[]>;

  constructor(vertices: number) {
    this.vertices = vertices;
    this.edges = 0;
    this.adjacencyList = new Map<number, number[]>();

    for (let i = 0; i < vertices; i++) {
      this.adjacencyList.set(i, []);
    }
  }

  public addEdge(v: number, w: number): void {
    this.adjacencyList.get(v)?.push(w);
    this.adjacencyList.get(w)?.push(v);
    this.edges++;
  }

  public getVertices(): number {
    return this.vertices;
  }

  public getEdges(): number {
    return this.edges;
  }

  public getAdjacencyList(): Map<number, number[]> {
    return this.adjacencyList;
  }

  public isConnected(): boolean {
    const visited = new Set<number>();
    const stack: number[] = [];

    stack.push(0); // start from vertex 0

    while (stack.length > 0) {
      const vertex = stack.pop()!;
      if (!visited.has(vertex)) {
        visited.add(vertex);
        this.adjacencyList.get(vertex)?.forEach((adjacentVertex) => {
          stack.push(adjacentVertex);
        });
      }
    }

    return visited.size === this.vertices;
  }
}
