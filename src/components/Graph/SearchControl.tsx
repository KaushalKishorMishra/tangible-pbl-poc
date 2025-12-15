import { useEffect, useMemo } from"react";
import { useSigma } from"@react-sigma/core";
import { useCamera } from"@react-sigma/core";
import filtersData from"../../data/filters.json";

import { useGraphStore, type FilterCategory } from"../../store/graphStore";

interface SearchControlProps {
	onNodeSelect?: (nodeId: string) => void;
}

export const SearchControl = ({ onNodeSelect }: SearchControlProps) => {
	const sigma = useSigma();
	const { goto } = useCamera();
	
	const { 
		searchQuery, 
		searchSuggestions,
		filters,
		availableFilters,
		setSearchQuery,
		setSearchItems,
		clearSearch,
		selectSearchItem,
		setFilter
	} = useGraphStore();

	const activeFilters = useMemo(() => {
		return availableFilters || filtersData;
	}, [availableFilters]);

	// Initialize search items when graph or filters change
	useEffect(() => {
		const graph = sigma.getGraph();
		const items: Array<{
			id: string;
			label: string;
			type: FilterCategory;
			category: string;
		}> = [];

		// Add nodes (names)
		graph.mapNodes((id, attributes) => {
			items.push({
				id,
				label: attributes.label as string,
				type:"name",
				category:"Node"
			});
		});

		// Add levels
		activeFilters.level.forEach(level => {
			items.push({
				id: `level-${level}`,
				label: level,
				type:"level",
				category:"Level"
			});
		});

		// Add categories
		activeFilters.category.forEach(cat => {
			items.push({
				id: `category-${cat}`,
				label: cat,
				type:"category",
				category:"Category"
			});
		});

		// Add sources
		activeFilters.source.forEach(src => {
			items.push({
				id: `source-${src}`,
				label: src,
				type:"source",
				category:"Source"
			});
		});

		// Add relationship types
		activeFilters.relationshipType.forEach(rel => {
			items.push({
				id: `rel-${rel}`,
				label: rel,
				type:"relationshipType",
				category:"Relationship"
			});
		});

		setSearchItems(items);
	}, [sigma, activeFilters, setSearchItems]);

	const handleSelect = (item: typeof searchSuggestions[0]) => {
		if (item.type ==="name") {
			// Handle node selection - navigate to node
			const nodePosition = sigma.getNodeDisplayData(item.id);
			if (nodePosition) {
				goto(
					{ x: nodePosition.x, y: nodePosition.y, ratio: 0.5 },
					{ duration: 1000 }
				);
				
				if (onNodeSelect) {
					onNodeSelect(item.id);
				}
			}
		}
		
		// Use store action to handle selection
		selectSearchItem(item);
	};

	const getCategoryColor = (category: string) => {
		const colors: Record<string, string> = {
			"Node":"bg-blue-500",
			"Level":"bg-green-500",
			"Category":"bg-purple-500",
			"Source":"bg-orange-500",
			"Relationship":"bg-pink-500"
		};
		return colors[category] ||"bg-gray-500";
	};

	const getFilterColor = (type: FilterCategory) => {
		const colors: Record<FilterCategory, string> = {
			"name":"bg-blue-50 border-blue-200 text-blue-700",
			"level":"bg-green-50 border-green-200 text-green-700",
			"category":"bg-purple-50 border-purple-200 text-purple-700",
			"source":"bg-orange-50 border-orange-200 text-orange-700",
			"relationshipType":"bg-pink-50 border-pink-200 text-pink-700"
		};
		return colors[type] ||"bg-gray-50 border-gray-200 text-gray-700";
	};

	const getSelectedFilters = () => {
		const selected: Array<{ type: FilterCategory; value: string }> = [];
		
		(Object.keys(filters) as FilterCategory[]).forEach(type => {
			filters[type].forEach(value => {
				selected.push({ type, value });
			});
		});
		
		return selected;
	};

	const removeFilter = (type: FilterCategory, value: string) => {
		setFilter(type, value); // Toggle off
	};

	return (
		<div className="flex flex-col gap-3 w-full">
			<div className="relative w-full">
				<div className="flex items-center bg-white rounded-lg border-2 border-gray-200 px-3 py-2.5 w-full transition-all focus-within:border-[#0d99ff] focus-within:shadow-lg focus-within:shadow-[#0d99ff]/10">
					<svg
						className="w-5 h-5 text-gray-400 mr-2 shrink-0"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
						/>
					</svg>
					<input
						type="text"
						placeholder="Search nodes, filters, relationships..."
						className="w-full bg-transparent outline-none text-gray-900 placeholder-gray-400 text-sm"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
					{searchQuery && (
						<button
							className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
							onClick={clearSearch}
						>
							<svg
								className="w-4 h-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</button>
					)}
				</div>

				{searchSuggestions.length > 0 && (
					<ul className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-lg mt-2 max-h-80 overflow-y-auto shadow-2xl z-50">
						{searchSuggestions.map((item) => (
							<li
								key={item.id}
								className="px-3 py-2.5 hover:bg-gray-50 cursor-pointer text-gray-700 text-sm border-b border-gray-100 last:border-0 transition-colors flex items-center justify-between group"
								onClick={() => handleSelect(item)}
							>
								<span className="truncate">{item.label}</span>
								{item.category && (
									<span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-semibold text-white ${getCategoryColor(item.category)} shrink-0`}>
										{item.category}
									</span>
								)}
							</li>
						))}
					</ul>
				)}
			</div>

			{/* Selected Filters Pills */}
			{getSelectedFilters().length > 0 && (
				<div className="flex flex-wrap gap-2">
					{getSelectedFilters().map((filter) => (
						<div
							key={`${filter.type}-${filter.value}`}
							className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium animate-fadeIn ${getFilterColor(filter.type)}`}
						>
							<span className="truncate max-w-[150px]">
								{filter.value}
							</span>
							<button
								onClick={() => removeFilter(filter.type, filter.value)}
								className="ml-1 p-0.5 hover:bg-black/10 rounded-full transition-colors"
							>
								<svg
									className="w-3 h-3"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							</button>
						</div>
					))}
				</div>
			)}
		</div>
	);
};
