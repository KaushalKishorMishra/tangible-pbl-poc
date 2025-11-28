import { useState, useEffect } from "react";
import { useRegisterEvents, useSigma } from "@react-sigma/core";
import type { EdgeInfo, SelectedNodeState } from "../../types/node";

export const NodeInfoDock = () => {
    const sigma = useSigma();
    const registerEvents = useRegisterEvents();
    const [selectedNode, setSelectedNode] = useState<SelectedNodeState | null>(null);
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
            {/* Right Dock Panel */}
            <div
                className={`fixed top-4 right-4 bottom-4 w-96 bg-[#2c2c2c]/95 backdrop-blur-xl shadow-2xl z-50 transform transition-transform duration-300 ease-in-out rounded-2xl border border-[#444] overflow-hidden ${isOpen ? "translate-x-0" : "translate-x-[120%]"
                    }`}
            >
                {selectedNode && (
                    <div className="h-full flex flex-col">
                        {/* Header */}
                        <div className="bg-[#333] px-6 py-5 flex justify-between items-start border-b border-[#444]">
                            <div className="flex-1 pr-4">
                                <h2 className="text-xl font-bold text-white leading-tight">{selectedNode.label}</h2>
                                <p className="text-gray-400 text-xs mt-1 font-mono">ID: {selectedNode.id}</p>
                            </div>
                            <button
                                onClick={handleClose}
                                className="text-gray-400 hover:text-white hover:bg-[#444] rounded-lg p-1.5 transition-colors"
                                aria-label="Close"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                            {/* Node Properties */}
                            <div>
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Properties</h3>
                                <div className="grid gap-3">
                                    {Object.entries(selectedNode.attributes)
                                        .filter(([k]) => !["x", "y", "label", "color", "hidden"].includes(k))
                                        .map(([key, value]) => (
                                            <div key={key} className="flex flex-col bg-[#333] rounded-lg p-3 border border-[#444]">
                                                <span className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">{key}</span>
                                                <span className="text-sm text-[#e0e0e0] font-medium break-words">{String(value)}</span>
                                            </div>
                                        ))}
                                </div>
                            </div>

                            {/* Connections */}
                            <div>
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
                                    Connections ({selectedNode.edges.length})
                                </h3>

                                {selectedNode.edges.length === 0 ? (
                                    <div className="bg-[#333] rounded-lg p-8 text-center border border-[#444] border-dashed">
                                        <p className="text-gray-500 text-sm">No connections found</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {/* Outgoing Edges */}
                                        {selectedNode.edges.filter(e => e.direction === "out").length > 0 && (
                                            <div>
                                                <h4 className="text-xs font-bold text-[#0d99ff] uppercase mb-3 flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-[#0d99ff]"></div>
                                                    Outgoing ({selectedNode.edges.filter(e => e.direction === "out").length})
                                                </h4>
                                                <div className="space-y-2">
                                                    {selectedNode.edges.filter(e => e.direction === "out").map(edge => (
                                                        <div key={edge.id} className="bg-[#333] border border-[#444] rounded-lg p-3 hover:border-[#0d99ff]/50 transition-colors group">
                                                            <div className="flex items-start gap-3">
                                                                <div className="mt-1 p-1 bg-[#0d99ff]/10 rounded text-[#0d99ff]">
                                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                                    </svg>
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="font-medium text-[#e0e0e0] text-sm truncate">
                                                                        {sigma.getGraph().getNodeAttribute(edge.target, "label")}
                                                                    </div>
                                                                    <div className="text-xs text-gray-400 mt-0.5">{edge.label}</div>
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
                                                <h4 className="text-xs font-bold text-emerald-500 uppercase mb-3 flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                                    Incoming ({selectedNode.edges.filter(e => e.direction === "in").length})
                                                </h4>
                                                <div className="space-y-2">
                                                    {selectedNode.edges.filter(e => e.direction === "in").map(edge => (
                                                        <div key={edge.id} className="bg-[#333] border border-[#444] rounded-lg p-3 hover:border-emerald-500/50 transition-colors group">
                                                            <div className="flex items-start gap-3">
                                                                <div className="mt-1 p-1 bg-emerald-500/10 rounded text-emerald-500">
                                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                                                    </svg>
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="font-medium text-[#e0e0e0] text-sm truncate">
                                                                        {sigma.getGraph().getNodeAttribute(edge.source, "label")}
                                                                    </div>
                                                                    <div className="text-xs text-gray-400 mt-0.5">{edge.label}</div>
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
