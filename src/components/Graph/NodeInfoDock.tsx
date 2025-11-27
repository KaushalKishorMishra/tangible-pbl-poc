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

type SelectedNodeState = {
    id: string;
    label: string;
    edges: EdgeInfo[];
    attributes: Attributes;
} | null;

export const NodeInfoDock = () => {
    const sigma = useSigma();
    const registerEvents = useRegisterEvents();
    const [selectedNode, setSelectedNode] = useState<SelectedNodeState>(null);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        registerEvents({
            clickNode: (event) => {
                const nodeId = event.node;
                const graph = sigma.getGraph();
                const nodeAttributes = graph.getNodeAttributes(nodeId);
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

                setSelectedNode({
                    id: nodeId,
                    label: nodeLabel as string,
                    edges: edges,
                    attributes: nodeAttributes,
                });
                setIsOpen(true);
            },
        });
    }, [registerEvents, sigma]);

    const handleClose = () => {
        setIsOpen(false);
        setTimeout(() => setSelectedNode(null), 300); // Delay to allow animation
    };

    return (
        <>
            {/* Overlay backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300"
                    onClick={handleClose}
                />
            )}

            {/* Right Dock Panel */}
            <div
                className={`fixed top-0 right-0 h-full w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
                    isOpen ? "translate-x-0" : "translate-x-full"
                }`}
            >
                {selectedNode && (
                    <div className="h-full flex flex-col">
                        {/* Header */}
                        <div className="bg-linear-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 flex justify-between items-center">
                            <div className="flex-1">
                                <h2 className="text-xl font-bold truncate">{selectedNode.label}</h2>
                                <p className="text-blue-100 text-xs mt-1">Node ID: {selectedNode.id}</p>
                            </div>
                            <button
                                onClick={handleClose}
                                className="ml-4 text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                                aria-label="Close"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Node Properties */}
                            <div>
                                <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-3">Node Properties</h3>
                                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                                    {Object.entries(selectedNode.attributes)
                                        .filter(([k]) => !["x", "y", "label", "color"].includes(k))
                                        .map(([key, value]) => (
                                            <div key={key} className="flex justify-between items-start text-sm">
                                                <span className="font-medium text-gray-700 capitalize">{key}:</span>
                                                <span className="text-gray-900 font-semibold text-right ml-2">{String(value)}</span>
                                            </div>
                                        ))}
                                </div>
                            </div>

                            {/* Connections */}
                            <div>
                                <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-3">
                                    Connections ({selectedNode.edges.length})
                                </h3>

                                {selectedNode.edges.length === 0 ? (
                                    <div className="bg-gray-50 rounded-lg p-8 text-center">
                                        <svg className="w-12 h-12 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                        <p className="text-gray-500 italic text-sm">No connections</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {/* Outgoing Edges */}
                                        {selectedNode.edges.filter(e => e.direction === "out").length > 0 && (
                                            <div>
                                                <h4 className="text-xs font-bold text-blue-600 uppercase mb-2 flex items-center gap-2">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                    </svg>
                                                    Outgoing ({selectedNode.edges.filter(e => e.direction === "out").length})
                                                </h4>
                                                <div className="space-y-2">
                                                    {selectedNode.edges.filter(e => e.direction === "out").map(edge => (
                                                        <div key={edge.id} className="bg-blue-50 border border-blue-200 rounded-lg p-3 hover:bg-blue-100 transition-colors">
                                                            <div className="flex items-start gap-2">
                                                                <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                                </svg>
                                                                <div className="flex-1">
                                                                    <div className="font-semibold text-gray-900 text-sm">
                                                                        {sigma.getGraph().getNodeAttribute(edge.target, "label")}
                                                                    </div>
                                                                    <div className="text-xs text-blue-700 font-medium mt-1">{edge.label}</div>
                                                                    {Object.entries(edge.properties)
                                                                        .filter(([k]) => !["type", "label", "size", "color", "curvature", "parallelIndex", "parallelMaxIndex"].includes(k))
                                                                        .length > 0 && (
                                                                        <div className="text-[10px] text-gray-600 mt-2 space-y-0.5">
                                                                            {Object.entries(edge.properties)
                                                                                .filter(([k]) => !["type", "label", "size", "color", "curvature", "parallelIndex", "parallelMaxIndex"].includes(k))
                                                                                .map(([k, v]) => (
                                                                                    <div key={k}>
                                                                                        <span className="font-medium">{k}:</span> {String(v)}
                                                                                    </div>
                                                                                ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Incoming Edges */}
                                        {selectedNode.edges.filter(e => e.direction === "in").length > 0 && (
                                            <div>
                                                <h4 className="text-xs font-bold text-green-600 uppercase mb-2 flex items-center gap-2">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                                                    </svg>
                                                    Incoming ({selectedNode.edges.filter(e => e.direction === "in").length})
                                                </h4>
                                                <div className="space-y-2">
                                                    {selectedNode.edges.filter(e => e.direction === "in").map(edge => (
                                                        <div key={edge.id} className="bg-green-50 border border-green-200 rounded-lg p-3 hover:bg-green-100 transition-colors">
                                                            <div className="flex items-start gap-2">
                                                                <svg className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                                </svg>
                                                                <div className="flex-1">
                                                                    <div className="font-semibold text-gray-900 text-sm">
                                                                        {sigma.getGraph().getNodeAttribute(edge.source, "label")}
                                                                    </div>
                                                                    <div className="text-xs text-green-700 font-medium mt-1">{edge.label}</div>
                                                                    {Object.entries(edge.properties)
                                                                        .filter(([k]) => !["type", "label", "size", "color", "curvature", "parallelIndex", "parallelMaxIndex"].includes(k))
                                                                        .length > 0 && (
                                                                        <div className="text-[10px] text-gray-600 mt-2 space-y-0.5">
                                                                            {Object.entries(edge.properties)
                                                                                .filter(([k]) => !["type", "label", "size", "color", "curvature", "parallelIndex", "parallelMaxIndex"].includes(k))
                                                                                .map(([k, v]) => (
                                                                                    <div key={k}>
                                                                                        <span className="font-medium">{k}:</span> {String(v)}
                                                                                    </div>
                                                                                ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};
