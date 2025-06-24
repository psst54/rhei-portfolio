import { Node } from "../type";

export default function TreeVisualizer({ tree }: { tree: Node }) {
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
    <div className="rounded-lg bg-gray-100 p-4">
      <h3 className="mb-2 text-sm font-bold">현재 Tree 구조:</h3>
      <div className="font-mono text-xs">{renderNode(tree)}</div>
    </div>
  );
}
