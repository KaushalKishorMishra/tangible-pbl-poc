import { useState, useEffect } from "react";
import { useSigma } from "@react-sigma/core";
import filtersData from "../../data/filters.json";

type FilterState = {
    [key: string]: string[];
};

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
        <div className="bg-white rounded-md shadow-md border border-gray-300 overflow-hidden max-h-[80vh] flex flex-col">
            <div
                className="p-3 bg-gray-100 font-bold cursor-pointer flex justify-between items-center select-none"
                onClick={toggleExpand}
            >
                <span>Filters</span>
                <span>{isExpanded ? "▼" : "▶"}</span>
            </div>

            {isExpanded && (
                <div className="p-3 overflow-y-auto">
                    {/* Level Filter */}
                    <div className="mb-4">
                        <h4 className="font-semibold text-sm mb-2 text-gray-700">Level</h4>
                        <div className="flex flex-col gap-1">
                            {filtersData.level.map((item) => (
                                <label key={item} className="flex items-center gap-2 text-sm cursor-pointer text-gray-600 hover:text-black">
                                    <input
                                        type="checkbox"
                                        checked={selectedFilters.level.includes(item)}
                                        onChange={() => handleCheckboxChange("level", item)}
                                        className="rounded text-blue-600 focus:ring-blue-500"
                                    />
                                    {item}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Category Filter */}
                    <div className="mb-4">
                        <h4 className="font-semibold text-sm mb-2 text-gray-700">Category</h4>
                        <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
                            {filtersData.category.map((item) => (
                                <label key={item} className="flex items-center gap-2 text-sm cursor-pointer text-gray-600 hover:text-black">
                                    <input
                                        type="checkbox"
                                        checked={selectedFilters.category.includes(item)}
                                        onChange={() => handleCheckboxChange("category", item)}
                                        className="rounded text-blue-600 focus:ring-blue-500"
                                    />
                                    {item}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Source Filter */}
                    <div className="mb-4">
                        <h4 className="font-semibold text-sm mb-2 text-gray-700">Source</h4>
                        <div className="flex flex-col gap-1">
                            {filtersData.source.map((item) => (
                                <label key={item} className="flex items-center gap-2 text-sm cursor-pointer text-gray-600 hover:text-black">
                                    <input
                                        type="checkbox"
                                        checked={selectedFilters.source.includes(item)}
                                        onChange={() => handleCheckboxChange("source", item)}
                                        className="rounded text-blue-600 focus:ring-blue-500"
                                    />
                                    {item}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Relationship Type Filter */}
                    <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold text-sm text-gray-700">Relationship Type</h4>
                            {selectedFilters.relationshipType.length > 0 && (
                                <button
                                    onClick={() => setShowAllNodes(!showAllNodes)}
                                    className={`text-xs px-2 py-1 rounded transition-colors ${
                                        showAllNodes 
                                            ? "bg-blue-100 text-blue-700 hover:bg-blue-200" 
                                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                    }`}
                                    title={showAllNodes ? "Hide unrelated nodes" : "Show all nodes"}
                                >
                                    {showAllNodes ? (
                                        <span className="flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                            All
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                            </svg>
                                            Clean
                                        </span>
                                    )}
                                </button>
                            )}
                        </div>
                        <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
                            {filtersData.relationshipType.map((item) => (
                                <label key={item} className="flex items-center gap-2 text-sm cursor-pointer text-gray-600 hover:text-black">
                                    <input
                                        type="checkbox"
                                        checked={selectedFilters.relationshipType.includes(item)}
                                        onChange={() => handleCheckboxChange("relationshipType", item)}
                                        className="rounded text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-xs font-mono">{item}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Name Filter */}
                    <div className="mb-4">
                        <h4 className="font-semibold text-sm mb-2 text-gray-700">Name</h4>
                        <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
                            {filtersData.name.map((item) => (
                                <label key={item} className="flex items-center gap-2 text-sm cursor-pointer text-gray-600 hover:text-black">
                                    <input
                                        type="checkbox"
                                        checked={selectedFilters.name.includes(item)}
                                        onChange={() => handleCheckboxChange("name", item)}
                                        className="rounded text-blue-600 focus:ring-blue-500"
                                    />
                                    {item}
                                </label>
                            ))}
                        </div>
                    </div>

                    <button
                        className="text-xs text-blue-600 hover:underline mt-2"
                        onClick={() => setSelectedFilters({ level: [], category: [], source: [], name: [], relationshipType: [] })}
                    >
                        Clear All Filters
                    </button>
                </div>
            )}
        </div>
    );
};
