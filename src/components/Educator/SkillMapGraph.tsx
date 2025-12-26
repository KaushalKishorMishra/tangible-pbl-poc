import React, { useState, useEffect } from "react";
import { SigmaContainer, useLoadGraph, useSigma, useRegisterEvents } from "@react-sigma/core";
import Graph from "graphology";
import "@react-sigma/core/lib/style.css";
import nodesData from "../../data/nodes.json";
import { useGraphStore } from "../../store/graphStore";
import { GraphControls } from "../Graph/GraphControls";
import { LeftDrawer } from "../Graph/LeftDrawer";
import { ArcMenu } from "../Graph/ArcMenu";
import { NodeInfoDock } from "../Graph/NodeInfoDock";
import EdgeCurveProgram from "@sigma/edge-curve";
import { EdgeArrowProgram } from "sigma/rendering";

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

interface GraphData {
	nodesCount: number;
	relationshipsCount: number;
	nodes: NodeData[];
	relationships: RelationshipData[];
}

interface SkillMapGraphProps {
	selectedCategories: string[];
	graphData?: GraphData | null;
    isEmbedded?: boolean;
    onNodeClick?: (nodeId: string) => void;
}

const GraphThemeUpdater: React.FC = () => {
	const sigma = useSigma();

	useEffect(() => {
		sigma.setSetting("defaultNodeColor", "#6b7280");
		sigma.setSetting("defaultEdgeColor", "#cbd5e1");
		sigma.setSetting("labelColor", { color: "#1f2937" });
		sigma.setSetting("edgeLabelColor", { color: "#64748b" });

		// Update existing node colors based on theme
		const graph = sigma.getGraph();
		graph.forEachNode((node, attributes) => {
			const level = attributes.level as string;
			const colorMap: Record<string, string> = {
				Awareness: "#10b981", // emerald-500
				Application: "#3b82f6", // blue-500
				Mastery: "#8b5cf6", // violet-500
				Influence: "#f59e0b", // amber-500
			};

			// Only update if not highlighted (highlighted nodes are handled by GraphEventsHandler)
			if (!attributes.highlighted) {
				graph.setNodeAttribute(node, "color", colorMap[level] || "#6b7280");
			}
		});

		// Force refresh
		sigma.refresh();
	}, [sigma]);

	return null;
};

const GraphEventsHandler: React.FC<{ onNodeClick?: (nodeId: string) => void }> = ({ onNodeClick }) => {
	const sigma = useSigma();
	const registerEvents = useRegisterEvents();
	const { selectedNodeIds, setArcMenuState } = useGraphStore();
	const [hoveredNode, setHoveredNode] = useState<string | null>(null);

	useEffect(() => {
		// Register event handlers
		registerEvents({
			clickNode: (event) => {
				const nodeId = event.node;
                
                if (onNodeClick) {
                    onNodeClick(nodeId);
                } else {
                    // Default behavior (ArcMenu)
                    setArcMenuState({
                        isOpen: true,
                        nodeId,
                        position: { x: event.event.x, y: event.event.y },
                    });
                }
			},
			enterNode: (event) => {
				setHoveredNode(event.node);
			},
			leaveNode: () => {
				setHoveredNode(null);
			},
		});
	}, [registerEvents, setArcMenuState]);

	useEffect(() => {
		const graph = sigma.getGraph();

		// If nodes are selected, collect all connected nodes
		const connectedNodes = new Set<string>();
		if (selectedNodeIds.length > 0) {
			selectedNodeIds.forEach(nodeId => {
                if (graph.hasNode(nodeId)) {
                    connectedNodes.add(nodeId);
                    // Add all neighbors
                    graph.forEachNeighbor(nodeId, (neighbor) => {
                        connectedNodes.add(neighbor);
                    });
                }
			});
		}

		// Update node visibility and styling
		graph.forEachNode((node) => {
			const isSelected = selectedNodeIds.includes(node);
			const isHovered = hoveredNode === node;
			const isConnected = connectedNodes.has(node);

			// Hide nodes that are not selected or connected when selection is active
			if (selectedNodeIds.length > 0 && !isConnected) {
				graph.setNodeAttribute(node, "hidden", true);
			} else {
				graph.setNodeAttribute(node, "hidden", false);
			}

			if (isSelected) {
				graph.setNodeAttribute(node, "highlighted", true);
				graph.setNodeAttribute(node, "size", 15);
				graph.setNodeAttribute(node, "color", "#3b82f6");
			} else if (isHovered) {
				graph.setNodeAttribute(node, "size", 12);
			} else {
				graph.setNodeAttribute(node, "highlighted", false);
				graph.setNodeAttribute(node, "size", 10);
				// Restore original color
				const level = graph.getNodeAttribute(node, "level");
				const colorMap: Record<string, string> = {
					Awareness: "#10b981",
					Application: "#3b82f6",
					Mastery: "#8b5cf6",
					Influence: "#f59e0b",
				};
				graph.setNodeAttribute(node, "color", colorMap[level as string] || "#6b7280");
			}
		});

		// Update edge visibility
		graph.forEachEdge((edge, _attributes, source, target) => {
			// Show edge only if both nodes are visible
			const sourceVisible = selectedNodeIds.length === 0 || connectedNodes.has(source);
			const targetVisible = selectedNodeIds.length === 0 || connectedNodes.has(target);
			graph.setEdgeAttribute(edge, "hidden", !(sourceVisible && targetVisible));
		});
	}, [sigma, selectedNodeIds, hoveredNode]);

	return null;
};

const GraphLoader: React.FC<{ selectedCategories: string[]; graphData?: GraphData | null }> = ({
	selectedCategories,
	graphData,
}) => {
	const loadGraph = useLoadGraph();
	const { aiGeneratedGraphData } = useGraphStore();

	useEffect(() => {
		const graph = new Graph();

		// Priority: prop graphData > store aiGeneratedGraphData > static nodes.json
		const dataSource = graphData || aiGeneratedGraphData || nodesData;
		const allNodes = dataSource.nodes as NodeData[];

		// Add nodes to graph
		allNodes.forEach((node) => {
			const colorMap: Record<string, string> = {
				Awareness: "#10b981",
				Application: "#3b82f6",
				Mastery: "#8b5cf6",
				Influence: "#f59e0b",
			};

			graph.addNode(node.id, {
				label: node.properties.name,
				size: 10,
				color: colorMap[node.properties.level] || "#6b7280",
				x: Math.random() * 100,
				y: Math.random() * 100,
				level: node.properties.level,
				category: node.properties.category,
				source: node.properties.source,
			});
		});

		// Add relationships
		(dataSource.relationships as RelationshipData[]).forEach((rel) => {
			if (graph.hasNode(String(rel.start)) && graph.hasNode(String(rel.end))) {
				const source = String(rel.start);
				const target = String(rel.end);

				try {
					graph.addEdge(source, target, {
						type: "curved",
						label: rel.type,
						size: 1,
						color: "#94a3b8",
					});
				} catch {
					// Edge might already exist
				}
			}
		});

		loadGraph(graph);
	}, [loadGraph, selectedCategories, graphData, aiGeneratedGraphData]);

	return null;
};

const GraphControlsWrapper: React.FC = () => {
	return (
		<div className="absolute bottom-4 right-4 z-10">
			<GraphControls />
		</div>
	);
};

const ArcMenuWrapper: React.FC = () => {
	const { arcMenuState, setArcMenuState, handleSelectNode, selectedNodeIds, setSelectedNodeForDock } = useGraphStore();
	const [containerOffset, setContainerOffset] = React.useState({ left: 0, top: 0 });
	const containerRef = React.useRef<HTMLDivElement>(null);

	// Update container offset on mount and window resize
	React.useEffect(() => {
		const updateOffset = () => {
			if (containerRef.current) {
				const rect = containerRef.current.getBoundingClientRect();
				setContainerOffset({ left: rect.left, top: rect.top });
			}
		};

		updateOffset();
		window.addEventListener('resize', updateOffset);
		return () => window.removeEventListener('resize', updateOffset);
	}, []);

	if (!arcMenuState.isOpen || !arcMenuState.nodeId) return null;

	const isSelected = selectedNodeIds.includes(arcMenuState.nodeId);

	// Calculate position relative to container
	const relativeX = arcMenuState.position.x - containerOffset.left;
	const relativeY = arcMenuState.position.y - containerOffset.top;

	return (
		<div ref={containerRef} className="absolute inset-0 pointer-events-none">
			<ArcMenu
				position={{ x: relativeX, y: relativeY }}
				isSelected={isSelected}
				onSelect={() => {
					handleSelectNode(arcMenuState.nodeId!);
					setArcMenuState({ isOpen: false, nodeId: null, position: { x: 0, y: 0 } });
				}}
				onView={() => {
					setSelectedNodeForDock(arcMenuState.nodeId!);
					setArcMenuState({ isOpen: false, nodeId: null, position: { x: 0, y: 0 } });
				}}
				onClose={() => {
					setArcMenuState({ isOpen: false, nodeId: null, position: { x: 0, y: 0 } });
				}}
			/>
		</div>
	);
};

const NodeInfoDockWrapper: React.FC = () => {
	const { isDrawerOpen, selectedNodeForDock, setSelectedNodeForDock } = useGraphStore();

	return (
		<NodeInfoDock
			isOpen={isDrawerOpen}
			selectedNodeId={selectedNodeForDock}
			onClose={() => setSelectedNodeForDock(null)}
		/>
	);
};



export const SkillMapGraph: React.FC<SkillMapGraphProps> = ({ selectedCategories, graphData, isEmbedded = false, onNodeClick }) => {
	return (
		<div className="w-full h-full relative bg-gray-50">
			<SigmaContainer
				style={{ height: "100%", width: "100%" }}
				settings={{
					renderEdgeLabels: true,
					defaultNodeColor: "#6b7280",
					defaultEdgeColor: "#cbd5e1",
					defaultEdgeType: "arrow",
					labelFont: "Inter, sans-serif",
					labelSize: 12,
					labelWeight: "500",
					labelColor: { color: "#1f2937" },
					edgeLabelSize: 10,
					edgeLabelColor: { color: "#64748b" },
					edgeProgramClasses: {
						straight: EdgeArrowProgram,
						arrow: EdgeArrowProgram,
						curved: EdgeCurveProgram,
					},
				}}
			>
				<GraphThemeUpdater />
				<GraphLoader selectedCategories={selectedCategories} graphData={graphData} />
				<GraphEventsHandler onNodeClick={onNodeClick} />
				{!isEmbedded && <LeftDrawer />}
				<GraphControlsWrapper />
				{!isEmbedded && <NodeInfoDockWrapper />}

			</SigmaContainer>
			{!isEmbedded && <ArcMenuWrapper />}
		</div>
	);
};
