import { useCallback, useEffect, useState } from "react";
import { DragState, PanelNode } from "../type";

export default function Panel({
  node,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  globalDragState,
}: {
  node: PanelNode;
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
  const { id } = node;
  const [localDragState, setLocalDragState] = useState<DragState>({
    isDragging: false,
    draggedNodeId: null,
    targetNodeId: null,
    position: null,
  });

  const handleDragStart = useCallback(
    (e: React.DragEvent) => {
      e.dataTransfer.setData("text/plain", id);
      e.dataTransfer.effectAllowed = "move";
      setLocalDragState((prev) => ({
        ...prev,
        isDragging: true,
        draggedNodeId: id,
      }));
      onDragStart(id);
    },
    [id, onDragStart],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";

      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const width = rect.width;
      const height = rect.height;

      let position: "left" | "right" | "top" | "bottom";

      if (Math.abs(x - width / 2) > Math.abs(y - height / 2)) {
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
    [id, onDragOver],
  );

  const handleDragLeave = useCallback(() => {
    setLocalDragState({
      isDragging: false,
      draggedNodeId: null,
      targetNodeId: null,
      position: null,
    });
  }, []);

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

  const handleDragEnd = useCallback(() => {
    setLocalDragState({
      isDragging: false,
      draggedNodeId: null,
      targetNodeId: null,
      position: null,
    });
    onDragEnd();
  }, [onDragEnd]);

  const isBeingDragged = globalDragState.draggedNodeId === id;
  const isTarget =
    globalDragState.isDragging &&
    localDragState.targetNodeId === id &&
    !isBeingDragged;

  return (
    <div
      className={`relative flex h-full w-full items-center justify-center rounded-2xl bg-blue-500/10 transition-all duration-200 ${
        isBeingDragged ? "scale-95 opacity-50" : ""
      } ${isTarget ? "bg-blue-500/30 ring-2 ring-blue-500" : ""}`}
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onDragEnd={handleDragEnd}
    >
      {isTarget && localDragState.position === "left" && (
        <div className="absolute top-0 left-0 z-10 flex h-full w-[50%] items-center justify-center rounded-2xl border-2 border-dashed border-blue-500 bg-blue-500/20">
          <span className="text-sm font-bold text-blue-600">왼쪽</span>
        </div>
      )}

      {isTarget && localDragState.position === "right" && (
        <div className="absolute top-0 right-0 z-10 flex h-full w-[50%] items-center justify-center rounded-2xl border-2 border-dashed border-blue-500 bg-blue-500/20">
          <span className="text-sm font-bold text-blue-600">오른쪽</span>
        </div>
      )}

      {isTarget && localDragState.position === "top" && (
        <div className="absolute top-0 left-0 z-10 flex h-[50%] w-full items-center justify-center rounded-2xl border-2 border-dashed border-blue-500 bg-blue-500/20">
          <span className="text-sm font-bold text-blue-600">위쪽</span>
        </div>
      )}

      {isTarget && localDragState.position === "bottom" && (
        <div className="absolute bottom-0 left-0 z-10 flex h-[50%] w-full items-center justify-center rounded-2xl border-2 border-dashed border-blue-500 bg-blue-500/20">
          <span className="text-sm font-bold text-blue-600">아래쪽</span>
        </div>
      )}

      <span
        className={`font-bold transition-all duration-200 ${isBeingDragged ? "text-blue-300" : "text-white"}`}
      >
        {id}
      </span>
    </div>
  );
}
