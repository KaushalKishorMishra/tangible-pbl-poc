import type { CSSProperties, ReactNode } from "react";

export interface GraphContainerProps {
    children: ReactNode;
    style?: CSSProperties;
    graphType?: "MultiDirectedGraph" | "DirectedGraph" | "UndirectedGraph";
}
