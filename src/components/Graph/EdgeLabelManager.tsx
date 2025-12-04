import { useEffect, useRef } from "react";
import { useSigma } from "@react-sigma/core";

interface EdgeLabelManagerProps {
    focusedNode: string | null;
    hoveredNode: string | null;
}

export const EdgeLabelManager = ({ focusedNode, hoveredNode }: EdgeLabelManagerProps) => {
    const sigma = useSigma();
    const originalLabels = useRef<Map<string, string>>(new Map());

    useEffect(() => {
        const graph = sigma.getGraph();
        
        // Store original labels on first run
        if (originalLabels.current.size === 0) {
            graph.forEachEdge((edge, attributes) => {
                if (attributes.label) {
                    originalLabels.current.set(edge, attributes.label as string);
                }
            });
        }
        
        // Show/hide labels based on focused or hovered nodes
        graph.forEachEdge((edge, _attributes, source, target) => {
            const shouldShowLabel = 
                focusedNode === source || 
                focusedNode === target ||
                hoveredNode === source ||
                hoveredNode === target;
            
            // Set label to original or empty string
            const originalLabel = originalLabels.current.get(edge) || "";
            graph.setEdgeAttribute(edge, "label", shouldShowLabel ? originalLabel : "");
        });
        
        sigma.refresh();
    }, [focusedNode, hoveredNode, sigma]);

    return null;
};
