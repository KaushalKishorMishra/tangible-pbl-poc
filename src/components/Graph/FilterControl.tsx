import { useState, useEffect } from "react";
import { useSigma } from "@react-sigma/core";
import filtersData from "../../data/filters.json";
import type { FilterState } from "../../types/filter";

export const FilterControl = () => {
    const sigma = useSigma();
    const [selectedFilters, setSelectedFilters] = useState<FilterState>({
        level: [],
        category: [],
        source: [],
        name: [],
        relationshipType: [],
    });

    const [isExpanded, setIsExpanded] = useState(false);
    const [showAllNodes, setShowAllNodes] = useState(false);

    // Apply filters whenever selection changes
    useEffect(() => {
        const graph = sigma.getGraph();

        // First, filter nodes by their attributes (not relationship-based)
        graph.forEachNode((node, attributes) => {
            let isVisible = true;

            // Check each filter category
            // If a category has selected items, the node must match one of them (OR logic within category)
            // AND logic across categories (must match Level AND Category if both are active)

            if (selectedFilters.level.length > 0) {
                if (!selectedFilters.level.includes(attributes.level as string)) {
                    isVisible = false;
                }
            }

            if (isVisible && selectedFilters.category.length > 0) {
                if (!selectedFilters.category.includes(attributes.category as string)) {
                    isVisible = false;
                }
            }

            if (isVisible && selectedFilters.source.length > 0) {
                if (!selectedFilters.source.includes(attributes.source as string)) {
                    isVisible = false;
                }
            }

            if (isVisible && selectedFilters.name.length > 0) {
                if (!selectedFilters.name.includes(attributes.label as string)) {
                    isVisible = false;
                }
            }

            graph.setNodeAttribute(node, "hidden", !isVisible);
        });

        // Filter edges by relationship type and collect connected nodes
        const connectedNodes = new Set<string>();

        graph.forEachEdge((edge, attributes) => {
            let isVisible = true;

            if (selectedFilters.relationshipType.length > 0) {
                if (!selectedFilters.relationshipType.includes(attributes.label as string)) {
                    isVisible = false;
                }
            }

            graph.setEdgeAttribute(edge, "hidden", !isVisible);

            // If edge is visible and relationship filter is active, collect connected nodes
            if (isVisible && selectedFilters.relationshipType.length > 0) {
                const [source, target] = graph.extremities(edge);
                connectedNodes.add(source);
                connectedNodes.add(target);
            }
        });

        // Hide non-connected nodes when relationship filter is active and showAllNodes is false
        if (selectedFilters.relationshipType.length > 0 && !showAllNodes) {
            graph.forEachNode((node) => {
                if (!connectedNodes.has(node)) {
                    graph.setNodeAttribute(node, "hidden", true);
                }
            });
        }
    }, [selectedFilters, showAllNodes, sigma]);

    const handleCheckboxChange = (category: string, value: string) => {
        setSelectedFilters((prev) => {
            const currentValues = prev[category] || [];
            const newValues = currentValues.includes(value)
                ? currentValues.filter((v) => v !== value)
                : [...currentValues, value];

            return { ...prev, [category]: newValues };
        });
    };

    const toggleExpand = () => setIsExpanded(!isExpanded);

    return (
        <div className="bg-white rounded-lg shadow-xl overflow-hidden max-h-[70vh] flex flex-col w-64 transition-all duration-300">
            <div
                className="p-3 bg-white font-semibold cursor-pointer flex justify-between items-center select-none transition-colors"
                onClick={toggleExpand}
            >
                <span className="text-sm tracking-wide text-black">FILTERS</span>
                <span className="text-xs text-black">{isExpanded ? "▼" : "▶"}</span>
            </div>

            {isExpanded && (
                <div className="p-4 overflow-y-auto custom-scrollbar">
                    {/* Level Filter */}
                    <div className="mb-5">
                        <h4 className="font-medium text-xs uppercase tracking-wider mb-3 text-gray-500">Level</h4>
                        <div className="flex flex-col gap-2">
                            {filtersData.level.map((item) => (
                                <label key={item} className="flex items-center gap-3 text-sm cursor-pointer text-[#e0e0e0] hover:text-white group">
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedFilters.level.includes(item) ? "bg-[#0d99ff] border-[#0d99ff]" : "border-gray-600 group-hover:border-gray-500"}`}>
                                        {selectedFilters.level.includes(item) && (
                                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                        )}
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={selectedFilters.level.includes(item)}
                                        onChange={() => handleCheckboxChange("level", item)}
                                        className="hidden"
                                    />
                                    {item}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Category Filter */}
                    <div className="mb-5">
                        <h4 className="font-medium text-xs uppercase tracking-wider mb-3 text-gray-500">Category</h4>
                        <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-2">
                            {filtersData.category.map((item) => (
                                <label key={item} className="flex items-center gap-3 text-sm cursor-pointer text-[#e0e0e0] hover:text-white group">
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedFilters.category.includes(item) ? "bg-[#0d99ff] border-[#0d99ff]" : "border-gray-600 group-hover:border-gray-500"}`}>
                                        {selectedFilters.category.includes(item) && (
                                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                        )}
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={selectedFilters.category.includes(item)}
                                        onChange={() => handleCheckboxChange("category", item)}
                                        className="hidden"
                                    />
                                    {item}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Source Filter */}
                    <div className="mb-5">
                        <h4 className="font-medium text-xs uppercase tracking-wider mb-3 text-gray-500">Source</h4>
                        <div className="flex flex-col gap-2">
                            {filtersData.source.map((item) => (
                                <label key={item} className="flex items-center gap-3 text-sm cursor-pointer text-[#e0e0e0] hover:text-white group">
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedFilters.source.includes(item) ? "bg-[#0d99ff] border-[#0d99ff]" : "border-gray-600 group-hover:border-gray-500"}`}>
                                        {selectedFilters.source.includes(item) && (
                                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                        )}
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={selectedFilters.source.includes(item)}
                                        onChange={() => handleCheckboxChange("source", item)}
                                        className="hidden"
                                    />
                                    {item}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Relationship Type Filter */}
                    <div className="mb-5">
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="font-medium text-xs uppercase tracking-wider text-gray-500">Relationships</h4>
                            {selectedFilters.relationshipType.length > 0 && (
                                <button
                                    onClick={() => setShowAllNodes(!showAllNodes)}
                                    className={`text-[10px] px-2 py-0.5 rounded transition-colors uppercase font-bold tracking-wide ${showAllNodes
                                        ? "bg-[#0d99ff]/20 text-[#0d99ff] hover:bg-[#0d99ff]/30"
                                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                        }`}
                                    title={showAllNodes ? "Hide unrelated nodes" : "Show all nodes"}
                                >
                                    {showAllNodes ? "Show All" : "Clean View"}
                                </button>
                            )}
                        </div>
                        <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-2">
                            {filtersData.relationshipType.map((item) => (
                                <label key={item} className="flex items-center gap-3 text-sm cursor-pointer text-[#e0e0e0] hover:text-white group">
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedFilters.relationshipType.includes(item) ? "bg-[#0d99ff] border-[#0d99ff]" : "border-gray-600 group-hover:border-gray-500"}`}>
                                        {selectedFilters.relationshipType.includes(item) && (
                                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                        )}
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={selectedFilters.relationshipType.includes(item)}
                                        onChange={() => handleCheckboxChange("relationshipType", item)}
                                        className="hidden"
                                    />
                                    <span className="font-mono text-xs opacity-80">{item}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Name Filter */}
                    <div className="mb-4">
                        <h4 className="font-medium text-xs uppercase tracking-wider mb-3 text-gray-500">Name</h4>
                        <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-2">
                            {filtersData.name.map((item) => (
                                <label key={item} className="flex items-center gap-3 text-sm cursor-pointer text-[#e0e0e0] hover:text-white group">
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedFilters.name.includes(item) ? "bg-[#0d99ff] border-[#0d99ff]" : "border-gray-600 group-hover:border-gray-500"}`}>
                                        {selectedFilters.name.includes(item) && (
                                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                        )}
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={selectedFilters.name.includes(item)}
                                        onChange={() => handleCheckboxChange("name", item)}
                                        className="hidden"
                                    />
                                    {item}
                                </label>
                            ))}
                        </div>
                    </div>

                    <button
                        className="w-full py-2 text-xs font-medium text-[#0d99ff] hover:bg-[#0d99ff]/10 rounded transition-colors mt-2"
                        onClick={() => setSelectedFilters({ level: [], category: [], source: [], name: [], relationshipType: [] })}
                    >
                        Reset All Filters
                    </button>
                </div>
            )}
        </div>
    );
};
