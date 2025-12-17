import { create } from 'zustand';
import type { FilterState } from '../types/filter';
import type { CourseModule, CourseNode, ContentResource } from '../types/course';

export type UserRole = 'educator' | 'learner' | 'admin' | null;

interface UserState {
  role: UserRole;
  onboardingCompleted: boolean;
  currentOnboardingStep: number;
  isOnboardingActive: boolean;
}

interface NodeData {
  id: string;
  labels: string[];
  properties: {
    level: string;
    name: string;
    source: string;
    category: string;
  };
}

interface RelationshipData {
  id: string;
  type: string;
  start: string;
  end: string;
  properties: Record<string, unknown>;
}

export interface GraphData {
  nodesCount: number;
  relationshipsCount: number;
  nodes: NodeData[];
  relationships: RelationshipData[];
}

export interface FilterData {
  level: string[];
  source: string[];
  category: string[];
  relationshipType: string[];
  name: string[];
}

export type FilterCategory = "level" | "category" | "source" | "relationshipType" | "name";

export interface SearchItem {
  id: string;
  label: string;
  type: FilterCategory;
  category: string;
}

interface GraphState {
  // Node states
  focusedNode: string | null;
  hoveredNode: string | null;
  selectedNodeId: string | null;
  selectedNodeIds: string[];

  // Filter states
  filters: FilterState;
  availableFilters: FilterData | null;

  // Search states
  searchQuery: string;
  searchItems: SearchItem[];
  searchSuggestions: SearchItem[];

  // AI-generated graph data
  aiGeneratedGraphData: GraphData | null;

  // UI states
  isDrawerOpen: boolean;
  isLeftDrawerOpen: boolean;
  arcMenuNode: { nodeId: string; position: { x: number; y: number } } | null;
  arcMenuState: { isOpen: boolean; nodeId: string | null; position: { x: number; y: number } };
  selectedNodeForDock: string | null;
  isFlowViewActive: boolean;
  isAICourseDesignerCollapsed: boolean;
  
  // Course Authoring states
  courseData: CourseModule | null;
  isNodeEditorOpen: boolean;
  editingNodeId: string | null;

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
  setIsFlowViewActive: (isActive: boolean) => void;
  setAICourseDesignerCollapsed: (isCollapsed: boolean) => void;
  toggleNodeSelection: (nodeId: string) => void;
  removeNodeSelection: (nodeId: string) => void;

  // Course Authoring actions
  setCourseData: (data: CourseModule | null) => void;
  updateNodeContent: (nodeId: string, updates: Partial<CourseNode>) => void;
  addNodeResource: (nodeId: string, resource: ContentResource) => void;
  removeNodeResource: (nodeId: string, resourceId: string) => void;
  addCourseEdge: (source: string, target: string) => void;
  removeCourseEdge: (edgeId: string) => void;
  reorderNodes: (startIndex: number, endIndex: number) => void;
  openNodeEditor: (nodeId: string) => void;
  closeNodeEditor: () => void;
  saveCourseToStorage: () => void;
  loadCourseFromStorage: () => void;

  // Filter actions
  setFilter: (category: string, value: string) => void;
  resetFilters: () => void;
  setAvailableFilters: (filters: FilterData) => void;

  // Search actions
  setSearchQuery: (query: string) => void;
  setSearchItems: (items: SearchItem[]) => void;
  updateSearchSuggestions: () => void;
  clearSearch: () => void;
  selectSearchItem: (item: SearchItem) => void;

  // AI graph data actions
  setAIGeneratedGraphData: (data: GraphData) => void;
  clearAIGeneratedGraphData: () => void;

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
  availableFilters: null,
  searchQuery: '',
  searchItems: [],
  searchSuggestions: [],
  aiGeneratedGraphData: null,
  isDrawerOpen: false,
  isLeftDrawerOpen: true,
  arcMenuNode: null,
  arcMenuState: { isOpen: false, nodeId: null, position: { x: 0, y: 0 } },
  selectedNodeForDock: null,
  isFlowViewActive: false,
  isAICourseDesignerCollapsed: false,
  courseData: null,
  isNodeEditorOpen: false,
  editingNodeId: null,
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
  setIsFlowViewActive: (isActive) => set({ isFlowViewActive: isActive }),
  setAICourseDesignerCollapsed: (isCollapsed) => set({ isAICourseDesignerCollapsed: isCollapsed }),
  
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

  // Course Authoring actions
  setCourseData: (data) => set({ courseData: data }),
  
  updateNodeContent: (nodeId, updates) => set((state) => {
    if (!state.courseData) return {};
    const newNodes = state.courseData.nodes.map(node => 
        node.id === nodeId ? { ...node, ...updates } : node
    );
    return { courseData: { ...state.courseData, nodes: newNodes, updatedAt: new Date() } };
  }),

  addNodeResource: (nodeId, resource) => set((state) => {
    if (!state.courseData) return {};
    const newNodes = state.courseData.nodes.map(node => 
        node.id === nodeId ? { ...node, resources: [...node.resources, resource] } : node
    );
    return { courseData: { ...state.courseData, nodes: newNodes, updatedAt: new Date() } };
  }),

  removeNodeResource: (nodeId, resourceId) => set((state) => {
    if (!state.courseData) return {};
    const newNodes = state.courseData.nodes.map(node => 
        node.id === nodeId ? { ...node, resources: node.resources.filter(r => r.id !== resourceId) } : node
    );
    return { courseData: { ...state.courseData, nodes: newNodes, updatedAt: new Date() } };
  }),

  addCourseEdge: (source, target) => set((state) => {
    if (!state.courseData) return {};
    const newEdge = { id: `e-${source}-${target}-${Date.now()}`, source, target };
    const currentEdges = state.courseData.edges || [];
    return { 
        courseData: { 
            ...state.courseData, 
            edges: [...currentEdges, newEdge],
            updatedAt: new Date() 
        } 
    };
  }),

  removeCourseEdge: (edgeId) => set((state) => {
    if (!state.courseData) return {};
    const currentEdges = state.courseData.edges || [];
    return { 
        courseData: { 
            ...state.courseData, 
            edges: currentEdges.filter(e => e.id !== edgeId),
            updatedAt: new Date() 
        } 
    };
  }),

  reorderNodes: (startIndex, endIndex) => set((state) => {
    if (!state.courseData) return {};
    const newNodes = Array.from(state.courseData.nodes);
    const [removed] = newNodes.splice(startIndex, 1);
    newNodes.splice(endIndex, 0, removed);
    return { courseData: { ...state.courseData, nodes: newNodes, updatedAt: new Date() } };
  }),

  openNodeEditor: (nodeId) => set({ isNodeEditorOpen: true, editingNodeId: nodeId }),
  closeNodeEditor: () => set({ isNodeEditorOpen: false, editingNodeId: null }),

  saveCourseToStorage: () => {
    const { courseData } = get();
    if (courseData) {
        localStorage.setItem('tangible_course_data', JSON.stringify(courseData));
        console.log('Course saved to localStorage');
    }
  },

  loadCourseFromStorage: () => {
    const stored = localStorage.getItem('tangible_course_data');
    if (stored) {
        try {
            const courseData = JSON.parse(stored);
            set({ courseData, isFlowViewActive: true });
            console.log('Course loaded from localStorage');
        } catch (e) {
            console.error('Failed to parse course data', e);
        }
    }
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

  setAvailableFilters: (filters) => {
    set({ availableFilters: filters });
  },

  // Search actions
  setSearchQuery: (query) => {
    set({ searchQuery: query });
    get().updateSearchSuggestions();
  },

  setSearchItems: (items) => {
    set({ searchItems: items });
  },

  updateSearchSuggestions: () => {
    const { searchQuery, searchItems } = get();
    
    if (!searchQuery) {
      set({ searchSuggestions: [] });
      return;
    }

    const searchLower = searchQuery.toLowerCase();
    const filtered = searchItems
      .filter((item) => item.label.toLowerCase().includes(searchLower))
      .slice(0, 20);

    set({ searchSuggestions: filtered });
  },

  clearSearch: () => {
    set({ searchQuery: '', searchSuggestions: [] });
  },

  selectSearchItem: (item) => {
    if (item.type === 'name') {
      // For nodes, add to name filter
      get().setFilter('name', item.label);
    } else {
      // For other filter types, toggle the filter
      get().setFilter(item.type, item.label);
    }
    get().clearSearch();
  },

  setAIGeneratedGraphData: (data) => {
    set({ aiGeneratedGraphData: data });
  },

  clearAIGeneratedGraphData: () => {
    set({ aiGeneratedGraphData: null, availableFilters: null });
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
