export interface NodeAttributes {
  x: number;
  y: number;
  label: string;
  size: number;
  color?: string;
  [key: string]: unknown;
}

export interface EdgeAttributes {
  label?: string;
  size?: number;
  color?: string;
  type?: string;
  curvature?: number;
  parallelIndex?: number;
  parallelMaxIndex?: number;
  [key: string]: unknown;
}
