import { useEffect } from "react";
import { useLoadGraph } from "@react-sigma/core";
import { useLayoutForceAtlas2 } from "@react-sigma/layout-forceatlas2";
import Graph from "graphology";
import { GraphContainer } from "./components/Graph/GraphContainer";
import type { NodeAttributes, EdgeAttributes } from "./types/graph";
import nodesData from "./data/nodes.json";
import { getUniqueColor } from "./utils/colors";
import { DEFAULT_EDGE_CURVATURE, indexParallelEdgesIndex } from "@sigma/edge-curve";
import "@react-sigma/core/lib/style.css";

import { SearchControl } from "./components/Graph/SearchControl";
import { LayoutControls } from "./components/Graph/LayoutControls";
import { FilterControl } from "./components/Graph/FilterControl";
import { NodeInfoDock } from "./components/Graph/NodeInfoDock";
import { GraphControls } from "./components/Graph/GraphControls";

const MyGraph = () => {
  const loadGraph = useLoadGraph();
  const { assign } = useLayoutForceAtlas2({ iterations: 100, settings: { adjustSizes: true, slowDown: 10 } });

  useEffect(() => {
    const graph = new Graph<NodeAttributes, EdgeAttributes>({ multi: true, type: "directed", allowSelfLoops: true });

    nodesData.nodes.forEach((node) => {
      graph.addNode(node.id, {
        x: (Math.random() - 0.5) * 10,
        y: (Math.random() - 0.5) * 10,
        size: 10,
        label: node.properties.name,
        color: getUniqueColor(node.id),
        ...node.properties
      });
    });



    // Create edges from relationships data
    if (nodesData.relationships) {
      nodesData.relationships.forEach((rel) => {
        graph.addEdge(rel.start, rel.end, {
          type: "arrow",
          label: rel.type,
          size: 2,
          color: "#666"
        });
      });
    }

    // Index parallel edges to handle overlapping edges with curves
    indexParallelEdgesIndex(graph, {
      edgeIndexAttribute: "parallelIndex",
      edgeMaxIndexAttribute: "parallelMaxIndex"
    });

    // Apply curvature to parallel edges for better visualization
    graph.forEachEdge((edge, attributes) => {
      const { parallelIndex, parallelMaxIndex } = attributes;
      if (typeof parallelIndex === "number" && parallelMaxIndex) {
        graph.mergeEdgeAttributes(edge, {
          type: "curved",
          curvature: DEFAULT_EDGE_CURVATURE + (3 * DEFAULT_EDGE_CURVATURE * parallelIndex) / parallelMaxIndex,
        });
      } else {
        graph.setEdgeAttribute(edge, "type", "straight");
      }
    });

    loadGraph(graph);
    assign();
  }, [loadGraph, assign]);

  return null;
};

function App() {
  return (
    <div className="w-full h-screen relative bg-gray-900 overflow-hidden">
      <GraphContainer>
        <MyGraph />
        <NodeInfoDock />

        {/* Custom UI Overlay - Must be inside GraphContainer to access Sigma context */}
        <div className="absolute inset-0 pointer-events-none z-10">
          {/* Top Left: Search & Filter */}
          <div className="absolute top-4 left-4 flex flex-col gap-4 pointer-events-auto">
            <SearchControl />
            <FilterControl />
          </div>

          {/* Bottom Left: Layouts */}
          <div className="absolute bottom-4 left-4 pointer-events-auto">
            <LayoutControls />
          </div>

          {/* Bottom Right: Navigation */}
          <div className="absolute bottom-4 right-4 pointer-events-auto">
            <GraphControls />
          </div>
        </div>
      </GraphContainer>
    </div>
  );
}

export default App;
