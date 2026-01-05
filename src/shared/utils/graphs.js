// Class for Adjacency List in Graphs Theory
// with bidirectional edges for the Vertex(node)

class Graph {
  constructor() {
    this.adjacencyList = {};
  }

  addVertex(vertex) {
    if (!this.adjacencyList[vertex]) {
      this.adjacencyList[vertex] = [];
      return true;
    }
    return false;
  }

  addEdge(vertex1, vertex2) {
    if (this.adjacencyList[vertex1] && this.adjacencyList[vertex2]) {
      this.adjacencyList[vertex1].push(vertex2);
      this.adjacencyList[vertex2].push(vertex1);
      return true;
    }
    return false;
  }

  removeEdge(vertex1, vertex2) {
    if (this.adjacencyList[vertex1] && this.adjacencyList[vertex2]) {
      this.adjacencyList[vertex1] = this.adjacencyList[vertex1].filter((n) => n !== vertex2);
      this.adjacencyList[vertex2] = this.adjacencyList[vertex2].filter((n) => n !== vertex1);
      return true;
    }
    return false;
  }

  removeVertex(vertex) {
    if (!this.adjacencyList[vertex]) return undefined;
    while (this.adjacencyList.length) {
      const temp = this.adjacencyList[vertex].pop();
      this.removeEdge(vertex, temp);
    }
    delete this.adjacencyList[vertex];
  }
}

// Example of use
// const graph = new Graph();

// graph.addVertex(5);
// graph.addVertex(15);
// graph.addEdge(5, 15);
// {
//   5:[15]
//   15:[5]
// }

// graph.removeVertex(5) =>
// {
//   15:[empty array]
// }
