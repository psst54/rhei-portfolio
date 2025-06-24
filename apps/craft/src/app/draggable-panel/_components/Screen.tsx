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
      id: "split-1",
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
    ratio: 0.5,
  },
  orientation: "W",
  ratio: 0.5,
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

  const handleDragOver = useCallback((e: React.DragEvent, nodeId: string) => {
    // 드래그 오버 로직은 각 컴포넌트에서 처리
  }, []);

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

      <div className="h-dvh min-h-full w-full rounded-2xl bg-blue-500/10 p-2">
        <Wrapper
          node={tree}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onDragEnd={handleDragEnd}
          globalDragState={dragState}
        />
      </div>

      <TreeVisualizer tree={tree} />
    </div>
  );
}
