import type { FC, ReactNode } from "react";
import { SigmaContainer } from "@react-sigma/core";
import "@react-sigma/core/lib/style.css";
import { MultiDirectedGraph, UndirectedGraph, DirectedGraph } from "graphology";

interface GraphContainerProps {
    children?: ReactNode;
    style?: React.CSSProperties;
    graphType?: "MultiDirectedGraph" | "UndirectedGraph" | "DirectedGraph";
}

export const GraphContainer: FC<GraphContainerProps> = ({ children, style, graphType = "MultiDirectedGraph" }) => {

    const containerSettings = {
        renderEdgeLabels: true,
        autoCenter: true,
        animationDuration: 1000,
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
