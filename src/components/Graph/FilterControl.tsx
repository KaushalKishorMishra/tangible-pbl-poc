import { useEffect, useState, useMemo } from "react";
import { useSigma } from "@react-sigma/core";
import filtersData from "../../data/filters.json";
import { useGraphStore } from "../../store/graphStore";

export const FilterControl = () => {
    const sigma = useSigma();
    const { filters, setFilter, availableFilters } = useGraphStore();
    const [showAllNodes, setShowAllNodes] = useState(false);

    // Use AI-generated filters if available, otherwise fall back to static filters
    const activeFilters = useMemo(() => {
        return availableFilters || filtersData;
    }, [availableFilters]);

    // Apply filters whenever selection changes
    useEffect(() => {
        const graph = sigma.getGraph();

        // First, filter nodes by their attributes (not relationship-based)
        graph.forEachNode((node, attributes) => {
            let isVisible = true;

            // Check each filter category
            if (filters.level.length > 0) {
                if (!filters.level.includes(attributes.level as string)) {
                    isVisible = false;
                }
            }

            if (isVisible && filters.category.length > 0) {
                if (!filters.category.includes(attributes.category as string)) {
                    isVisible = false;
                }
            }

            if (isVisible && filters.source.length > 0) {
                if (!filters.source.includes(attributes.source as string)) {
                    isVisible = false;
                }
            }

            if (isVisible && filters.name.length > 0) {
                if (!filters.name.includes(attributes.label as string)) {
                    isVisible = false;
                }
            }

            graph.setNodeAttribute(node, "hidden", !isVisible);
        });

        // Filter edges by relationship type and collect connected nodes
        const connectedNodes = new Set<string>();

        graph.forEachEdge((edge, attributes) => {
            let isVisible = true;

            if (filters.relationshipType.length > 0) {
                if (!filters.relationshipType.includes(attributes.label as string)) {
                    isVisible = false;
                }
            }

            graph.setEdgeAttribute(edge, "hidden", !isVisible);

            // If edge is visible and relationship filter is active, collect connected nodes
            if (isVisible && filters.relationshipType.length > 0) {
                const [source, target] = graph.extremities(edge);
                connectedNodes.add(source);
                connectedNodes.add(target);
            }
        });

        // Hide non-connected nodes when relationship filter is active and showAllNodes is false
        if (filters.relationshipType.length > 0 && !showAllNodes) {
            graph.forEachNode((node) => {
                if (!connectedNodes.has(node)) {
                    graph.setNodeAttribute(node, "hidden", true);
                }
            });
        }
    }, [filters, showAllNodes, sigma]);

    const handleCheckboxChange = (category: string, value: string) => {
        setFilter(category, value);
    };

    return (
        <div className="w-full">
            {/* Level Filter */}
            <div className="mb-5">
                <h4 className="font-medium text-xs uppercase tracking-wider mb-3 text-gray-500">Level</h4>
                <div className="flex flex-col gap-2">
                    {activeFilters.level.map((item) => (
                        <label key={item} className="flex items-center gap-3 text-sm cursor-pointer text-gray-700 hover:text-gray-900 group">
                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${filters.level.includes(item) ? "bg-[#0d99ff] border-[#0d99ff]" : "border-gray-300 group-hover:border-gray-400"}`}>
                                {filters.level.includes(item) && (
                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                )}
                            </div>
                            <input
                                type="checkbox"
                                checked={filters.level.includes(item)}
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
                <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                    {activeFilters.category.map((item) => (
                        <label key={item} className="flex items-center gap-3 text-sm cursor-pointer text-gray-700 hover:text-gray-900 group">
                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${filters.category.includes(item) ? "bg-[#0d99ff] border-[#0d99ff]" : "border-gray-300 group-hover:border-gray-400"}`}>
                                {filters.category.includes(item) && (
                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                )}
                            </div>
                            <input
                                type="checkbox"
                                checked={filters.category.includes(item)}
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
                    {activeFilters.source.map((item) => (
                        <label key={item} className="flex items-center gap-3 text-sm cursor-pointer text-gray-700 hover:text-gray-900 group">
                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${filters.source.includes(item) ? "bg-[#0d99ff] border-[#0d99ff]" : "border-gray-300 group-hover:border-gray-400"}`}>
                                {filters.source.includes(item) && (
                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                )}
                            </div>
                            <input
                                type="checkbox"
                                checked={filters.source.includes(item)}
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
                    {filters.relationshipType.length > 0 && (
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
                <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                    {activeFilters.relationshipType.map((item) => (
                        <label key={item} className="flex items-center gap-3 text-sm cursor-pointer text-gray-700 hover:text-gray-900 group">
                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${filters.relationshipType.includes(item) ? "bg-[#0d99ff] border-[#0d99ff]" : "border-gray-300 group-hover:border-gray-400"}`}>
                                {filters.relationshipType.includes(item) && (
                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                )}
                            </div>
                            <input
                                type="checkbox"
                                checked={filters.relationshipType.includes(item)}
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
                <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                    {activeFilters.name.map((item) => (
                        <label key={item} className="flex items-center gap-3 text-sm cursor-pointer text-gray-700 hover:text-gray-900 group">
                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${filters.name.includes(item) ? "bg-[#0d99ff] border-[#0d99ff]" : "border-gray-300 group-hover:border-gray-400"}`}>
                                {filters.name.includes(item) && (
                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                )}
                            </div>
                            <input
                                type="checkbox"
                                checked={filters.name.includes(item)}
                                onChange={() => handleCheckboxChange("name", item)}
                                className="hidden"
                            />
                            {item}
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );
};
