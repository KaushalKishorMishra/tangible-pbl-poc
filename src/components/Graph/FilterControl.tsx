import { useEffect, useState, useMemo } from"react";
import { useSigma } from"@react-sigma/core";
import filtersData from"../../data/filters.json";
import { useGraphStore } from"../../store/graphStore";

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

    // If name filter is active, show connected nodes (same as search behavior)
    if (filters.name.length > 0) {
      const selectedNodeIds = new Set<string>();
      const connectedNodes = new Set<string>();

      // Find selected nodes and their connections
      graph.forEachNode((nodeId, attributes) => {
        if (filters.name.includes(attributes.label as string)) {
          selectedNodeIds.add(nodeId);
          connectedNodes.add(nodeId);

          // Add all connected nodes
          graph.forEachNeighbor(nodeId, (neighbor) => {
            connectedNodes.add(neighbor);
          });
        }
      });

      // Show only selected nodes and their connections
      graph.forEachNode((nodeId) => {
        graph.setNodeAttribute(nodeId,"hidden", !connectedNodes.has(nodeId));
      });

      // Show edges between visible nodes
      graph.forEachEdge((edge) => {
        const [source, target] = graph.extremities(edge);
        const isVisible = connectedNodes.has(source) && connectedNodes.has(target);
        graph.setEdgeAttribute(edge,"hidden", !isVisible);
      });

      return; // Skip other filters when name filter is active
    }

    // Normal filtering (when name filter is not active)
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

      graph.setNodeAttribute(node,"hidden", !isVisible);
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

      graph.setEdgeAttribute(edge,"hidden", !isVisible);

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
          graph.setNodeAttribute(node,"hidden", true);
        }
      });
    }
  }, [filters, showAllNodes, sigma]);

  const handleToggle = (category: string | number, value: string | number) => {
    setFilter(String(category), String(value));
  };

  const renderFilterSection = (
    title: string,
    category: keyof typeof filters,
    options: (string | number)[]
  ) => (
    <div className="mb-5">
      <h4 className="font-medium text-xs uppercase tracking-wider mb-3 text-gray-500">{title}</h4>

      <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
        {options.map((item) => {
          const itemStr = String(item);
          const isSelected = filters[category].includes(itemStr);
          return (
            <button
              key={item}
              onClick={() => handleToggle(category, item)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                isSelected
                  ?"bg-[#0d99ff] text-white shadow-md hover:bg-[#0b87e0]"
                  :"bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
              }`}
            >
              {item}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="w-full">
      {/* Level Filter */}
      {renderFilterSection("Level","level", activeFilters.level)}

      {/* Category Filter */}
      {renderFilterSection("Category","category", activeFilters.category)}

      {/* Source Filter */}
      {renderFilterSection("Source","source", activeFilters.source)}

      {/* Relationship Type Filter */}
      <div className="mb-5">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-medium text-xs uppercase tracking-wider text-gray-500">Relationships</h4>
          {filters.relationshipType.length > 0 && (
            <button
              onClick={() => setShowAllNodes(!showAllNodes)}
              className={`text-[10px] px-2 py-0.5 rounded-full transition-all duration-200 uppercase font-bold tracking-wide ${
                showAllNodes
                  ?"bg-[#0d99ff] text-white shadow-sm"
                  :"bg-gray-200 text-gray-600 hover:bg-gray-300"
              }`}
              title={showAllNodes ?"Hide unrelated nodes" :"Show all nodes"}
            >
              {showAllNodes ?"Show All" :"Clean"}
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
          {activeFilters.relationshipType.map((item) => {
            const isSelected = filters.relationshipType.includes(item);
            return (
              <button
                key={item}
                onClick={() => handleToggle("relationshipType", item)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium font-mono transition-all duration-200 ${
                  isSelected
                    ?"bg-[#0d99ff] text-white shadow-md hover:bg-[#0b87e0]"
                    :"bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>

      {/* Name Filter */}
      {renderFilterSection("Nodes","name", activeFilters.name)}
    </div>
  );
};
