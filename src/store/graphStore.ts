import { create } from 'zustand';
import type { FilterState } from '../types/filter';

interface GraphState {
  // Node states
  focusedNode: string | null;
  hoveredNode: string | null;
  selectedNodeId: string | null;
  selectedNodeIds: string[];
  
  // Filter states
  filters: FilterState;

  // UI states
  isDrawerOpen: boolean;
  arcMenuNode: { nodeId: string; position: { x: number; y: number } } | null;
  
  // Actions
  setFocusedNode: (nodeId: string | null) => void;
  setHoveredNode: (nodeId: string | null) => void;
  setSelectedNodeId: (nodeId: string | null) => void;
  setIsDrawerOpen: (isOpen: boolean) => void;
  setArcMenuNode: (node: { nodeId: string; position: { x: number; y: number } } | null) => void;
  toggleNodeSelection: (nodeId: string) => void;
  removeNodeSelection: (nodeId: string) => void;
  
  // Filter actions
  setFilter: (category: string, value: string) => void;
  resetFilters: () => void;

  // Combined actions
  handleNodeClick: (nodeId: string, position: { x: number; y: number }) => void;
  handleViewDetails: (nodeId: string) => void;
  handleSelectNode: (nodeId: string) => void;
  handleCloseDrawer: () => void;
  handleCloseArcMenu: () => void;
}

export const useGraphStore = create<GraphState>((set, get) => ({
  // Initial state
  focusedNode: null, // Deprecated in favor of selectedNodeIds for highlighting, but kept for compatibility if needed or single focus
  hoveredNode: null,
  selectedNodeId: null, // Deprecated, use selectedNodeIds
  selectedNodeIds: [],
  filters: {
    level: [],
    category: [],
    source: [],
    name: [],
    relationshipType: [],
  },
  isDrawerOpen: false,
  arcMenuNode: null,
  
  // Basic setters
  setFocusedNode: (nodeId) => set({ focusedNode: nodeId }),
  setHoveredNode: (nodeId) => set({ hoveredNode: nodeId }),
  setSelectedNodeId: (nodeId) => set({ selectedNodeId: nodeId }), // Keep for now if used elsewhere, but we should migrate
  setIsDrawerOpen: (isOpen) => set({ isDrawerOpen: isOpen }),
  setArcMenuNode: (node) => set({ arcMenuNode: node }),
  
  // New actions
  toggleNodeSelection: (nodeId) => {
    const currentSelected = get().selectedNodeIds;
    const isSelected = currentSelected.includes(nodeId);
    set({
      selectedNodeIds: isSelected 
        ? currentSelected.filter(id => id !== nodeId)
        : [...currentSelected, nodeId],
      arcMenuNode: null, // Close menu on selection change
    });
  },

  removeNodeSelection: (nodeId) => {
     set(state => ({
        selectedNodeIds: state.selectedNodeIds.filter(id => id !== nodeId)
     }));
  },

  // Filter actions
  setFilter: (category, value) => {
    set((state) => {
      const currentValues = state.filters[category] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value];
      
      return {
        filters: {
          ...state.filters,
          [category]: newValues,
        },
      };
    });
  },

  resetFilters: () => {
    set({
      filters: {
        level: [],
        category: [],
        source: [],
        name: [],
        relationshipType: [],
      },
      selectedNodeIds: [],
    });
  },

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
    // Toggle selection
    get().toggleNodeSelection(nodeId);
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
