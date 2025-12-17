import Graph from "graphology";
import { animateNodes } from "sigma/utils";

export const applyTreeLayout = (graph: Graph) => {
	const nodes = graph.nodes();
	const edges = graph.edges();

	// 1. Build Hierarchy Graph (Adjacency List)
	// We only include "Blocking" and "Structural" relationships for the hierarchy
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

		// Apply Edge Styling Rules
		let color = "#999";
		let size = 2;
		let typeAttr = "arrow"; // default


		// Level 1-2: Solid, Bold
		if (["PREREQUISITE", "REQUIRES_POLICY", "PART_OF"].includes(type)) {
			color = "#374151"; // Dark Gray
			size = 3;
		}
		// Level 3-4: Solid, Normal
		else if (["DERIVES_FROM", "SUPERSEDED_BY", "SPECIALIZES", "BROADENS"].includes(type)) {
			color = "#6B7280"; // Gray
			size = 2;
		}
		// Level 5-6: Dashed (Simulated with lighter color/smaller size)
		else if (["EQUIVALENT_TO", "ALIAS_OF", "ALTERNATIVE_TO", "ANTIPATTERN_OF"].includes(type)) {
			color = "#9CA3AF"; // Light Gray
			size = 1.5;
		}
		// Level 7-8: Dotted/Low Opacity
		else {
			color = "#D1D5DB"; // Very Light Gray
			size = 1;
		}

		graph.setEdgeAttribute(edge, "color", color);
		graph.setEdgeAttribute(edge, "size", size);
		graph.setEdgeAttribute(edge, "type", typeAttr);


		// Determine Hierarchy Direction (Parent -> Child)
		// Parent should be ABOVE Child (Lower Rank -> Higher Rank)
		let u: string | null = null;
		let v: string | null = null;

		switch (type) {
			// Level 1: Prerequisite (Before -> After)
			case "PREREQUISITE": // Source is Parent
				u = source; v = target; break;
			case "REQUIRES_POLICY": // Target (Policy) is Parent
				u = target; v = source; break;

			// Level 2: Part Of (Container -> Part)
			case "PART_OF": // Target (Container) is Parent
				u = target; v = source; break;

			// Level 3: Lineage (Origin -> Derived)
			case "DERIVES_FROM": // Target (Origin) is Parent
				u = target; v = source; break;
			case "SUPERSEDED_BY": // Source (Old) is Parent
				u = source; v = target; break;

			// Level 4: Taxonomy (General -> Specific)
			case "SPECIALIZES": // Target (General) is Parent
				u = target; v = source; break;
			case "BROADENS": // Target (Base) is Parent (Base -> Broadened)
				u = target; v = source; break;
			
			// Level 6: Guidance
			case "ANTIPATTERN_OF": // Target (Pattern) is Parent
				u = target; v = source; break;
			
			default:
				// Ignore other relationships for hierarchy
				break;
		}

		if (u && v) {
			adj[u].push(v);
			inDegree[v] = (inDegree[v] || 0) + 1;
		}
	});

	// 2. Assign Ranks (Topological Sort / Kahn's Algorithm)
	// This prevents infinite loops in case of cycles
	const ranks: Record<string, number> = {};
	const queue: string[] = [];

	// Initialize roots (in-degree 0)
	nodes.forEach(node => {
		if (inDegree[node] === 0) {
			ranks[node] = 0;
			queue.push(node);
		}
	});

	// Process queue
	const sortedNodes: string[] = [];
	while (queue.length > 0) {
		const u = queue.shift()!;
		sortedNodes.push(u);
		const currentRank = ranks[u];

		if (adj[u]) {
			adj[u].forEach(v => {
				inDegree[v]--;
				// Update rank to be at least parent + 1
				ranks[v] = Math.max(ranks[v] || 0, currentRank + 1);
				
				if (inDegree[v] === 0) {
					queue.push(v);
				}
			});
		}
	}

	// Handle cycles (nodes with remaining in-degree)
	// Assign them a rank based on their current max rank or default
	nodes.forEach(node => {
		if (ranks[node] === undefined) {
			// If part of a cycle, push it down
			ranks[node] = 0; 
		}
	});

	// 3. Order within Ranks
	const nodesByRank: Record<number, string[]> = {};
	let maxRank = 0;

	Object.entries(ranks).forEach(([node, rank]) => {
		if (!nodesByRank[rank]) nodesByRank[rank] = [];
		nodesByRank[rank].push(node);
		maxRank = Math.max(maxRank, rank);
	});

	// Sort within ranks to minimize crossing (Simple heuristic: sort by ID or connection)
	// For now, sorting by ID to be deterministic
	Object.values(nodesByRank).forEach(rankNodes => {
		rankNodes.sort((a, b) => {
			const idA = parseInt(a.replace(/\D/g, '')) || 0;
			const idB = parseInt(b.replace(/\D/g, '')) || 0;
			return idA - idB;
		});
	});

	// 4. Assign Positions
	const VERTICAL_SPACING = 200;
	const HORIZONTAL_SPACING = 150;
	const newPositions: Record<string, { x: number; y: number }> = {};

	for (let r = 0; r <= maxRank; r++) {
		const rankNodes = nodesByRank[r] || [];
		const width = rankNodes.length * HORIZONTAL_SPACING;
		const startX = -width / 2;

		rankNodes.forEach((node, index) => {
			newPositions[node] = {
				x: startX + (index * HORIZONTAL_SPACING),
				y: r * VERTICAL_SPACING
			};
		});
	}

	// 5. Apply Edge Curvature
	// We do this after calculating positions to know the geometry
	graph.forEachEdge((edge, _attrs, source, target) => {
		const sourcePos = newPositions[source];
		const targetPos = newPositions[target];

		if (!sourcePos || !targetPos) return;

		const dx = Math.abs(targetPos.x - sourcePos.x);

		const rankDiff = Math.abs((ranks[target] || 0) - (ranks[source] || 0));

		// If strictly vertical (same X), keep straight
		if (dx < 10) {
			graph.setEdgeAttribute(edge, "type", "arrow");
			graph.setEdgeAttribute(edge, "curvature", 0);
		} else {
			// Curve based on rank difference to avoid crossing intermediate nodes
			// Higher rank diff = more curve to go "around"
			const curvature = 0.2 + (rankDiff * 0.1);
			graph.setEdgeAttribute(edge, "type", "curved");
			graph.setEdgeAttribute(edge, "curvature", curvature);
		}
	});

	animateNodes(graph, newPositions, { duration: 1000 });
};
