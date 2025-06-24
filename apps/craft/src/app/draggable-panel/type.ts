export type Node = PanelNode | SplitNode;

export interface PanelNode {
  type: "panel";
  id: string;
}

export interface SplitNode {
  type: "split";
  id: string;
  left: Node;
  right: Node;
  orientation: "H" | "W";
  ratio: number;
}

export interface DragState {
  isDragging: boolean;
  draggedNodeId: string | null;
  targetNodeId: string | null;
  position: "left" | "right" | "top" | "bottom" | null;
}
