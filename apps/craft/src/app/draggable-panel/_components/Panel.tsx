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
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(
    null,
  );
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

      // Long press 타이머 시작 (500ms)
      const timer = setTimeout(() => {
        setIsDraggingTouch(true);
        setLocalDragState((prev) => ({
          ...prev,
          isDragging: true,
          draggedNodeId: id,
        }));
        onDragStart(id);
      }, 500);

      setLongPressTimer(timer);
    };

    // document 레벨에서 터치 이벤트 처리
    const handleDocumentTouchMove = (e: TouchEvent) => {
      if (!isTouching) return;

      const touch = e.touches[0];
      setCurrentTouchPos({ x: touch.clientX, y: touch.clientY });

      // 드래그 중이 아닐 때는 스크롤 허용
      if (!isDraggingTouch) {
        const deltaX = Math.abs(touch.clientX - touchStartPos.x);
        const deltaY = Math.abs(touch.clientY - touchStartPos.y);

        // 드래그 시작 임계값 (20px) - 스크롤과 구분하기 위해 더 크게 설정
        if (deltaX > 20 || deltaY > 20) {
          // Long press 타이머 취소
          if (longPressTimer) {
            clearTimeout(longPressTimer);
            setLongPressTimer(null);
          }
          setIsTouching(false);
          setIsDraggingTouch(false);
          return;
        }
        return; // 드래그 중이 아니면 스크롤 허용
      }

      // 드래그 중일 때만 preventDefault
      e.preventDefault();

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

            // globalDragState도 업데이트하기 위해 onDragOver 호출
            const fakeEvent = {
              preventDefault: () => {},
              currentTarget: closestPanel,
              clientX: touch.clientX,
              clientY: touch.clientY,
            } as any;
            onDragOver(fakeEvent, targetId);
          }
        }
      }
    };

    const handleDocumentTouchEnd = (e: TouchEvent) => {
      if (!isTouching) return;

      // Long press 타이머 취소
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        setLongPressTimer(null);
      }

      if (isDraggingTouch) {
        e.preventDefault();
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

    // passive: true로 설정하여 스크롤 허용 (드래그 중이 아닐 때)
    element.addEventListener("touchstart", handleTouchStart, { passive: true });
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
      if (longPressTimer) {
        clearTimeout(longPressTimer);
      }
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
    onDragOver,
    longPressTimer,
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
    (localDragState.targetNodeId === id ||
      globalDragState.targetNodeId === id) &&
    !isBeingDragged;

  // 현재 패널이 타겟인지 확인하고 위치 정보 가져오기
  const getTargetPosition = () => {
    if (localDragState.targetNodeId === id) {
      return localDragState.position;
    }
    if (globalDragState.targetNodeId === id) {
      return globalDragState.position;
    }
    return null;
  };

  const targetPosition = getTargetPosition();

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
      >
        {isTarget && targetPosition === "left" && (
          <div className="absolute top-0 left-0 z-10 flex h-full w-[50%] items-center justify-center rounded-2xl border-2 border-dashed border-blue-500 bg-blue-500/20">
            <span className="text-sm font-bold text-blue-600">왼쪽</span>
          </div>
        )}

        {isTarget && targetPosition === "right" && (
          <div className="absolute top-0 right-0 z-10 flex h-full w-[50%] items-center justify-center rounded-2xl border-2 border-dashed border-blue-500 bg-blue-500/20">
            <span className="text-sm font-bold text-blue-600">오른쪽</span>
          </div>
        )}

        {isTarget && targetPosition === "top" && (
          <div className="absolute top-0 left-0 z-10 flex h-[50%] w-full items-center justify-center rounded-2xl border-2 border-dashed border-blue-500 bg-blue-500/20">
            <span className="text-sm font-bold text-blue-600">위쪽</span>
          </div>
        )}

        {isTarget && targetPosition === "bottom" && (
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
