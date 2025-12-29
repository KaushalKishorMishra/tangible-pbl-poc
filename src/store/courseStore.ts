import { create } from "zustand";
import { persist } from "zustand/middleware";
import { reorderNodesByFlow } from "../utils/flowUtils";
import type {
	CourseModule,
	CourseNode,
	ContentResource,
} from "../types/course";
import type { GraphData, Problem, CourseData } from "./graphStore";

export interface SavedCourse {
	id: string;
	title: string;
	description: string;
	createdAt: string;
	updatedAt: string;
	graphData: GraphData;
	courseData: Partial<CourseData>;
	problems: Problem[];
}

interface CourseState {
	// Course Authoring states
	courseData: CourseModule | null;
	isNodeEditorOpen: boolean;
	editingNodeId: string | null;
	isFlowViewActive: boolean;
	viewMode: "graph" | "lms";
	completedResources: string[];
	nodeProgress: Record<string, { timeSpent: number }>;

	// Saved Courses
	savedCourses: SavedCourse[];

	// Actions
	setViewMode: (mode: "graph" | "lms") => void;
	markResourceCompleted: (resourceId: string) => void;
	updateTimeSpent: (nodeId: string, secondsToAdd: number) => void;
	setCourseData: (data: CourseModule | null) => void;
	updateNodeContent: (nodeId: string, updates: Partial<CourseNode>) => void;
	addNodeResource: (nodeId: string, resource: ContentResource) => void;
	removeNodeResource: (nodeId: string, resourceId: string) => void;
	addCourseEdge: (source: string, target: string) => void;
	removeCourseEdge: (edgeId: string) => void;
	reorderNodes: (startIndex: number, endIndex: number) => void;
	openNodeEditor: (nodeId: string) => void;
	closeNodeEditor: () => void;

	// Persistence Actions
	saveCourse: (course: SavedCourse) => void;
	deleteCourse: (courseId: string) => void;
	getCourse: (courseId: string) => SavedCourse | undefined;

	// Legacy Persistence (for compatibility)
	saveCourseToStorage: () => void;
	loadCourseFromStorage: () => void;

	setIsFlowViewActive: (isActive: boolean) => void;
}

export const useCourseStore = create<CourseState>()(
	persist(
		(set, get) => ({
			courseData: null,
			isNodeEditorOpen: false,
			editingNodeId: null,
			isFlowViewActive: false,
			viewMode: "graph",
			completedResources: [],
			nodeProgress: {},
			savedCourses: [],

			setViewMode: (mode) => set({ viewMode: mode }),
			markResourceCompleted: (resourceId) =>
				set((state) => ({
					completedResources: [...state.completedResources, resourceId],
				})),
			updateTimeSpent: (nodeId, secondsToAdd) =>
				set((state) => {
					const currentProgress = state.nodeProgress[nodeId] || {
						timeSpent: 0,
					};
					return {
						nodeProgress: {
							...state.nodeProgress,
							[nodeId]: { timeSpent: currentProgress.timeSpent + secondsToAdd },
						},
					};
				}),
			setCourseData: (data) => set({ courseData: data }),

			setIsFlowViewActive: (isActive) => set({ isFlowViewActive: isActive }),

			updateNodeContent: (nodeId, updates) =>
				set((state) => {
					if (!state.courseData) return {};
					const newNodes = state.courseData.nodes.map((node) =>
						node.id === nodeId ? { ...node, ...updates } : node,
					);
					return {
						courseData: {
							...state.courseData,
							nodes: newNodes,
							updatedAt: new Date(),
						},
					};
				}),

			addNodeResource: (nodeId, resource) =>
				set((state) => {
					if (!state.courseData) return {};
					const newNodes = state.courseData.nodes.map((node) =>
						node.id === nodeId
							? { ...node, resources: [...node.resources, resource] }
							: node,
					);
					return {
						courseData: {
							...state.courseData,
							nodes: newNodes,
							updatedAt: new Date(),
						},
					};
				}),

			removeNodeResource: (nodeId, resourceId) =>
				set((state) => {
					if (!state.courseData) return {};
					const newNodes = state.courseData.nodes.map((node) =>
						node.id === nodeId
							? {
									...node,
									resources: node.resources.filter((r) => r.id !== resourceId),
								}
							: node,
					);
					return {
						courseData: {
							...state.courseData,
							nodes: newNodes,
							updatedAt: new Date(),
						},
					};
				}),

			addCourseEdge: (source, target) =>
				set((state) => {
					if (!state.courseData) return {};
					const newEdge = {
						id: `e-${source}-${target}-${Date.now()}`,
						source,
						target,
					};
					const currentEdges = state.courseData.edges || [];
					const newEdges = [...currentEdges, newEdge];

					// Reorder nodes based on new flow
					const reorderedNodes = reorderNodesByFlow(
						state.courseData.nodes,
						newEdges,
					);

					return {
						courseData: {
							...state.courseData,
							nodes: reorderedNodes,
							edges: newEdges,
							updatedAt: new Date(),
						},
					};
				}),

			removeCourseEdge: (edgeId) =>
				set((state) => {
					if (!state.courseData) return {};
					const currentEdges = state.courseData.edges || [];
					const newEdges = currentEdges.filter((e) => e.id !== edgeId);

					// Reorder nodes based on new flow (optional but good for consistency)
					const reorderedNodes = reorderNodesByFlow(
						state.courseData.nodes,
						newEdges,
					);

					return {
						courseData: {
							...state.courseData,
							nodes: reorderedNodes,
							edges: newEdges,
							updatedAt: new Date(),
						},
					};
				}),

			reorderNodes: (startIndex, endIndex) =>
				set((state) => {
					if (!state.courseData) return {};
					const newNodes = Array.from(state.courseData.nodes);
					const [removed] = newNodes.splice(startIndex, 1);
					newNodes.splice(endIndex, 0, removed);
					return {
						courseData: {
							...state.courseData,
							nodes: newNodes,
							updatedAt: new Date(),
						},
					};
				}),

			openNodeEditor: (nodeId) =>
				set({ isNodeEditorOpen: true, editingNodeId: nodeId }),
			closeNodeEditor: () =>
				set({ isNodeEditorOpen: false, editingNodeId: null }),

			saveCourse: (course) =>
				set((state) => {
					const existingIndex = state.savedCourses.findIndex(
						(c) => c.id === course.id,
					);
					if (existingIndex >= 0) {
						const updatedCourses = [...state.savedCourses];
						updatedCourses[existingIndex] = course;
						return { savedCourses: updatedCourses };
					}
					return { savedCourses: [...state.savedCourses, course] };
				}),

			deleteCourse: (courseId) =>
				set((state) => ({
					savedCourses: state.savedCourses.filter((c) => c.id !== courseId),
				})),

			getCourse: (courseId) => {
				return get().savedCourses.find((c) => c.id === courseId);
			},

			saveCourseToStorage: () => {
				const { courseData } = get();
				if (courseData) {
					localStorage.setItem(
						"tangible_course_data",
						JSON.stringify(courseData),
					);
					console.log("Course saved to localStorage (legacy)");
				}
			},

			loadCourseFromStorage: () => {
				const stored = localStorage.getItem("tangible_course_data");
				if (stored) {
					try {
						const courseData = JSON.parse(stored);
						set({ courseData, isFlowViewActive: true });
						console.log("Course loaded from localStorage (legacy)");
					} catch (e) {
						console.error("Failed to parse course data", e);
					}
				}
			},
		}),
		{
			name: "tangible-course-storage",
			partialize: (state) => ({ savedCourses: state.savedCourses }), // Only persist savedCourses
		},
	),
);
