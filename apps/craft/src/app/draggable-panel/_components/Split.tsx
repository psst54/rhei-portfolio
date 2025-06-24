import { DragState, SplitNode } from "../type";
import Wrapper from "./Wrapper";

export default function Split({
  node,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  globalDragState,
}: {
  node: SplitNode;
  onDragStart: (nodeId: string) => void;
  onDragOver: (e: React.DragEvent, nodeId: string) => void;
  onDrop: (
    draggedNodeId: string,
    targetNodeId: string,
    position: "left" | "right" | "top" | "bottom",
  ) => void;
  onDragEnd: () => void;
  globalDragState: DragState;
}) {
  const { left, right, orientation } = node;

  return (
    <div
      className={`relative flex h-full w-full gap-2 transition-all duration-200 ${
        orientation === "H" ? "flex-col" : "flex-row"
      }`}
    >
      <Wrapper
        node={left}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onDragEnd={onDragEnd}
        globalDragState={globalDragState}
      />
      <Wrapper
        node={right}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onDragEnd={onDragEnd}
        globalDragState={globalDragState}
      />
    </div>
  );
}
