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

const tree: Node = {
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

function Wrapper({ node }: { node: Node }) {
  if (node.type === "split") {
    return <Split node={node} />;
  }

  return <Panel node={node} />;
}

function Split({ node }: { node: SplitNode }) {
  const { left, right, orientation } = node;

  return (
    <div
      className={`flex h-full w-full gap-2 ${orientation === "H" ? "flex-col" : "flex-row"}`}
    >
      <Wrapper node={left} />
      <Wrapper node={right} />
    </div>
  );
}

function Panel({ node }: { node: PanelNode }) {
  const { id } = node;

  return (
    <div className="h-full w-full rounded-2xl bg-blue-500/10" draggable>
      {id}
    </div>
  );
}

export default function Screen() {
  return (
    <div className="h-dvh min-h-full w-full rounded-2xl bg-blue-500/10 p-2">
      <Wrapper node={tree} />
    </div>
  );
}
