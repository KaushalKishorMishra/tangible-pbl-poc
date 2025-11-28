import { type FC } from "react";
import { SigmaContainer } from "@react-sigma/core";
import "@react-sigma/core/lib/style.css";
import { MultiDirectedGraph } from "graphology";
import { DirectedGraph, UndirectedGraph } from "graphology";
import EdgeCurveProgram from "@sigma/edge-curve";
import { EdgeArrowProgram } from "sigma/rendering";
import type { GraphContainerProps } from "../../types/components";

export const GraphContainer: FC<GraphContainerProps> = ({ children, style, graphType = "MultiDirectedGraph" }) => {

    const containerSettings = {
        renderEdgeLabels: true,
        autoCenter: true,
        animationDuration: 1000,
        defaultEdgeType: "straight",
        edgeProgramClasses: {
            straight: EdgeArrowProgram,
            curved: EdgeCurveProgram,
        },
    }

    return (
        <SigmaContainer
            className="w-full h-full"
            style={style}
            graph={graphType === "MultiDirectedGraph" ? MultiDirectedGraph : graphType === "UndirectedGraph" ? UndirectedGraph : DirectedGraph}
            settings={containerSettings}
        >
            {children}
        </SigmaContainer>
    );
};
