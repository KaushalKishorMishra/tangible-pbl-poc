import { useState, useEffect } from "react";
import { useSigma } from "@react-sigma/core";
import { useCamera } from "@react-sigma/core";

export const SearchControl = () => {
    const sigma = useSigma();
    const { goto } = useCamera();
    const [search, setSearch] = useState("");
    const [values, setValues] = useState<Array<{ id: string; label: string }>>([]);
    const [suggestions, setSuggestions] = useState<Array<{ id: string; label: string }>>([]);

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
            goto({ x: nodePosition.x, y: nodePosition.y, ratio: 0.1 }, { duration: 1000 });
            setSearch("");
            setSuggestions([]);
        }
    };

    return (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
            <div className="flex items-center bg-[#2c2c2c] rounded-full border border-[#444] shadow-lg px-4 py-2 w-96 transition-all focus-within:border-[#0d99ff] focus-within:ring-1 focus-within:ring-[#0d99ff]/30">
                <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                    type="text"
                    placeholder="Search nodes..."
                    className="w-full bg-transparent outline-none text-[#e0e0e0] placeholder-gray-500 text-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                    <button
                        className="ml-2 text-gray-500 hover:text-[#e0e0e0] transition-colors"
                        onClick={() => setSearch("")}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>

            {suggestions.length > 0 && (
                <ul className="absolute bottom-full left-0 w-full bg-[#2c2c2c] border border-[#444] rounded-lg mb-2 max-h-60 overflow-y-auto shadow-xl">
                    {suggestions.map((item) => (
                        <li
                            key={item.id}
                            className="px-4 py-2 hover:bg-[#3a3a3a] cursor-pointer text-[#e0e0e0] text-sm border-b border-[#333] last:border-0 transition-colors"
                            onClick={() => handleSelect(item.id)}
                        >
                            {item.label}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};
