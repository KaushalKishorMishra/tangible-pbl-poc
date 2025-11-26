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
    });

    const [isExpanded, setIsExpanded] = useState(false);

    // Apply filters whenever selection changes
    useEffect(() => {
        const graph = sigma.getGraph();

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
    }, [selectedFilters, sigma]);

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
                        onClick={() => setSelectedFilters({ level: [], category: [], source: [], name: [] })}
                    >
                        Clear All Filters
                    </button>
                </div>
            )}
        </div>
    );
};
