import { DragState, Node } from "../type";
import Panel from "./Panel";
import Split from "./Split";

export default function Wrapper({
  node,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  globalDragState,
  onRatioChange,
}: {
  node: Node;
  onDragStart: (nodeId: string) => void;
  onDragOver: (e: React.DragEvent, nodeId: string) => void;
  onDrop: (
    draggedNodeId: string,
    targetNodeId: string,
    position: "left" | "right" | "top" | "bottom",
  ) => void;
  onDragEnd: () => void;
  onRatioChange: (nodeId: string, ratio: number) => void;
  globalDragState: DragState;
}) {
  if (node.type === "split") {
    return (
      <Split
        node={node}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onDragEnd={onDragEnd}
        onRatioChange={onRatioChange}
        globalDragState={globalDragState}
      />
    );
  }

  return (
    <Panel
      node={node}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      globalDragState={globalDragState}
    />
  );
}
