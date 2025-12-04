import { type FC } from "react";
import { SigmaContainer } from "@react-sigma/core";
import "@react-sigma/core/lib/style.css";
import { MultiDirectedGraph } from "graphology";
import { DirectedGraph, UndirectedGraph } from "graphology";
import EdgeCurveProgram from "@sigma/edge-curve";
import { EdgeArrowProgram } from "sigma/rendering";
import type { GraphContainerProps } from "../../types/components";

export const GraphContainer: FC<GraphContainerProps & { focusedNode?: string | null }> = ({ children, style, graphType = "MultiDirectedGraph", focusedNode }) => {

    const containerSettings = {
        renderEdgeLabels: true, // Enable edge labels
        autoCenter: true,
        animationDuration: 1000,
        defaultEdgeType: "arrow",
        edgeProgramClasses: {
            straight: EdgeArrowProgram,
            arrow: EdgeArrowProgram,
            curved: EdgeCurveProgram,
        },
        // Light mode specific settings
        labelColor: { color: "#1f2937" }, // gray-800
        labelSize: 12,
        labelFont: "Inter, sans-serif",
        zIndex: true,
    }

    return (
        <SigmaContainer
            className="w-full h-full bg-gray-50" // Light mode background
            style={style}
            graph={graphType === "MultiDirectedGraph" ? MultiDirectedGraph : graphType === "UndirectedGraph" ? UndirectedGraph : DirectedGraph}
            settings={containerSettings}
        >
            {children}
        </SigmaContainer>
    );
};
