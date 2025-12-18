import type { GraphData } from "../store/graphStore";
import type { CourseNode } from "../types/course";

/**
 * Linearizes a set of selected nodes from the graph into a topological sequence.
 * This is a simplified topological sort that respects dependencies where possible.
 */
export const linearizeGraph = (
    selectedNodeIds: string[],
    fullGraphData: GraphData
): CourseNode[] => {
    if (!fullGraphData || selectedNodeIds.length === 0) return [];

    // 1. Filter nodes and edges
    const nodes = fullGraphData.nodes.filter(n => selectedNodeIds.includes(n.id));
    const edges = fullGraphData.relationships.filter(r => 
        selectedNodeIds.includes(String(r.start)) && selectedNodeIds.includes(String(r.end))
    );

    // 2. Build adjacency list and in-degree map
    const adj: Record<string, string[]> = {};
    const inDegree: Record<string, number> = {};
    
    nodes.forEach(n => {
        adj[n.id] = [];
        inDegree[n.id] = 0;
    });

    edges.forEach(e => {
        const start = String(e.start);
        const end = String(e.end);
        if (adj[start]) {
            adj[start].push(end);
            inDegree[end] = (inDegree[end] || 0) + 1;
        }
    });

    // 3. Kahn's Algorithm for Topological Sort
    const queue: string[] = [];
    const resultIds: string[] = [];

    // Initialize queue with nodes having 0 in-degree
    nodes.forEach(n => {
        if (inDegree[n.id] === 0) {
            queue.push(n.id);
        }
    });

    // Sort queue to have deterministic output (e.g., alphabetical by name)
    // This helps stability if there are multiple valid topological sorts
    queue.sort((a, b) => {
        const nameA = nodes.find(n => n.id === a)?.properties.name || "";
        const nameB = nodes.find(n => n.id === b)?.properties.name || "";
        return nameA.localeCompare(nameB);
    });

    while (queue.length > 0) {
        const u = queue.shift()!;
        resultIds.push(u);

        if (adj[u]) {
            adj[u].forEach(v => {
                inDegree[v]--;
                if (inDegree[v] === 0) {
                    queue.push(v);
                }
            });
             // Re-sort queue after adding new items to maintain deterministic order
             // (Optional, but good for consistent UX)
             queue.sort((a, b) => {
                const nameA = nodes.find(n => n.id === a)?.properties.name || "";
                const nameB = nodes.find(n => n.id === b)?.properties.name || "";
                return nameA.localeCompare(nameB);
            });
        }
    }

    // 4. Handle cycles or disconnected components
    // If resultIds doesn't contain all nodes, there was a cycle.
    // We'll append the remaining nodes at the end.
    const remainingNodes = nodes.filter(n => !resultIds.includes(n.id));
    // Sort remaining nodes by name
    remainingNodes.sort((a, b) => a.properties.name.localeCompare(b.properties.name));
    
    const finalOrderIds = [...resultIds, ...remainingNodes.map(n => n.id)];

    // 5. Map to CourseNode objects
    return finalOrderIds.map(id => {
        const node = nodes.find(n => n.id === id)!;
        return {
            id: node.id,
            title: node.properties.name,
            description: `Learn about ${node.properties.name}`,
            resources: [], // Empty initially
            estimatedTime: "15 min" // Default
        };
    });
};

/**
 * Reorders existing CourseNodes based on the provided edges using topological sort.
 */
export const reorderNodesByFlow = (
    nodes: CourseNode[],
    edges: { source: string; target: string }[]
): CourseNode[] => {
    if (!nodes || nodes.length === 0) return [];
    if (!edges || edges.length === 0) return nodes;

    // 1. Build adjacency list and in-degree map
    const adj: Record<string, string[]> = {};
    const inDegree: Record<string, number> = {};
    
    nodes.forEach(n => {
        adj[n.id] = [];
        inDegree[n.id] = 0;
    });

    edges.forEach(e => {
        if (adj[e.source]) {
            adj[e.source].push(e.target);
            inDegree[e.target] = (inDegree[e.target] || 0) + 1;
        }
    });

    // 2. Kahn's Algorithm
    const queue: string[] = [];
    const resultIds: string[] = [];

    nodes.forEach(n => {
        if (inDegree[n.id] === 0) {
            queue.push(n.id);
        }
    });

    // Deterministic sort for queue
    queue.sort((a, b) => {
        const nodeA = nodes.find(n => n.id === a);
        const nodeB = nodes.find(n => n.id === b);
        return (nodeA?.title || "").localeCompare(nodeB?.title || "");
    });

    while (queue.length > 0) {
        const u = queue.shift()!;
        resultIds.push(u);

        if (adj[u]) {
            adj[u].forEach(v => {
                inDegree[v]--;
                if (inDegree[v] === 0) {
                    queue.push(v);
                }
            });
            // Re-sort queue
            queue.sort((a, b) => {
                const nodeA = nodes.find(n => n.id === a);
                const nodeB = nodes.find(n => n.id === b);
                return (nodeA?.title || "").localeCompare(nodeB?.title || "");
            });
        }
    }

    // 3. Handle cycles/disconnected
    const remainingNodes = nodes.filter(n => !resultIds.includes(n.id));
    remainingNodes.sort((a, b) => a.title.localeCompare(b.title));
    
    const finalOrderIds = [...resultIds, ...remainingNodes.map(n => n.id)];

    // 4. Return reordered nodes
    return finalOrderIds.map(id => nodes.find(n => n.id === id)!);
};
