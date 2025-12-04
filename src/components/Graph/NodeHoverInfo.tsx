import { useState, useEffect } from "react";
import { useRegisterEvents, useSigma } from "@react-sigma/core";
import type { Attributes } from "graphology-types";

type EdgeInfo = {
    id: string;
    target: string;
    source: string;
    label: string;
    properties: Attributes;
    direction: "in" | "out";
};

type HoveredNodeState = {
    id: string;
    label: string;
    edges: EdgeInfo[];
} | null;

interface NodeHoverInfoProps {
    onViewDetails: (nodeId: string) => void;
    onSelectNode: (nodeId: string) => void;
}

export const NodeHoverInfo = ({ onViewDetails, onSelectNode }: NodeHoverInfoProps) => {
    const sigma = useSigma();
    const registerEvents = useRegisterEvents();
    const [hoveredNode, setHoveredNode] = useState<HoveredNodeState>(null);
    const [isInteracting, setIsInteracting] = useState(false);

    useEffect(() => {
        registerEvents({
            enterNode: (event) => {
                const nodeId = event.node;
                const graph = sigma.getGraph();
                const nodeLabel = graph.getNodeAttribute(nodeId, "label");

                const edges: EdgeInfo[] = [];

                // Outgoing edges
                graph.forEachOutEdge(nodeId, (edge, attributes, source, target) => {
                    edges.push({
                        id: edge,
                        source: source,
                        target: target,
                        label: attributes.label as string,
                        properties: attributes,
                        direction: "out",
                    });
                });

                // Incoming edges
                graph.forEachInEdge(nodeId, (edge, attributes, source, target) => {
                    edges.push({
                        id: edge,
                        source: source,
                        target: target,
                        label: attributes.label as string,
                        properties: attributes,
                        direction: "in",
                    });
                });

                setHoveredNode({
                    id: nodeId,
                    label: nodeLabel as string,
                    edges: edges,
                });
            },
            leaveNode: () => {
                // Delay hiding to allow moving mouse to tooltip
                setTimeout(() => {
                    setHoveredNode((current) => {
                        if (isInteracting) return current;
                        return null;
                    });
                }, 100);
            },
        });
    }, [registerEvents, sigma, isInteracting]);

    if (!hoveredNode) return null;

    return (
        <div 
            className="absolute top-4 right-4 bg-white p-4 rounded-md shadow-lg border border-gray-300 max-w-sm z-50 pointer-events-auto"
            onMouseEnter={() => setIsInteracting(true)}
            onMouseLeave={() => {
                setIsInteracting(false);
                setHoveredNode(null);
            }}
        >
            <div className="flex justify-between items-center mb-2 border-b pb-2">
                <h3 className="font-bold text-lg text-blue-600">{hoveredNode.label}</h3>
                <div className="flex gap-2">
                    <button 
                        onClick={() => onSelectNode(hoveredNode.id)}
                        className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded transition-colors"
                    >
                        Select
                    </button>
                    <button 
                        onClick={() => onViewDetails(hoveredNode.id)}
                        className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 px-2 py-1 rounded transition-colors"
                    >
                        View
                    </button>
                </div>
            </div>

            {hoveredNode.edges.length === 0 ? (
                <p className="text-gray-500 italic text-sm">No connections</p>
            ) : (
                <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {/* Outgoing */}
                    {hoveredNode.edges.filter(e => e.direction === "out").length > 0 && (
                        <div>
                            <h4 className="text-xs font-bold text-blue-600 uppercase mb-1">Outgoing (→)</h4>
                            <ul className="text-sm flex flex-col gap-1">
                                {hoveredNode.edges.filter(e => e.direction === "out").map(edge => (
                                    <li key={edge.id} className="bg-blue-50 p-2 rounded border border-blue-100">
                                        <div className="font-semibold text-gray-900">→ {sigma.getGraph().getNodeAttribute(edge.target, "label")}</div>
                                        <div className="text-xs text-gray-600">{edge.label}</div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Incoming */}
                    {hoveredNode.edges.filter(e => e.direction === "in").length > 0 && (
                        <div>
                            <h4 className="text-xs font-bold text-green-600 uppercase mb-1">Incoming (←)</h4>
                            <ul className="text-sm flex flex-col gap-1">
                                {hoveredNode.edges.filter(e => e.direction === "in").map(edge => (
                                    <li key={edge.id} className="bg-green-50 p-2 rounded border border-green-100">
                                        <div className="font-semibold text-gray-900">← {sigma.getGraph().getNodeAttribute(edge.source, "label")}</div>
                                        <div className="text-xs text-gray-600">{edge.label}</div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
