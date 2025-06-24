import { useCallback, useState, useRef, useEffect } from "react";
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

  const [isTouching, setIsTouching] = useState(false);
  const [touchStartPos, setTouchStartPos] = useState({ x: 0, y: 0 });
  const [currentTouchPos, setCurrentTouchPos] = useState({ x: 0, y: 0 });
  const [isDraggingTouch, setIsDraggingTouch] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const touchRef = useRef<HTMLDivElement>(null);

  // 터치 드래그 상태를 globalDragState와 동기화
  useEffect(() => {
    if (isTouching && isDraggingTouch) {
      setLocalDragState((prev) => ({
        ...prev,
        isDragging: true,
        draggedNodeId: id,
      }));
    }
  }, [isTouching, isDraggingTouch, id]);

  // 터치 이벤트 리스너 직접 추가
  useEffect(() => {
    const element = touchRef.current;
    if (!element) return;

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = element.getBoundingClientRect();

      setTouchStartPos({ x: touch.clientX, y: touch.clientY });
      setCurrentTouchPos({ x: touch.clientX, y: touch.clientY });
      setDragOffset({
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      });
      setIsTouching(true);
      setIsDraggingTouch(false);
    };

    // document 레벨에서 터치 이벤트 처리
    const handleDocumentTouchMove = (e: TouchEvent) => {
      if (!isTouching) return;
      e.preventDefault();

      const touch = e.touches[0];
      setCurrentTouchPos({ x: touch.clientX, y: touch.clientY });

      const deltaX = Math.abs(touch.clientX - touchStartPos.x);
      const deltaY = Math.abs(touch.clientY - touchStartPos.y);

      // 드래그 시작 임계값 (10px)
      if (!isDraggingTouch && (deltaX > 10 || deltaY > 10)) {
        setIsDraggingTouch(true);
        setLocalDragState((prev) => ({
          ...prev,
          isDragging: true,
          draggedNodeId: id,
        }));
        onDragStart(id);
      }

      if (isDraggingTouch) {
        // 현재 터치 위치에서 가장 가까운 패널 찾기
        const allPanels = document.querySelectorAll("[data-panel-id]");
        let closestPanel: any = null;
        let closestDistance = Infinity;

        allPanels.forEach((panel: any) => {
          const rect = panel.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          const distance = Math.sqrt(
            Math.pow(touch.clientX - centerX, 2) +
              Math.pow(touch.clientY - centerY, 2),
          );

          if (distance < closestDistance) {
            closestDistance = distance;
            closestPanel = panel;
          }
        });

        if (closestPanel) {
          const rect = closestPanel.getBoundingClientRect();
          const x = touch.clientX - rect.left;
          const y = touch.clientY - rect.top;
          const width = rect.width;
          const height = rect.height;

          let position: "left" | "right" | "top" | "bottom";

          if (Math.abs(x - width / 2) > Math.abs(y - height / 2)) {
            position = x < width / 2 ? "left" : "right";
          } else {
            position = y < height / 2 ? "top" : "bottom";
          }

          const targetId = closestPanel.getAttribute("data-panel-id");
          if (targetId && targetId !== id) {
            setLocalDragState((prev) => ({
              ...prev,
              targetNodeId: targetId,
              position,
            }));
          }
        }
      }
    };

    const handleDocumentTouchEnd = (e: TouchEvent) => {
      if (!isTouching) return;
      e.preventDefault();

      if (isDraggingTouch) {
        const draggedNodeId = globalDragState.draggedNodeId;
        const targetNodeId = localDragState.targetNodeId;
        const position = localDragState.position;

        if (draggedNodeId && targetNodeId && position) {
          onDrop(draggedNodeId, targetNodeId, position);
        }

        onDragEnd();
      }

      setLocalDragState({
        isDragging: false,
        draggedNodeId: null,
        targetNodeId: null,
        position: null,
      });
      setIsTouching(false);
      setIsDraggingTouch(false);
      setDragOffset({ x: 0, y: 0 });
    };

    // passive: false로 설정하여 preventDefault 사용 가능
    element.addEventListener("touchstart", handleTouchStart, {
      passive: false,
    });
    document.addEventListener("touchmove", handleDocumentTouchMove, {
      passive: false,
    });
    document.addEventListener("touchend", handleDocumentTouchEnd, {
      passive: false,
    });

    return () => {
      element.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleDocumentTouchMove);
      document.removeEventListener("touchend", handleDocumentTouchEnd);
    };
  }, [
    isTouching,
    isDraggingTouch,
    touchStartPos,
    id,
    onDragStart,
    localDragState,
    globalDragState,
    onDrop,
    onDragEnd,
  ]);

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

      const draggedNodeId = globalDragState.draggedNodeId;
      const targetNodeId = localDragState.targetNodeId;
      const position = localDragState.position;

      if (draggedNodeId && targetNodeId && position) {
        onDrop(draggedNodeId, targetNodeId, position);
      }
      setLocalDragState({
        isDragging: false,
        draggedNodeId: null,
        targetNodeId: null,
        position: null,
      });
    },
    [localDragState, onDrop, globalDragState],
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

  const isBeingDragged =
    globalDragState.draggedNodeId === id || (isTouching && isDraggingTouch);
  const isTarget =
    (globalDragState.isDragging || isDraggingTouch) &&
    localDragState.targetNodeId === id &&
    !isBeingDragged;

  return (
    <>
      {/* 터치 드래그 시 보여줄 고정된 요소 */}
      {isTouching && isDraggingTouch && isBeingDragged && (
        <div
          className="fixed flex items-center justify-center rounded-2xl border-2 border-blue-500 bg-blue-500/10"
          style={{
            top: currentTouchPos.y - dragOffset.y,
            left: currentTouchPos.x - dragOffset.x,
            width: touchRef.current?.offsetWidth || "auto",
            height: touchRef.current?.offsetHeight || "auto",
            zIndex: 1000,
            pointerEvents: "none",
            transform: "scale(0.95)",
            opacity: 0.8,
          }}
        >
          <span className="font-bold text-white">{id}</span>
        </div>
      )}

      <div
        ref={touchRef}
        data-panel-id={id}
        className={`relative flex h-full w-full items-center justify-center rounded-2xl bg-blue-500/10 transition-all duration-200 ${
          isBeingDragged ? "scale-95 opacity-50" : ""
        } ${isTarget ? "bg-blue-500/30 ring-2 ring-blue-500" : ""}`}
        draggable
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onDragEnd={handleDragEnd}
        style={{ touchAction: "none" }} // 모바일에서 스크롤 방지
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
    </>
  );
}
