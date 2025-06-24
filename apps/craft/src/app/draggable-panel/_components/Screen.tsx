"use client";

import { useState, useRef, useCallback } from "react";

// import Panel from "./Panel";

type Node = PanelNode | SplitNode;

interface PanelNode {
  type: "panel";
  id: string;
}

interface SplitNode {
  type: "split";
  id: string;
  left: Node;
  right: Node;
  orientation: "H" | "W";
  ratio: number;
}

interface DragState {
  isDragging: boolean;
  draggedNodeId: string | null;
  targetNodeId: string | null;
  position: "left" | "right" | "top" | "bottom" | null;
}

const initialTree: Node = {
  type: "split",
  id: "split1",
  left: {
    type: "panel",
    id: "panel1",
  },
  right: {
    type: "split",
    id: "split2",
    left: {
      type: "panel",
      id: "panel2",
    },
    right: {
      type: "panel",
      id: "panel3",
    },
    orientation: "H",
    ratio: 0.6,
  },
  orientation: "W",
  ratio: 0.3,
};

function TreeVisualizer({ tree }: { tree: Node }) {
  const renderNode = (node: Node, depth: number = 0): JSX.Element => {
    const indent = "  ".repeat(depth);
    
    if (node.type === "panel") {
      return (
        <div key={node.id} className="text-sm">
          <span className="text-blue-500">●</span> {node.id}
        </div>
      );
    }
    
    return (
      <div key={node.id} className="text-sm">
        <div className="text-green-500">
          {indent}└─ {node.id} ({node.orientation})
        </div>
        <div className="ml-4">
          {renderNode(node.left, depth + 1)}
          {renderNode(node.right, depth + 1)}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-100 p-4 rounded-lg">
      <h3 className="text-sm font-bold mb-2">현재 Tree 구조:</h3>
      <div className="font-mono text-xs">
        {renderNode(tree)}
      </div>
    </div>
  );
}

function Wrapper({ 
  node, 
  onDragStart, 
  onDragOver, 
  onDrop, 
  onDragEnd,
  globalDragState
}: { 
  node: Node;
  onDragStart: (nodeId: string) => void;
  onDragOver: (e: React.DragEvent, nodeId: string) => void;
  onDrop: (draggedNodeId: string, targetNodeId: string, position: "left" | "right" | "top" | "bottom") => void;
  onDragEnd: () => void;
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

function Split({ 
  node, 
  onDragStart, 
  onDragOver, 
  onDrop, 
  onDragEnd,
  globalDragState
}: { 
  node: SplitNode;
  onDragStart: (nodeId: string) => void;
  onDragOver: (e: React.DragEvent, nodeId: string) => void;
  onDrop: (draggedNodeId: string, targetNodeId: string, position: "left" | "right" | "top" | "bottom") => void;
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

  const handleDragOver = useCallback((e: React.DragEvent) => {
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

    setLocalDragState(prev => ({
      ...prev,
      targetNodeId: id,
      position,
    }));

    onDragOver(e, id);
  }, [orientation, id, onDragOver]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (localDragState.draggedNodeId && localDragState.targetNodeId && localDragState.position) {
      onDrop(localDragState.draggedNodeId, localDragState.targetNodeId, localDragState.position);
    }
    setLocalDragState({
      isDragging: false,
      draggedNodeId: null,
      targetNodeId: null,
      position: null,
    });
  }, [localDragState, onDrop]);

  const handleDragLeave = useCallback(() => {
    setLocalDragState({
      isDragging: false,
      draggedNodeId: null,
      targetNodeId: null,
      position: null,
    });
  }, []);

  const isTarget = globalDragState.isDragging && localDragState.targetNodeId === id;

  return (
    <div
      className={`flex h-full w-full gap-2 relative transition-all duration-200 ${
        orientation === "H" ? "flex-col" : "flex-row"
      } ${isTarget ? "bg-blue-500/10 rounded-lg" : ""}`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragLeave={handleDragLeave}
    >
      {isTarget && (
        <div className="absolute inset-0 border-2 border-blue-500 border-dashed bg-blue-500/20 z-10 flex items-center justify-center rounded-lg">
          <span className="text-blue-600 font-bold text-sm">
            {localDragState.position === "left" || localDragState.position === "top" ? "왼쪽/위쪽" : "오른쪽/아래쪽"}
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

function Panel({ 
  node, 
  onDragStart, 
  onDragOver, 
  onDrop, 
  onDragEnd,
  globalDragState
}: { 
  node: PanelNode;
  onDragStart: (nodeId: string) => void;
  onDragOver: (e: React.DragEvent, nodeId: string) => void;
  onDrop: (draggedNodeId: string, targetNodeId: string, position: "left" | "right" | "top" | "bottom") => void;
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

  const handleDragStart = useCallback((e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
    setLocalDragState(prev => ({
      ...prev,
      isDragging: true,
      draggedNodeId: id,
    }));
    onDragStart(id);
  }, [id, onDragStart]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
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

    setLocalDragState(prev => ({
      ...prev,
      targetNodeId: id,
      position,
    }));

    onDragOver(e, id);
  }, [id, onDragOver]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (localDragState.draggedNodeId && localDragState.targetNodeId && localDragState.position) {
      onDrop(localDragState.draggedNodeId, localDragState.targetNodeId, localDragState.position);
    }
    setLocalDragState({
      isDragging: false,
      draggedNodeId: null,
      targetNodeId: null,
      position: null,
    });
  }, [localDragState, onDrop]);

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
  const isTarget = globalDragState.isDragging && localDragState.targetNodeId === id && !isBeingDragged;

  return (
    <div 
      className={`h-full w-full rounded-2xl bg-blue-500/10 flex items-center justify-center relative transition-all duration-200 ${
        isBeingDragged ? "opacity-50 scale-95" : ""
      } ${isTarget ? "bg-blue-500/30 ring-2 ring-blue-500" : ""}`}
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragEnd={handleDragEnd}
    >
      {isTarget && (
        <div className="absolute inset-0 border-2 border-blue-500 border-dashed bg-blue-500/20 z-10 flex items-center justify-center rounded-2xl">
          <span className="text-blue-600 font-bold text-sm">
            {localDragState.position === "left" ? "왼쪽" : 
             localDragState.position === "right" ? "오른쪽" :
             localDragState.position === "top" ? "위쪽" : "아래쪽"}
          </span>
        </div>
      )}
      <span className={`font-bold transition-all duration-200 ${isBeingDragged ? "text-blue-300" : "text-white"}`}>
        {id}
      </span>
    </div>
  );
}

export default function Screen() {
  const [tree, setTree] = useState<Node>(initialTree);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedNodeId: null,
    targetNodeId: null,
    position: null,
  });

  const handleDragStart = useCallback((nodeId: string) => {
    setDragState(prev => ({
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

  const handleDrop = useCallback((draggedNodeId: string, targetNodeId: string, position: "left" | "right" | "top" | "bottom") => {
    if (draggedNodeId === targetNodeId) return;

    const draggedNode = findNode(tree, draggedNodeId);
    if (!draggedNode) return;

    const newTree = removeNode(tree, draggedNodeId);
    if (!newTree) return;

    const targetNode = findNode(newTree, targetNodeId);
    if (!targetNode) return;

    const orientation = position === "left" || position === "right" ? "W" : "H";
    const newSplitNode: SplitNode = {
      type: "split",
      id: `split-${Date.now()}`,
      orientation,
      ratio: 0.5,
      left: position === "left" || position === "top" ? draggedNode : targetNode,
      right: position === "left" || position === "top" ? targetNode : draggedNode,
    };

    const replaceNode = (node: Node, targetId: string, replacement: Node): Node => {
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
  }, [tree, findNode, removeNode]);

  const handleReset = useCallback(() => {
    setTree(initialTree);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">패널 레이아웃</h2>
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
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
