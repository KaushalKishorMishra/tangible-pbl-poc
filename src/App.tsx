import { useEffect } from "react";
import { useLoadGraph, ControlsContainer, ZoomControl, FullScreenControl } from "@react-sigma/core";
import { useLayoutForceAtlas2 } from "@react-sigma/layout-forceatlas2";
// import { MiniMap } from "@react-sigma/minimap";
import Graph from "graphology";
import { GraphContainer } from "./components/Graph/GraphContainer";
import type { NodeAttributes, EdgeAttributes } from "./types/graph";
import nodesData from "./data/nodes.json";
import { getUniqueColor } from "./utils/colors";
import "@react-sigma/core/lib/style.css";

import { SearchControl } from "./components/Graph/SearchControl";
import { LayoutControls } from "./components/Graph/LayoutControls";
import { FilterControl } from "./components/Graph/FilterControl";
import { NodeHoverInfo } from "./components/Graph/NodeHoverInfo";

const MyGraph = () => {
  const loadGraph = useLoadGraph();
  const { assign } = useLayoutForceAtlas2({ iterations: 100, settings: { adjustSizes: true, slowDown: 10 } });

  useEffect(() => {
    const graph = new Graph<NodeAttributes, EdgeAttributes>({ multi: true, type: "directed", allowSelfLoops: true });

    nodesData.nodes.forEach((node) => {
      const { category, ...otherProps } = node.properties;
      graph.addNode(node.id, {
        // Start closer to 0,0 to encourage centering
        x: (Math.random() - 0.5) * 10,
        y: (Math.random() - 0.5) * 10,
        size: 10,
        label: node.properties.name,
        color: getUniqueColor(node.id),
        ...otherProps
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

    loadGraph(graph);
    assign();
  }, [loadGraph, assign]);

  return null;
};

function App() {
  return (
    <div className="w-full h-screen bg-gray-900 /*text-white*/">
      <GraphContainer>
        <MyGraph />
        <NodeHoverInfo />
        <ControlsContainer position={"top-left"} className="flex flex-row gap-2 !items-start">
          <SearchControl />
          <FilterControl />
        </ControlsContainer>
        <ControlsContainer position={"bottom-left"}>
          <LayoutControls />
        </ControlsContainer>
        <ControlsContainer position={"bottom-right"} className="flex flex-col border-2 border-gray-500">
          <ZoomControl />
          <FullScreenControl />
        </ControlsContainer>
        {/* <ControlsContainer position={"top-right"}>
          <MiniMap width="200px" height="150px" />
        </ControlsContainer> */}
      </GraphContainer>
    </div>
  );
}

export default App;
