import { create } from 'zustand';
import type { FilterState } from '../types/filter';

export type UserRole = 'educator' | 'learner' | 'admin' | null;

interface UserState {
  role: UserRole;
  onboardingCompleted: boolean;
  currentOnboardingStep: number;
  isOnboardingActive: boolean;
}

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
  isLeftDrawerOpen: boolean;
  arcMenuNode: { nodeId: string; position: { x: number; y: number } } | null;
  arcMenuState: { isOpen: boolean; nodeId: string | null; position: { x: number; y: number } };
  selectedNodeForDock: string | null;

  // User states
  user: UserState;
  
  // Actions
  setFocusedNode: (nodeId: string | null) => void;
  setHoveredNode: (nodeId: string | null) => void;
  setSelectedNodeId: (nodeId: string | null) => void;
  setSelectedNodeIds: (nodeIds: string[]) => void;
  setIsDrawerOpen: (isOpen: boolean) => void;
  setIsLeftDrawerOpen: (isOpen: boolean) => void;
  setArcMenuNode: (node: { nodeId: string; position: { x: number; y: number } } | null) => void;
  setArcMenuState: (state: { isOpen: boolean; nodeId: string | null; position: { x: number; y: number } }) => void;
  setSelectedNodeForDock: (nodeId: string | null) => void;
  toggleNodeSelection: (nodeId: string) => void;
  removeNodeSelection: (nodeId: string) => void;

  // Filter actions
  setFilter: (category: string, value: string) => void;
  resetFilters: () => void;

  // User actions
  setUserRole: (role: UserRole) => void;
  startOnboarding: () => void;
  completeOnboarding: () => void;
  setOnboardingStep: (step: number) => void;
  skipOnboarding: () => void;

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
  isLeftDrawerOpen: true,
  arcMenuNode: null,
  arcMenuState: { isOpen: false, nodeId: null, position: { x: 0, y: 0 } },
  selectedNodeForDock: null,
  user: {
    role: null,
    onboardingCompleted: false,
    currentOnboardingStep: 0,
    isOnboardingActive: false,
  },
  
  // Basic setters
  setFocusedNode: (nodeId) => set({ focusedNode: nodeId }),
  setHoveredNode: (nodeId) => set({ hoveredNode: nodeId }),
  setSelectedNodeId: (nodeId) => set({ selectedNodeId: nodeId }), // Keep for now if used elsewhere, but we should migrate
  setSelectedNodeIds: (nodeIds) => set({ selectedNodeIds: nodeIds }),
  setIsDrawerOpen: (isOpen) => set({ isDrawerOpen: isOpen }),
  setIsLeftDrawerOpen: (isOpen) => set({ isLeftDrawerOpen: isOpen }),
  setArcMenuNode: (node) => set({ arcMenuNode: node }),
  setArcMenuState: (state) => set({ arcMenuState: state }),
  setSelectedNodeForDock: (nodeId) => set({ selectedNodeForDock: nodeId, isDrawerOpen: !!nodeId }),
  
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

  // User actions
  setUserRole: (role) => {
    set((state) => ({
      user: {
        ...state.user,
        role,
        isOnboardingActive: role === 'educator' && !state.user.onboardingCompleted,
      },
    }));
  },

  startOnboarding: () => {
    set((state) => ({
      user: {
        ...state.user,
        isOnboardingActive: true,
        currentOnboardingStep: 0,
      },
    }));
  },

  completeOnboarding: () => {
    set((state) => ({
      user: {
        ...state.user,
        onboardingCompleted: true,
        isOnboardingActive: false,
        currentOnboardingStep: 0,
      },
    }));
  },

  setOnboardingStep: (step) => {
    set((state) => ({
      user: {
        ...state.user,
        currentOnboardingStep: step,
      },
    }));
  },

  skipOnboarding: () => {
    set((state) => ({
      user: {
        ...state.user,
        onboardingCompleted: true,
        isOnboardingActive: false,
        currentOnboardingStep: 0,
      },
    }));
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
