// Graph with adjacency list + edge bandwidth (weight)
// and optional node metadata (e.g., CPU capacity)

export class Graph {
  constructor() {
    // adjacencyList[v] = [{ to: 'L', bw: 6 }, ...]
    this.adjacencyList = {};
    // nodeMeta[v] = { cpu: 7 } etc.
    this.nodeMeta = {};
  }

  addVertex(vertex, meta = {}) {
    if (!this.adjacencyList[vertex]) {
      this.adjacencyList[vertex] = [];
      this.nodeMeta[vertex] = { ...meta };
      return true;
    }
    // if already exists, we can update meta (optional)
    this.nodeMeta[vertex] = { ...(this.nodeMeta[vertex] || {}), ...meta };
    return false;
  }

  // Adds an UNDIRECTED edge with bandwidth bw
  addEdge(v1, v2, bw = 0) {
    if (!this.adjacencyList[v1] || !this.adjacencyList[v2]) return false;

    // prevent duplicates: update if exists
    const upsert = (from, to) => {
      const list = this.adjacencyList[from];
      const idx = list.findIndex((e) => e.to === to);
      if (idx >= 0) list[idx] = { to, bw };
      else list.push({ to, bw });
    };

    upsert(v1, v2);
    upsert(v2, v1);
    return true;
  }

  removeEdge(v1, v2) {
    if (!this.adjacencyList[v1] || !this.adjacencyList[v2]) return false;

    this.adjacencyList[v1] = this.adjacencyList[v1].filter((e) => e.to !== v2);
    this.adjacencyList[v2] = this.adjacencyList[v2].filter((e) => e.to !== v1);
    return true;
  }

  removeVertex(vertex) {
    if (!this.adjacencyList[vertex]) return false;

    // remove edges from neighbors
    for (const e of this.adjacencyList[vertex]) {
      this.removeEdge(vertex, e.to);
    }
    delete this.adjacencyList[vertex];
    delete this.nodeMeta[vertex];
    return true;
  }
}
