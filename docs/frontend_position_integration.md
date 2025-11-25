# Graph Position Persistence - Frontend Integration Guide

## Overview
This guide shows how to integrate position persistence into your graph visualization using the API service.

## Setup

### 1. Environment Variables
Create a `.env` file in the project root:

```env
VITE_API_BASE_URL=http://localhost:3000
```

For production:
```env
VITE_API_BASE_URL=https://api.yourapp.com
```

### 2. Import the Service
```typescript
import { 
  saveGraphPositions, 
  getGraphPositions, 
  deleteGraphPositions 
} from './services/graphPositionService';
```

---

## Usage Examples

### Example 1: Load Positions on Graph Init

```tsx
import { useEffect, useState } from "react";
import { useLoadGraph } from "@react-sigma/core";
import { useLayoutForceAtlas2 } from "@react-sigma/layout-forceatlas2";
import Graph from "graphology";
import { getGraphPositions } from "./services/graphPositionService";
import nodesData from "./data/nodes.json";

const MyGraph = ({ graphId }: { graphId: string }) => {
  const loadGraph = useLoadGraph();
  const { assign } = useLayoutForceAtlas2();
  const [positionsLoaded, setPositionsLoaded] = useState(false);

  useEffect(() => {
    const initGraph = async () => {
      const graph = new Graph();
      
      // Try to load saved positions first
      const savedPositions = await getGraphPositions(graphId);
      
      nodesData.nodes.forEach((node) => {
        const { type, ...otherProps } = node.properties;
        
        // Use saved position if available, otherwise random
        const position = savedPositions?.positions[node.id] || {
          x: Math.random() * 100,
          y: Math.random() * 100
        };
        
        graph.addNode(node.id, {
          x: position.x,
          y: position.y,
          size: 15,
          label: node.properties.name,
          color: getColorByLabel(node.labels[0]),
          ...otherProps
        });
      });

      // Add edges...
      
      loadGraph(graph);
      
      // Only run layout if no saved positions
      if (!savedPositions) {
        assign();
      }
      
      setPositionsLoaded(true);
    };

    initGraph();
  }, [graphId, loadGraph, assign]);

  return null;
};
```

---

### Example 2: Save Positions Button

```tsx
import { useSigma } from "@react-sigma/core";
import { saveGraphPositions } from "./services/graphPositionService";

const SaveLayoutButton = ({ graphId }: { graphId: string }) => {
  const sigma = useSigma();
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const graph = sigma.getGraph();
      const positions: { [key: string]: { x: number; y: number } } = {};
      
      // Extract positions from all nodes
      graph.forEachNode((nodeId, attributes) => {
        positions[nodeId] = {
          x: attributes.x,
          y: attributes.y
        };
      });

      await saveGraphPositions({
        graphId,
        positions,
        metadata: {
          layoutAlgorithm: "forceatlas2",
          savedAt: new Date().toISOString(),
          savedBy: "currentUserId" // Replace with actual user ID
        }
      });

      alert("Layout saved successfully!");
    } catch (error) {
      console.error("Failed to save layout:", error);
      alert("Failed to save layout. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <button
      onClick={handleSave}
      disabled={saving}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
    >
      {saving ? "Saving..." : "Save Layout"}
    </button>
  );
};
```

---

### Example 3: Reset Layout Button

```tsx
import { useSigma } from "@react-sigma/core";
import { useLayoutForceAtlas2 } from "@react-sigma/layout-forceatlas2";
import { deleteGraphPositions } from "./services/graphPositionService";

const ResetLayoutButton = ({ graphId }: { graphId: string }) => {
  const sigma = useSigma();
  const { assign } = useLayoutForceAtlas2();
  const [resetting, setResetting] = useState(false);

  const handleReset = async () => {
    if (!confirm("Are you sure you want to reset the layout?")) {
      return;
    }

    setResetting(true);
    try {
      // Delete saved positions
      await deleteGraphPositions(graphId);

      // Randomize positions
      const graph = sigma.getGraph();
      graph.forEachNode((nodeId) => {
        graph.setNodeAttribute(nodeId, "x", Math.random() * 100);
        graph.setNodeAttribute(nodeId, "y", Math.random() * 100);
      });

      // Re-run layout algorithm
      assign();

      alert("Layout reset successfully!");
    } catch (error) {
      console.error("Failed to reset layout:", error);
      alert("Failed to reset layout. Please try again.");
    } finally {
      setResetting(false);
    }
  };

  return (
    <button
      onClick={handleReset}
      disabled={resetting}
      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
    >
      {resetting ? "Resetting..." : "Reset Layout"}
    </button>
  );
};
```

---

### Example 4: Complete Integration

```tsx
import { useEffect, useState } from "react";
import { 
  useLoadGraph, 
  useSigma,
  ControlsContainer, 
  ZoomControl, 
  FullScreenControl 
} from "@react-sigma/core";
import { useLayoutForceAtlas2 } from "@react-sigma/layout-forceatlas2";
import Graph from "graphology";
import { GraphContainer } from "./components/Graph/GraphContainer";
import { 
  getGraphPositions, 
  saveGraphPositions 
} from "./services/graphPositionService";
import nodesData from "./data/nodes.json";

const GRAPH_ID = "my-graph-001"; // This should come from your app context

const MyGraph = () => {
  const loadGraph = useLoadGraph();
  const { assign } = useLayoutForceAtlas2();

  useEffect(() => {
    const initGraph = async () => {
      const graph = new Graph();
      const savedPositions = await getGraphPositions(GRAPH_ID);
      
      nodesData.nodes.forEach((node) => {
        const { type, ...otherProps } = node.properties;
        const position = savedPositions?.positions[node.id] || {
          x: Math.random() * 100,
          y: Math.random() * 100
        };
        
        graph.addNode(node.id, {
          ...position,
          size: 15,
          label: node.properties.name,
          color: getColorByLabel(node.labels[0]),
          ...otherProps
        });
      });

      // Add edges between similar nodes
      const nodesByLabel: { [key: string]: string[] } = {};
      nodesData.nodes.forEach((node) => {
        const label = node.labels[0];
        if (!nodesByLabel[label]) nodesByLabel[label] = [];
        nodesByLabel[label].push(node.id);
      });

      Object.entries(nodesByLabel).forEach(([label, nodeIds]) => {
        for (let i = 0; i < nodeIds.length - 1; i++) {
          graph.addEdge(nodeIds[i], nodeIds[i + 1], { 
            size: 2, 
            label: `Same ${label}`,
            color: "#666"
          });
        }
      });

      loadGraph(graph);
      
      if (!savedPositions) {
        assign();
      }
    };

    initGraph();
  }, [loadGraph, assign]);

  return null;
};

const SaveLayoutButton = () => {
  const sigma = useSigma();
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const graph = sigma.getGraph();
      const positions: { [key: string]: { x: number; y: number } } = {};
      
      graph.forEachNode((nodeId, attributes) => {
        positions[nodeId] = { x: attributes.x, y: attributes.y };
      });

      await saveGraphPositions({
        graphId: GRAPH_ID,
        positions,
        metadata: {
          layoutAlgorithm: "forceatlas2",
          savedAt: new Date().toISOString()
        }
      });

      alert("Layout saved!");
    } catch (error) {
      alert("Failed to save layout");
    } finally {
      setSaving(false);
    }
  };

  return (
    <button
      onClick={handleSave}
      disabled={saving}
      className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
    >
      {saving ? "Saving..." : "💾 Save Layout"}
    </button>
  );
};

function App() {
  return (
    <div className="w-full h-screen flex justify-center items-center bg-gray-900 text-white">
      <GraphContainer>
        <MyGraph />
        <ControlsContainer position={"bottom-right"}>
          <ZoomControl />
          <FullScreenControl />
          <SaveLayoutButton />
        </ControlsContainer>
        <ControlsContainer position={"top-right"}>
          <MiniMap width="200px" height="150px" />
        </ControlsContainer>
      </GraphContainer>
    </div>
  );
}

export default App;
```

---

## Best Practices

1. **Error Handling**: Always wrap API calls in try-catch blocks
2. **Loading States**: Show loading indicators during save/load operations
3. **User Feedback**: Provide clear feedback when operations succeed or fail
4. **Debouncing**: If auto-saving, debounce the save operation to avoid excessive API calls
5. **Offline Support**: Consider using localStorage as a fallback if the API is unavailable

## Auto-Save Example (Optional)

```tsx
import { useEffect, useRef } from "react";
import { useSigma } from "@react-sigma/core";
import { saveGraphPositions } from "./services/graphPositionService";

const useAutoSavePositions = (graphId: string, delay = 5000) => {
  const sigma = useSigma();
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const handleGraphUpdate = () => {
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timeout to save after delay
      timeoutRef.current = setTimeout(async () => {
        const graph = sigma.getGraph();
        const positions: { [key: string]: { x: number; y: number } } = {};
        
        graph.forEachNode((nodeId, attributes) => {
          positions[nodeId] = { x: attributes.x, y: attributes.y };
        });

        try {
          await saveGraphPositions({
            graphId,
            positions,
            metadata: {
              layoutAlgorithm: "auto-save",
              savedAt: new Date().toISOString()
            }
          });
          console.log("Auto-saved layout");
        } catch (error) {
          console.error("Auto-save failed:", error);
        }
      }, delay);
    };

    // Listen to graph updates
    sigma.on("afterRender", handleGraphUpdate);

    return () => {
      sigma.off("afterRender", handleGraphUpdate);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [sigma, graphId, delay]);
};
```

---

## Testing the Integration

### 1. Test with Mock Backend
Create a mock server for testing:

```typescript
// src/services/mockGraphPositionService.ts
export const saveGraphPositions = async (request: SavePositionsRequest) => {
  console.log("Mock: Saving positions", request);
  localStorage.setItem(`positions_${request.graphId}`, JSON.stringify(request.positions));
  return {
    success: true,
    message: "Positions saved (mock)",
    graphId: request.graphId,
    nodeCount: Object.keys(request.positions).length,
    savedAt: new Date().toISOString()
  };
};

export const getGraphPositions = async (graphId: string) => {
  const saved = localStorage.getItem(`positions_${graphId}`);
  if (!saved) return null;
  
  return {
    success: true,
    graphId,
    positions: JSON.parse(saved)
  };
};
```

### 2. Switch Between Mock and Real API
```typescript
const isDevelopment = import.meta.env.DEV;
const positionService = isDevelopment 
  ? await import('./services/mockGraphPositionService')
  : await import('./services/graphPositionService');
```
