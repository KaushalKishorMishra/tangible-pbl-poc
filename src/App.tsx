import { useEffect } from "react";
import { useLoadGraph, ControlsContainer, ZoomControl, FullScreenControl } from "@react-sigma/core";
import { useLayoutForceAtlas2 } from "@react-sigma/layout-forceatlas2";
import { MiniMap } from "@react-sigma/minimap";
import Graph from "graphology";
import { GraphContainer } from "./components/Graph/GraphContainer";
import type { NodeAttributes, EdgeAttributes } from "./types/graph";
import nodesData from "./data/nodes.json";
import { getColorByLabel } from "./utils/colors";
import "@react-sigma/core/lib/style.css";

const MyGraph = () => {
  const loadGraph = useLoadGraph();
  const { assign } = useLayoutForceAtlas2();

  useEffect(() => {
    const graph = new Graph<NodeAttributes, EdgeAttributes>();

    nodesData.nodes.forEach((node) => {
      const { type, ...otherProps } = node.properties;
      graph.addNode(node.id, {
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 15,
        label: node.properties.name,
        color: getColorByLabel(node.labels[0]),
        ...otherProps
      });
    });

    // Add edges between nodes with the same label (similar concepts)
    const nodesByLabel: { [key: string]: string[] } = {};

    // Group nodes by their label
    nodesData.nodes.forEach((node) => {
      const label = node.labels[0];
      if (!nodesByLabel[label]) {
        nodesByLabel[label] = [];
      }
      nodesByLabel[label].push(node.id);
    });

    // Create edges between nodes of the same type
    Object.entries(nodesByLabel).forEach(([label, nodeIds]) => {
      // Connect each node to the next one in the same group (chain)
      for (let i = 0; i < nodeIds.length - 1; i++) {
        graph.addEdge(nodeIds[i], nodeIds[i + 1], {
          size: 2,
          label: `Same ${label}`,
          color: "#666"
        });
      }
    });

    loadGraph(graph);
    assign();
  }, [loadGraph, assign]);

  return null;
};

function App() {
  return (
    <div className="w-full h-screen flex justify-center items-center bg-gray-900 text-white">
      <GraphContainer>
        <MyGraph />
        <ControlsContainer position={"bottom-right"}>
          <ZoomControl />
          <FullScreenControl />
        </ControlsContainer>
        <ControlsContainer position={"top-right"}>
          <MiniMap width="200px" height="150px" />
        </ControlsContainer>
      </GraphContainer>
    </div>
  );
}

export default App;
