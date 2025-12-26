import { create } from 'zustand';
import type { FilterState } from '../types/filter';

export interface CourseData {
  title: string;
  description: string;
  duration: string;
  level: string;
  targetAudience: string;
  mainFocus: string;
}

export interface RelationshipData {
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

export interface NodeData {
  id: string;
  labels: string[];
  properties: {
    level: string;
    name: string;
    source: string;
    category: string;
  };
  // Nested Hierarchical Data
  skills?: GraphData;
  competencies?: SkillCompetency[];
  content?: {
    type: 'video' | 'pdf' | 'text' | 'link';
    url: string;
    title: string;
    description?: string;
  }[];
  contentUnits?: {
    id: string;
    title: string;
    description: string;
    duration: string;
  }[];
  resources?: {
    id: string;
    title: string;
    url: string;
    type: string;
  }[];
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

export interface Problem {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  estimatedTime: string;
  goals?: string[];
  constraints?: string[];
}

export interface CompetencyLevel {
    level: "Awareness" | "Application" | "Mastery" | "Influence";
    description: string;
    proofOfWork: string;
    rubric: string;
}

export interface SkillCompetency {
    skill: string;
    levels: CompetencyLevel[];
}

export interface CachedProblemData {
    graphData: GraphData;
    filterData: FilterData;
    competencyFramework: SkillCompetency[];
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
  
  // Problem Generation
  generatedProblems: Problem[];
  selectedProblem: Problem | null;
  problemDataCache: Record<string, CachedProblemData>;

  // Competency Framework
  competencyFramework: SkillCompetency[];

  // UI states
  isDrawerOpen: boolean;
  isLeftDrawerOpen: boolean;
  arcMenuNode: { nodeId: string; position: { x: number; y: number } } | null;
  arcMenuState: { isOpen: boolean; nodeId: string | null; position: { x: number; y: number } };
  selectedNodeForDock: string | null;
  isAICourseDesignerCollapsed: boolean;
  
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
  setAICourseDesignerCollapsed: (isCollapsed: boolean) => void;
  toggleNodeSelection: (nodeId: string) => void;
  removeNodeSelection: (nodeId: string) => void;

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
  updateNodeData: (nodeId: string, data: Partial<NodeData>) => void;
  applyStructuralChanges: (changes: any) => void;

  // Problem actions
  setGeneratedProblems: (problems: Problem[]) => void;
  setSelectedProblem: (problem: Problem | null) => void;
  cacheProblemData: (problemId: string, data: CachedProblemData) => void;
  clearProblemCache: () => void;

  // Competency actions
  setCompetencyFramework: (framework: SkillCompetency[]) => void;

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
  generatedProblems: [],  selectedProblem: null,
  problemDataCache: {},
  competencyFramework: [],
  isDrawerOpen: false,
  isLeftDrawerOpen: true,
  arcMenuNode: null,
  arcMenuState: { isOpen: false, nodeId: null, position: { x: 0, y: 0 } },
  selectedNodeForDock: null,
  isAICourseDesignerCollapsed: false,
  
  // Basic setters
  setFocusedNode: (nodeId: string | null) => set({ focusedNode: nodeId }),
  setHoveredNode: (nodeId: string | null) => set({ hoveredNode: nodeId }),
  setSelectedNodeId: (nodeId: string | null) => set({ selectedNodeId: nodeId }), // Keep for now if used elsewhere, but we should migrate
  setSelectedNodeIds: (nodeIds: string[]) => set({ selectedNodeIds: nodeIds }),
  setIsDrawerOpen: (isOpen: boolean) => set({ isDrawerOpen: isOpen }),
  setIsLeftDrawerOpen: (isOpen: boolean) => set({ isLeftDrawerOpen: isOpen }),
  setArcMenuNode: (node: { nodeId: string; position: { x: number; y: number } } | null) => set({ arcMenuNode: node }),
  setArcMenuState: (state: { isOpen: boolean; nodeId: string | null; position: { x: number; y: number } }) => set({ arcMenuState: state }),
  setSelectedNodeForDock: (nodeId: string | null) => set({ selectedNodeForDock: nodeId, isDrawerOpen: !!nodeId }),
  setAICourseDesignerCollapsed: (isCollapsed: boolean) => set({ isAICourseDesignerCollapsed: isCollapsed }),
  
  // New actions
  toggleNodeSelection: (nodeId: string) => {
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
  setFilter: (category: string, value: string) => {
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

  setAvailableFilters: (filters: FilterData) => {
    set({ availableFilters: filters });
  },

  // Search actions
  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
    get().updateSearchSuggestions();
  },

  setSearchItems: (items: SearchItem[]) => {
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

  selectSearchItem: (item: SearchItem) => {
    if (item.type === 'name') {
      // For nodes, add to name filter
      get().setFilter('name', item.label);
    } else {
      // For other filter types, toggle the filter
      get().setFilter(item.type, item.label);
    }
    get().clearSearch();
  },

  setAIGeneratedGraphData: (data: GraphData) => {
    set({ aiGeneratedGraphData: data });
  },

  clearAIGeneratedGraphData: () => {
    set({ aiGeneratedGraphData: null, availableFilters: null });
  },

  updateNodeData: (nodeId: string, data: Partial<NodeData>) => {
      set((state) => {
          if (!state.aiGeneratedGraphData) return state;
          
          const updatedNodes = state.aiGeneratedGraphData.nodes.map(node => {
              if (node.id === nodeId) {
                  return { ...node, ...data };
              }
              return node;
          });

          return {
              aiGeneratedGraphData: {
                  ...state.aiGeneratedGraphData,
                  nodes: updatedNodes
              }
          };
      });
  },

  applyStructuralChanges: (changes: any) => {
      if (!changes || !changes.action) return;
      const { action, details } = changes;
      
      set((state) => {
          if (!state.aiGeneratedGraphData) return state;
          
          const updatedGraph = { ...state.aiGeneratedGraphData };
          
          switch (action) {
              case 'add_content':
                  const newNode: NodeData = {
                      id: `node-${Date.now()}`,
                      labels: ["Skill"],
                      properties: {
                          name: details.name,
                          level: details.level || "Application",
                          source: "AI",
                          category: details.category || "General"
                      }
                  };
                  updatedGraph.nodes.push(newNode);
                  updatedGraph.nodesCount++;
                  // Auto-select the new node
                  state.selectedNodeIds.push(newNode.id);
                  break;
              case 'update_content':
                  const nodeIndex = updatedGraph.nodes.findIndex(n => n.id === details.id || n.properties.name === details.name);
                  if (nodeIndex !== -1) {
                      updatedGraph.nodes[nodeIndex] = {
                          ...updatedGraph.nodes[nodeIndex],
                          properties: {
                              ...updatedGraph.nodes[nodeIndex].properties,
                              ...details.properties
                          }
                      };
                  }
                  break;
              case 'add_sub_content':
                  const parentNodeIdx = updatedGraph.nodes.findIndex(n => n.id === details.parentId || n.properties.name === details.parentName);
                  if (parentNodeIdx !== -1) {
                      const nodeToUpdate = { ...updatedGraph.nodes[parentNodeIdx] };
                      if (!nodeToUpdate.contentUnits) nodeToUpdate.contentUnits = [];
                      nodeToUpdate.contentUnits.push({
                          id: `unit-${Date.now()}`,
                          title: details.title,
                          description: details.description,
                          duration: details.duration
                      });
                      updatedGraph.nodes[parentNodeIdx] = nodeToUpdate;
                  }
                  break;
              case 'add_resource':
                  const targetNodeIdx = updatedGraph.nodes.findIndex(n => n.id === details.nodeId || n.properties.name === details.nodeName);
                  if (targetNodeIdx !== -1) {
                      const nodeToUpdate = { ...updatedGraph.nodes[targetNodeIdx] };
                      if (!nodeToUpdate.resources) nodeToUpdate.resources = [];
                      nodeToUpdate.resources.push({
                          id: `res-${Date.now()}`,
                          title: details.title,
                          url: details.url,
                          type: details.type || "link"
                      });
                      updatedGraph.nodes[targetNodeIdx] = nodeToUpdate;
                  }
                  break;
          }
          
          return { aiGeneratedGraphData: updatedGraph };
      });
  },

  setGeneratedProblems: (problems: Problem[]) => set({ generatedProblems: problems }),
  setSelectedProblem: (problem: Problem | null) => set({ selectedProblem: problem }),
  cacheProblemData: (problemId: string, data: CachedProblemData) => set((state) => ({
    problemDataCache: {
        ...state.problemDataCache,
        [problemId]: data
    }
  })),
  clearProblemCache: () => set({ problemDataCache: {} }),
  
  setCompetencyFramework: (framework: SkillCompetency[]) => set({ competencyFramework: framework }),

  // Combined actions
  handleNodeClick: (nodeId: string, position: { x: number; y: number }) => {
    set({ arcMenuNode: { nodeId, position } });
  },
  
  handleViewDetails: (nodeId: string) => {
    set({
      selectedNodeId: nodeId,
      isDrawerOpen: true,
      focusedNode: nodeId,
      arcMenuNode: null,
    });
  },
  
  handleSelectNode: (nodeId: string) => {
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
