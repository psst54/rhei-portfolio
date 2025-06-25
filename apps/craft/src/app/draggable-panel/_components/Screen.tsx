"use client";

import { useState, useCallback } from "react";
import { DragState, Node, SplitNode } from "../type";
import TreeVisualizer from "./TreeVisualizer";
import Wrapper from "./Wrapper";

const initialTree: Node = {
  type: "split",
  id: "split-1",
  left: {
    type: "panel",
    id: "panel-1",
  },
  right: {
    type: "split",
    id: "split-2",
    left: {
      type: "split",
      id: "split-3",
      left: {
        type: "panel",
        id: "panel-2",
      },
      right: {
        type: "panel",
        id: "panel-3",
      },
      orientation: "W",
      ratio: 0.5,
    },
    right: {
      type: "panel",
      id: "panel-4",
    },
    orientation: "H",
    ratio: 0.3,
  },
  orientation: "W",
  ratio: 0.6,
};

export default function Screen() {
  const [tree, setTree] = useState<Node>(initialTree);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedNodeId: null,
    targetNodeId: null,
    position: null,
  });

  const handleDragStart = useCallback((nodeId: string) => {
    setDragState((prev) => ({
      ...prev,
      isDragging: true,
      draggedNodeId: nodeId,
    }));
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent, nodeId: string) => {
      // 터치 드래그 시에도 globalDragState 업데이트
      if (dragState.isDragging) {
        const rect = e.currentTarget?.getBoundingClientRect();
        if (rect) {
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

          setDragState((prev) => ({
            ...prev,
            targetNodeId: nodeId,
            position,
          }));
        }
      }
    },
    [dragState.isDragging],
  );

  const handleDragEnd = useCallback(() => {
    setDragState({
      isDragging: false,
      draggedNodeId: null,
      targetNodeId: null,
      position: null,
    });
  }, []);

  const findNode = useCallback((node: Node, id: string): Node | null => {
    if (node.id === id) return node;
    if (node.type === "split") {
      const leftResult = findNode(node.left, id);
      if (leftResult) return leftResult;
      const rightResult = findNode(node.right, id);
      if (rightResult) return rightResult;
    }
    return null;
  }, []);

  const removeNode = useCallback((node: Node, id: string): Node | null => {
    if (node.type === "panel") {
      return node.id === id ? null : node;
    }

    if (node.left.id === id) {
      return node.right;
    }
    if (node.right.id === id) {
      return node.left;
    }

    const newLeft = removeNode(node.left, id);
    const newRight = removeNode(node.right, id);

    if (newLeft === null) return newRight;
    if (newRight === null) return newLeft;

    return {
      ...node,
      left: newLeft,
      right: newRight,
    };
  }, []);

  const handleDrop = useCallback(
    (
      draggedNodeId: string,
      targetNodeId: string,
      position: "left" | "right" | "top" | "bottom",
    ) => {
      if (draggedNodeId === targetNodeId) return;

      const draggedNode = findNode(tree, draggedNodeId);
      if (!draggedNode) return;

      const newTree = removeNode(tree, draggedNodeId);
      if (!newTree) return;

      const targetNode = findNode(newTree, targetNodeId);
      if (!targetNode) return;

      const orientation =
        position === "left" || position === "right" ? "W" : "H";
      const newSplitNode: SplitNode = {
        type: "split",
        id: `split-${Date.now()}`,
        orientation,
        ratio: 0.5,
        left:
          position === "left" || position === "top" ? draggedNode : targetNode,
        right:
          position === "left" || position === "top" ? targetNode : draggedNode,
      };

      const replaceNode = (
        node: Node,
        targetId: string,
        replacement: Node,
      ): Node => {
        if (node.id === targetId) return replacement;
        if (node.type === "split") {
          return {
            ...node,
            left: replaceNode(node.left, targetId, replacement),
            right: replaceNode(node.right, targetId, replacement),
          };
        }
        return node;
      };

      const updatedTree = replaceNode(newTree, targetNodeId, newSplitNode);
      setTree(updatedTree);

      // drop 후 dragState 초기화
      setDragState({
        isDragging: false,
        draggedNodeId: null,
        targetNodeId: null,
        position: null,
      });
    },
    [tree, findNode, removeNode],
  );

  const handleReset = useCallback(() => {
    setTree(initialTree);
  }, []);

  // SplitNode의 ratio를 업데이트하는 함수
  const handleRatioChange = useCallback((id: string, newRatio: number) => {
    function updateRatio(node: Node): Node {
      if (node.type === "split") {
        if (node.id === id) {
          return { ...node, ratio: newRatio };
        }
        return {
          ...node,
          left: updateRatio(node.left),
          right: updateRatio(node.right),
        };
      }
      return node;
    }
    setTree((prev) => updateRatio(prev));
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">패널 레이아웃</h2>
        <button
          onClick={handleReset}
          className="rounded-lg bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
        >
          초기화
        </button>
      </div>

      <div className="h-[60dvh] min-h-full w-full rounded-2xl bg-blue-500/10 p-2">
        <Wrapper
          node={tree}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onDragEnd={handleDragEnd}
          globalDragState={dragState}
          onRatioChange={handleRatioChange}
        />
      </div>

      <TreeVisualizer tree={tree} />
    </div>
  );
}
