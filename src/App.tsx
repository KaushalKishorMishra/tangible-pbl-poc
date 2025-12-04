import { useEffect } from "react";
import { useLoadGraph, useSigma, useRegisterEvents } from "@react-sigma/core";
import { useLayoutForceAtlas2 } from "@react-sigma/layout-forceatlas2";
import Graph from "graphology";
import { GraphContainer } from "./components/Graph/GraphContainer";
import type { NodeAttributes, EdgeAttributes } from "./types/graph";
import nodesData from "./data/nodes.json";
import { getUniqueColor } from "./utils/colors";
import "@react-sigma/core/lib/style.css";

import { LeftDrawer } from "./components/Graph/LeftDrawer";
import { NodeInfoDock } from "./components/Graph/NodeInfoDock";
import { GraphControls } from "./components/Graph/GraphControls";
import { ArcMenu } from "./components/Graph/ArcMenu";
import ControlPosition from "./components/custom/ControlPosition";
import { useGraphStore } from "./store/graphStore";

const MyGraph = () => {
  const sigma = useSigma();
  const loadGraph = useLoadGraph();
  const registerEvents = useRegisterEvents();
  const { selectedNodeIds, setHoveredNode, handleNodeClick } = useGraphStore();
  const { assign } = useLayoutForceAtlas2({ 
    iterations: 100, 
    settings: { 
      adjustSizes: true, 
      slowDown: 10,
      scalingRatio: 1, // Controls repulsion (lower = more compact)
      strongGravityMode: true // Helps with disconnected components
    } 
  });

  // Handle node highlighting
  useEffect(() => {
    const graph = sigma.getGraph();
    
    if (selectedNodeIds.length === 0) {
      // Reset all nodes and edges
      graph.forEachNode((node: string) => {
        graph.setNodeAttribute(node, "hidden", false);
        graph.setNodeAttribute(node, "highlighted", false);
      });
      graph.forEachEdge((edge: string) => {
        graph.setEdgeAttribute(edge, "hidden", false);
      });
      return;
    }

    const relevantNodes = new Set<string>();
    
    selectedNodeIds.forEach(nodeId => {
      if (graph.hasNode(nodeId)) {
        relevantNodes.add(nodeId);
        graph.neighbors(nodeId).forEach(neighbor => relevantNodes.add(neighbor));
      }
    });

    graph.forEachNode((node: string) => {
      if (relevantNodes.has(node)) {
        graph.setNodeAttribute(node, "hidden", false);
        graph.setNodeAttribute(node, "highlighted", true);
      } else {
        graph.setNodeAttribute(node, "hidden", true);
        graph.setNodeAttribute(node, "highlighted", false);
      }
    });

    graph.forEachEdge((edge: string, _attributes: any, source: string, target: string) => {
      if (relevantNodes.has(source) && relevantNodes.has(target)) {
        graph.setEdgeAttribute(edge, "hidden", false);
      } else {
        graph.setEdgeAttribute(edge, "hidden", true);
      }
    });

  }, [selectedNodeIds, sigma]);

  // Handle node interactions (click and hover)
  useEffect(() => {
    registerEvents({
      clickNode: (event) => {
        // Use the click coordinates from the event
        const screenPos = {
          x: event.event.x,
          y: event.event.y
        };
        
        handleNodeClick(event.node, screenPos);
      },
      enterNode: (event) => {
        setHoveredNode(event.node);
      },
      leaveNode: () => {
        setHoveredNode(null);
      },
    });
  }, [registerEvents, handleNodeClick, setHoveredNode]);

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
          type: "curved", // Use arrow edges for direction
          label: combinedLabel, // Store as custom attribute, EdgeLabelManager will handle visibility
          size: 2, // Thinner edges
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
  const {
    selectedNodeIds,
    selectedNodeId,
    isDrawerOpen,
    arcMenuNode,
    handleViewDetails,
    handleSelectNode,
    handleCloseDrawer,
    handleCloseArcMenu,
  } = useGraphStore();

  return (
    <div className="w-full h-screen relative bg-gray-50 overflow-hidden">
      <GraphContainer>
        {/* Left Drawer - Now inside GraphContainer for context access */}
        <LeftDrawer />

        <MyGraph />
        
        {/* Arc Menu */}
        {arcMenuNode && (
          <ArcMenu
            position={arcMenuNode.position}
            isSelected={selectedNodeIds.includes(arcMenuNode.nodeId)}
            onView={() => handleViewDetails(arcMenuNode.nodeId)}
            onSelect={() => handleSelectNode(arcMenuNode.nodeId)}
            onClose={handleCloseArcMenu}
          />
        )}

        <NodeInfoDock 
          isOpen={isDrawerOpen} 
          selectedNodeId={selectedNodeId}
          onClose={handleCloseDrawer}
        />

        {/* Custom UI Overlay - Must be inside GraphContainer to access Sigma context */}
        <div className="absolute inset-0 pointer-events-none z-10">
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
