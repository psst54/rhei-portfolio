import React, { useRef, useState } from "react";
import { DragState, SplitNode } from "../type";
import Wrapper from "./Wrapper";

export default function Split({
  node,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  globalDragState,
  onRatioChange,
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
  onRatioChange: (id: string, ratio: number) => void;
}) {
  const { left, right, orientation, id, ratio } = node;
  const [isHover, setIsHover] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [draggingSplitId, setDraggingSplitId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 드래그 시작
  const handleDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDraggingSplitId(id);
    document.body.style.cursor =
      orientation === "H" ? "row-resize" : "col-resize";
  };

  // 드래그 중
  const handleDrag = (e: MouseEvent) => {
    if (!isDragging || !containerRef.current || draggingSplitId !== id) return;
    const rect = containerRef.current.getBoundingClientRect();
    let newRatio = ratio;
    if (orientation === "H") {
      const offsetY = e.clientY - rect.top;
      newRatio = Math.max(0.1, Math.min(0.9, offsetY / rect.height));
    } else {
      const offsetX = e.clientX - rect.left;
      newRatio = Math.max(0.1, Math.min(0.9, offsetX / rect.width));
    }
    if (onRatioChange) {
      onRatioChange(id, newRatio);
    }
  };

  // 드래그 끝
  const handleDragEnd = () => {
    setIsDragging(false);
    setDraggingSplitId(null);
    document.body.style.cursor = "";
  };

  // 마우스 이벤트 등록/해제
  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleDrag);
      window.addEventListener("mouseup", handleDragEnd);
    } else {
      window.removeEventListener("mousemove", handleDrag);
      window.removeEventListener("mouseup", handleDragEnd);
    }
    return () => {
      window.removeEventListener("mousemove", handleDrag);
      window.removeEventListener("mouseup", handleDragEnd);
    };
  }, [isDragging]);

  // 스타일 계산
  const leftStyle = {
    flexBasis: `${ratio * 100}%`,
    flexGrow: 0,
    flexShrink: 0,
    minWidth: 0,
    minHeight: 0,
  };
  const rightStyle = {
    flexBasis: `${(1 - ratio) * 100}%`,
    flexGrow: 0,
    flexShrink: 0,
    minWidth: 0,
    minHeight: 0,
  };

  // 리사이저 스타일
  const resizerStyle =
    orientation === "H"
      ? {
          top: `calc(${(ratio * 100).toFixed(2)}%)`,
          left: 0,
          right: 0,
          height: "6px",
          transform: "translateY(-50%)",
        }
      : {
          left: `calc(${(ratio * 100).toFixed(2)}%)`,
          top: 0,
          bottom: 0,
          width: "6px",
          transform: "translateX(-50%)",
        };
  const resizerClass =
    "absolute z-20 bg-blue-400 transition-opacity duration-200 " +
    (orientation === "H" ? "cursor-row-resize" : "cursor-col-resize");

  return (
    <div
      ref={containerRef}
      className={`relative flex h-full w-full transition-all duration-200 ${
        orientation === "H" ? "flex-col" : "flex-row"
      }`}
      style={{ overflow: "visible" }}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      <div style={leftStyle} className="relative flex overflow-hidden">
        <Wrapper
          node={left}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onDragEnd={onDragEnd}
          globalDragState={globalDragState}
          onRatioChange={onRatioChange}
        />
      </div>
      {/* 리사이저 */}
      <div
        className={resizerClass}
        style={{
          ...resizerStyle,
          opacity: 1,
          background: "teal",
          width: orientation === "H" ? "100%" : "2px",
          height: orientation === "H" ? "2px" : "100%",
          zIndex: 9999,
        }}
        onMouseDown={handleDragStart}
      />
      <div style={rightStyle} className="relative flex overflow-hidden">
        <Wrapper
          node={right}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onDragEnd={onDragEnd}
          globalDragState={globalDragState}
          onRatioChange={onRatioChange}
        />
      </div>
    </div>
  );
}
