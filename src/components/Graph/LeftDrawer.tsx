import { SearchControl } from"./SearchControl";
import { FilterControl } from"./FilterControl";
import { useGraphStore } from"../../store/graphStore";

export const LeftDrawer = () => {
  const { resetFilters, handleSelectNode, isLeftDrawerOpen, setIsLeftDrawerOpen } = useGraphStore();

  return (
    <>
      {/* Toggle Button - Visible when drawer is closed */}
      {!isLeftDrawerOpen && (
        <button
          onClick={() => setIsLeftDrawerOpen(true)}
          className="absolute top-4 left-4 z-40 bg-white p-2 rounded-lg shadow-md border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all"
          title="Open Controls"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      {isLeftDrawerOpen && (
        <div 
          className="absolute top-0 left-0 bottom-0 w-80 h-full bg-white border-r border-gray-200 flex flex-col shadow-xl z-40"
        >
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-start">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Graph Controls</h2>
            <p className="text-xs text-gray-500 mt-1">Search and filter nodes</p>
          </div>
          <button
            onClick={() => setIsLeftDrawerOpen(false)}
            className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded transition-colors"
            title="Close Drawer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-6">
          {/* Search Section */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Search</h3>
            <SearchControl onNodeSelect={handleSelectNode} />
          </div>

          <div className="h-px bg-gray-100" />

          {/* Filters Section */}
          <div>
            <FilterControl />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={resetFilters}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-400 transition-all shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Clear All Filters
          </button>
        </div>
      </div>
      )}
    </>
  );
};
