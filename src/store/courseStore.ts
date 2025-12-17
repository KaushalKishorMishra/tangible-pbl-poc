import { create } from 'zustand';
import { reorderNodesByFlow } from "../utils/flowUtils";
import type { CourseModule, CourseNode, ContentResource } from '../types/course';

interface CourseState {
  // Course Authoring states
  courseData: CourseModule | null;
  isNodeEditorOpen: boolean;
  editingNodeId: string | null;
  isFlowViewActive: boolean; // Moved here as it relates to course view

  // Actions
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
  setIsFlowViewActive: (isActive: boolean) => void;
}

export const useCourseStore = create<CourseState>((set, get) => ({
  courseData: null,
  isNodeEditorOpen: false,
  editingNodeId: null,
  isFlowViewActive: false,

  setCourseData: (data) => set({ courseData: data }),
  
  setIsFlowViewActive: (isActive) => set({ isFlowViewActive: isActive }),

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
    const newEdges = [...currentEdges, newEdge];
    
    // Reorder nodes based on new flow
    const reorderedNodes = reorderNodesByFlow(state.courseData.nodes, newEdges);

    return { 
        courseData: { 
            ...state.courseData, 
            nodes: reorderedNodes,
            edges: newEdges,
            updatedAt: new Date() 
        } 
    };
  }),

  removeCourseEdge: (edgeId) => set((state) => {
    if (!state.courseData) return {};
    const currentEdges = state.courseData.edges || [];
    const newEdges = currentEdges.filter(e => e.id !== edgeId);

    // Reorder nodes based on new flow (optional but good for consistency)
    const reorderedNodes = reorderNodesByFlow(state.courseData.nodes, newEdges);

    return { 
        courseData: { 
            ...state.courseData, 
            nodes: reorderedNodes,
            edges: newEdges,
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
}));
