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
        <div className="relative">
            <div className="flex items-center bg-white rounded-md border border-gray-300 overflow-hidden w-64">
                <input
                    type="text"
                    placeholder="Search nodes..."
                    className="w-full px-3 py-2 outline-none text-black"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                    <button
                        className="px-2 text-gray-500 hover:text-gray-700"
                        onClick={() => setSearch("")}
                    >
                        ✕
                    </button>
                )}
            </div>

            {suggestions.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
                    {suggestions.map((item) => (
                        <li
                            key={item.id}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-black text-sm"
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
