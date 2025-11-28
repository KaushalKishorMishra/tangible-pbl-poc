import type { Attributes } from "graphology-types";

export interface EdgeInfo {
    id: string;
    target: string;
    source: string;
    label: string;
    properties: Attributes;
    direction: "in" | "out";
}

export interface SelectedNodeState {
    id: string;
    label: string;
    edges: EdgeInfo[];
    attributes: Attributes;
}

export interface HoveredNodeState {
    id: string;
    label: string;
    edges: EdgeInfo[];
}
