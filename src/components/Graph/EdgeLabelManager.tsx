import { useEffect, useRef } from "react";
import { useSigma } from "@react-sigma/core";
import { useGraphStore } from "../../store/graphStore";

export const EdgeLabelManager = () => {
    const sigma = useSigma();
    const originalLabels = useRef<Map<string, string>>(new Map());
    const isInitialized = useRef(false);
    
    // Get state from Zustand store
    const focusedNode = useGraphStore((state) => state.focusedNode);
    const hoveredNode = useGraphStore((state) => state.hoveredNode);

    // Initialize: Store original labels (runs once)
    useEffect(() => {
        if (!isInitialized.current) {
            const graph = sigma.getGraph();
            
            graph.forEachEdge((edge, attributes) => {
                // Store the original label from the custom attribute
                if (attributes.originalLabel) {
                    originalLabels.current.set(edge, attributes.originalLabel as string);
                }
            });
            
            isInitialized.current = true;
        }
    }, [sigma]);

    // Update: Show/hide labels based on focused or hovered nodes
    useEffect(() => {
        if (!isInitialized.current) return; // Don't run until initialized
        
        const graph = sigma.getGraph();
        
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
