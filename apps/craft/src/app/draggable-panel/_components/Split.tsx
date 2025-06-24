import { useCallback, useState } from "react";
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
  const { left, right, orientation, id } = node;
  const [localDragState, setLocalDragState] = useState<DragState>({
    isDragging: false,
    draggedNodeId: null,
    targetNodeId: null,
    position: null,
  });

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const width = rect.width;
      const height = rect.height;

      let position: "left" | "right" | "top" | "bottom";

      if (orientation === "W") {
        position = x < width / 2 ? "left" : "right";
      } else {
        position = y < height / 2 ? "top" : "bottom";
      }

      setLocalDragState((prev) => ({
        ...prev,
        targetNodeId: id,
        position,
      }));

      onDragOver(e, id);
    },
    [orientation, id, onDragOver],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (
        localDragState.draggedNodeId &&
        localDragState.targetNodeId &&
        localDragState.position
      ) {
        onDrop(
          localDragState.draggedNodeId,
          localDragState.targetNodeId,
          localDragState.position,
        );
      }
      setLocalDragState({
        isDragging: false,
        draggedNodeId: null,
        targetNodeId: null,
        position: null,
      });
    },
    [localDragState, onDrop],
  );

  const handleDragLeave = useCallback(() => {
    setLocalDragState({
      isDragging: false,
      draggedNodeId: null,
      targetNodeId: null,
      position: null,
    });
  }, []);

  const isTarget =
    globalDragState.isDragging && localDragState.targetNodeId === id;

  return (
    <div
      className={`relative flex h-full w-full gap-2 transition-all duration-200 ${
        orientation === "H" ? "flex-col" : "flex-row"
      } ${isTarget ? "rounded-lg bg-blue-500/10" : ""}`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragLeave={handleDragLeave}
    >
      {isTarget && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg border-2 border-dashed border-blue-500 bg-blue-500/20">
          <span className="text-sm font-bold text-blue-600">
            {localDragState.position === "left" ||
            localDragState.position === "top"
              ? "왼쪽/위쪽"
              : "오른쪽/아래쪽"}
          </span>
        </div>
      )}
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
