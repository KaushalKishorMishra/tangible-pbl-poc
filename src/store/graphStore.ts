import { create } from 'zustand';

interface GraphState {
  // Node states
  focusedNode: string | null;
  hoveredNode: string | null;
  selectedNodeId: string | null;
  
  // UI states
  isDrawerOpen: boolean;
  arcMenuNode: { nodeId: string; position: { x: number; y: number } } | null;
  
  // Actions
  setFocusedNode: (nodeId: string | null) => void;
  setHoveredNode: (nodeId: string | null) => void;
  setSelectedNodeId: (nodeId: string | null) => void;
  setIsDrawerOpen: (isOpen: boolean) => void;
  setArcMenuNode: (node: { nodeId: string; position: { x: number; y: number } } | null) => void;
  
  // Combined actions
  handleNodeClick: (nodeId: string, position: { x: number; y: number }) => void;
  handleViewDetails: (nodeId: string) => void;
  handleSelectNode: (nodeId: string) => void;
  handleCloseDrawer: () => void;
  handleCloseArcMenu: () => void;
}

export const useGraphStore = create<GraphState>((set, get) => ({
  // Initial state
  focusedNode: null,
  hoveredNode: null,
  selectedNodeId: null,
  isDrawerOpen: false,
  arcMenuNode: null,
  
  // Basic setters
  setFocusedNode: (nodeId) => set({ focusedNode: nodeId }),
  setHoveredNode: (nodeId) => set({ hoveredNode: nodeId }),
  setSelectedNodeId: (nodeId) => set({ selectedNodeId: nodeId }),
  setIsDrawerOpen: (isOpen) => set({ isDrawerOpen: isOpen }),
  setArcMenuNode: (node) => set({ arcMenuNode: node }),
  
  // Combined actions
  handleNodeClick: (nodeId, position) => {
    set({ arcMenuNode: { nodeId, position } });
  },
  
  handleViewDetails: (nodeId) => {
    set({
      selectedNodeId: nodeId,
      isDrawerOpen: true,
      focusedNode: nodeId,
      arcMenuNode: null,
    });
  },
  
  handleSelectNode: (nodeId) => {
    const currentFocused = get().focusedNode;
    set({
      focusedNode: nodeId === currentFocused ? null : nodeId,
      arcMenuNode: null,
    });
  },
  
  handleCloseDrawer: () => {
    set({
      isDrawerOpen: false,
      selectedNodeId: null,
    });
  },
  
  handleCloseArcMenu: () => {
    set({ arcMenuNode: null });
  },
}));
