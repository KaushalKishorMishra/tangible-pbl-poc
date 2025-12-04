import { useEffect } from "react";
import { useLoadGraph } from "@react-sigma/core";
import { useLayoutForceAtlas2 } from "@react-sigma/layout-forceatlas2";
import Graph from "graphology";
import { GraphContainer } from "./components/Graph/GraphContainer";
import type { NodeAttributes, EdgeAttributes } from "./types/graph";
import nodesData from "./data/nodes.json";
import { getUniqueColor } from "./utils/colors";
import "@react-sigma/core/lib/style.css";

import { SearchControl } from "./components/Graph/SearchControl";
import { LayoutControls } from "./components/Graph/LayoutControls";
import { FilterControl } from "./components/Graph/FilterControl";
import { NodeInfoDock } from "./components/Graph/NodeInfoDock";
import { GraphControls } from "./components/Graph/GraphControls";
import ControlPosition from "./components/custom/ControlPosition";

const MyGraph = () => {
  const loadGraph = useLoadGraph();
  const { assign } = useLayoutForceAtlas2({ 
    iterations: 100, 
    settings: { 
      adjustSizes: true, 
      slowDown: 10,
      scalingRatio: 1, // Controls repulsion (lower = more compact)
      strongGravityMode: true // Helps with disconnected components
    } 
  });

  useEffect(() => {
    // Register custom node program
    const graph = new Graph<NodeAttributes, EdgeAttributes>({ multi: true, type: "directed", allowSelfLoops: true });

    // 1. Add Nodes with Custom Renderer
    const nodeDegrees = new Map<string, number>();

    // Calculate degrees first to find central node
    if (nodesData.relationships) {
      nodesData.relationships.forEach(rel => {
        nodeDegrees.set(rel.start, (nodeDegrees.get(rel.start) || 0) + 1);
        nodeDegrees.set(rel.end, (nodeDegrees.get(rel.end) || 0) + 1);
      });
    }

    // Find node with max degree
    let maxDegree = 0;
    let centralNodeId = "";
    nodeDegrees.forEach((degree, id) => {
      if (degree > maxDegree) {
        maxDegree = degree;
        centralNodeId = id;
      }
    });

    nodesData.nodes.forEach((node) => {
      const isCentral = node.id === centralNodeId;
      const color = getUniqueColor(node.id);

      graph.addNode(node.id, {
        x: isCentral ? 0 : (Math.random() - 0.5) * 100,
        y: isCentral ? 0 : (Math.random() - 0.5) * 100,
        size: isCentral ? 20 : 10, // Standard sizes
        label: node.properties.name,
        color: color,
        fixed: isCentral,
        ...node.properties
      });
    });

    // 2. Merge Parallel Edges
    const edgeGroups = new Map<string, typeof nodesData.relationships>();

    if (nodesData.relationships) {
      nodesData.relationships.forEach((rel) => {
        const key = `${rel.start}-${rel.end}`;
        if (!edgeGroups.has(key)) {
          edgeGroups.set(key, []);
        }
        edgeGroups.get(key)?.push(rel);
      });

      edgeGroups.forEach((rels) => {
        const rel = rels[0]; // Use first relationship for basic data
        const sourceColor = graph.getNodeAttribute(rel.start, "color");

        // Combine labels if multiple
        const combinedLabel = rels.map(r => r.type).join(", ");

        graph.addEdge(rel.start, rel.end, {
          type: "curved", // Use curved edges
          label: combinedLabel,
          size: 5, // Thicker edges
          color: sourceColor // Match source node color
        });
      });
    }

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
          <ControlPosition position="top-left">
            <FilterControl />
          </ControlPosition>
          <ControlPosition position="bottom-center">
            <SearchControl />
          </ControlPosition>
          {/* Bottom Left: Layouts */}
          <ControlPosition position="bottom-left">
            <LayoutControls />
          </ControlPosition>

          {/* Bottom Right: Navigation */}
          <ControlPosition position="bottom-right">
            <GraphControls />
          </ControlPosition>
        </div>
      </GraphContainer>
    </div>
  );
}

export default App;
