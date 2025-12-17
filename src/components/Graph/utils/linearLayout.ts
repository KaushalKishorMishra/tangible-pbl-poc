import Graph from "graphology";
import { animateNodes } from "sigma/utils";

export const applyLinearLayout = (graph: Graph) => {
	const nodes = graph.nodes();
	const edges = graph.edges();

	// Build adjacency list and in-degree map for topological sort
	const adj: Record<string, string[]> = {};
	const inDegree: Record<string, number> = {};

	nodes.forEach(node => {
		adj[node] = [];
		inDegree[node] = 0;
	});

	edges.forEach(edge => {
		const source = graph.source(edge);
		const target = graph.target(edge);
		const type = graph.getEdgeAttribute(edge, "label");

		let u, v;

		// Determine direction based on relationship semantics
		// We want u -> v where u comes BEFORE v in the linear sequence
		switch (type) {
			// Forward: Source comes before Target
			case "PREREQUISITE": // A is prereq for B -> A then B
			case "SUPERSEDED_BY": // A is superseded by B -> A (old) then B (new)
				u = source;
				v = target;
				break;

			// Reverse: Target comes before Source
			case "PART_OF": // A is part of B -> B (whole) then A (part)
			case "BROADENS": // A broadens B -> B (base) then A (broadened)
			case "SPECIALIZES": // A specializes B -> B (general) then A (specific)
			case "DERIVES_FROM": // A derives from B -> B (source) then A (derived)
			case "REQUIRES_POLICY": // A requires policy B -> B (policy) then A (implementation)
			case "ANTIPATTERN_OF": // A is antipattern of B -> B (pattern) then A (antipattern)
				u = target;
				v = source;
				break;

			// Neutral/Ignore: No strict ordering constraint
			default:
				u = null;
				v = null;
				break;
		}

		if (u && v && adj[u]) {
			adj[u].push(v);
			inDegree[v] = (inDegree[v] || 0) + 1;
		}
	});

	// Kahn's Algorithm
	const queue: string[] = [];
	nodes.forEach(node => {
		if (inDegree[node] === 0) {
			queue.push(node);
		}
	});

	const sortedNodes: string[] = [];
	while (queue.length > 0) {
		// Sort queue to ensure deterministic order for independent nodes (e.g. by ID)
		queue.sort((a, b) => {
			const idA = parseInt(a.replace(/\D/g, '')) || 0;
			const idB = parseInt(b.replace(/\D/g, '')) || 0;
			return idA - idB;
		});

		const u = queue.shift()!;
		sortedNodes.push(u);

		if (adj[u]) {
			adj[u].forEach(v => {
				inDegree[v]--;
				if (inDegree[v] === 0) {
					queue.push(v);
				}
			});
		}
	}

	// Handle cycles or disconnected components not reached
	// Append any remaining nodes that weren't in the sorted list (sorted by ID)
	const remainingNodes = nodes.filter(n => !sortedNodes.includes(n));
	remainingNodes.sort((a, b) => {
		const idA = parseInt(a.replace(/\D/g, '')) || 0;
		const idB = parseInt(b.replace(/\D/g, '')) || 0;
		return idA - idB;
	});
	sortedNodes.push(...remainingNodes);

	const spacing = 100; // Space between nodes
	const newPositions: Record<string, { x: number; y: number }> = {};

	sortedNodes.forEach((node, index) => {
		newPositions[node] = { x: index * spacing, y: 0 };
	});

	// Calculate edge curvatures
	graph.forEachEdge((edge, _attrs, source, target) => {
		const sourceIndex = sortedNodes.indexOf(source);
		const targetIndex = sortedNodes.indexOf(target);
		const distance = Math.abs(targetIndex - sourceIndex);

		// Calculate curvature based on distance
		// Higher distance = higher arc
		const curvature = 0.2 + (distance * 0.1);

		graph.setEdgeAttribute(edge, "type", "curved");
		graph.setEdgeAttribute(edge, "curvature", curvature);
	});

	animateNodes(graph, newPositions, { duration: 1000 });
};
