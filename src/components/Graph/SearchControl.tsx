import { useState, useEffect } from "react";
import { useSigma } from "@react-sigma/core";
import { useCamera } from "@react-sigma/core";

import { useGraphStore } from "../../store/graphStore";

interface SearchControlProps {
    onNodeSelect?: (nodeId: string) => void;
}

export const SearchControl = ({ onNodeSelect }: SearchControlProps) => {
    const sigma = useSigma();
    const { goto } = useCamera();
    const [search, setSearch] = useState("");
    const [values, setValues] = useState<Array<{ id: string; label: string }>>([]);
    const [suggestions, setSuggestions] = useState<Array<{ id: string; label: string }>>([]);
    
    const { selectedNodeIds, removeNodeSelection } = useGraphStore();

    // Load all nodes on mount
    useEffect(() => {
        const graph = sigma.getGraph();
        const nodes = graph.mapNodes((id, attributes) => ({
            id,
            label: attributes.label as string,
        }));
        setValues(nodes);
    }, [sigma]);

    // Filter suggestions based on search
    useEffect(() => {
        if (!search) {
            setSuggestions([]);
            return;
        }
        const filtered = values.filter((v) =>
            v.label.toLowerCase().includes(search.toLowerCase())
        );
        setSuggestions(filtered);
    }, [search, values]);

    const handleSelect = (nodeId: string) => {
        const nodePosition = sigma.getNodeDisplayData(nodeId);
        if (nodePosition) {
            goto({ x: nodePosition.x, y: nodePosition.y, ratio: 0.5 }, { duration: 1000 }); // Less zoom (0.5 instead of 0.1)
            setSearch("");
            setSuggestions([]);
            // Trigger the same highlighting as selecting a node
            if (onNodeSelect) {
                onNodeSelect(nodeId);
            }
        }
    };

    const getNodeLabel = (nodeId: string) => {
        try {
            return sigma.getGraph().getNodeAttribute(nodeId, "label");
        } catch (e) {
            return nodeId;
        }
    };

    return (
        <div className="flex flex-col gap-3 w-full">
            <div className="relative w-full">
                <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200 px-3 py-2 w-full transition-all focus-within:border-[#0d99ff] focus-within:ring-1 focus-within:ring-[#0d99ff]/30">
                    <svg className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search nodes..."
                        className="w-full bg-transparent outline-none text-gray-900 placeholder-gray-500 text-sm"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    {search && (
                        <button
                            className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
                            onClick={() => setSearch("")}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>

                {suggestions.length > 0 && (
                    <ul className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-lg mt-1 max-h-60 overflow-y-auto shadow-xl z-50">
                        {suggestions.map((item) => (
                            <li
                                key={item.id}
                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-gray-700 text-sm border-b border-gray-100 last:border-0 transition-colors"
                                onClick={() => handleSelect(item.id)}
                            >
                                {item.label}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Selected Node Pills */}
            {selectedNodeIds.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {selectedNodeIds.map((nodeId) => (
                        <div 
                            key={nodeId}
                            className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-md border border-blue-100 text-xs text-blue-700 animate-fadeIn"
                        >
                            <span className="font-medium truncate max-w-[150px]">{getNodeLabel(nodeId)}</span>
                            <button
                                onClick={() => removeNodeSelection(nodeId)}
                                className="ml-1 p-0.5 hover:bg-blue-100 rounded-full text-blue-400 hover:text-blue-600 transition-colors"
                            >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
