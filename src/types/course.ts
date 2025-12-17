export type ResourceType = 'video' | 'pdf' | 'article' | 'quiz' | 'assignment';

export interface ContentResource {
    id: string;
    title: string;
    type: ResourceType;
    url?: string;
    content?: string; // For text content or quiz JSON
    duration?: string; // e.g., "10 min"
}

export interface CourseNode {
    id: string; // Maps to graph node ID
    title: string;
    description?: string;
    resources: ContentResource[];
    estimatedTime?: string;
}

export interface CourseModule {
    id: string;
    title: string;
    description: string;
    nodes: CourseNode[]; // Linear sequence of nodes
    createdAt: Date;
    updatedAt: Date;
}
