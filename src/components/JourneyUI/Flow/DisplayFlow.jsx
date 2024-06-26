import React, { useEffect, useState, useCallback } from "react";
import ReactFlow, {
  Background,
  Controls,
  applyNodeChanges,
  applyEdgeChanges,
} from "reactflow";
import "reactflow/dist/style.css";
import "./Flow.css";
import { GateWayNode, SellerNode } from "./Node";
import BuyerNode from "./BuyerNode";
import { SmartStepEdge } from "@tisoap/react-flow-smart-edge";
import SmartCustomEdge from "./BiEdge";
import { CreateNodesAndEdges } from "./CreateNodes";

const nodeTypes = { buyer: BuyerNode, seller: SellerNode, gate: GateWayNode };
const edgeTypes = {
  bi: SmartCustomEdge,
  smart: SmartStepEdge,
};

export function DisplayFlow({
  protocolCalls,
  config,
  transactionId,
  getSession,
}) {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  useEffect(() => {
    const [n, e] = CreateNodesAndEdges(
      protocolCalls,
      config,
      transactionId,
      getSession
    );
    console.log("Nodes", n);
    console.log("Edges", e);

    const used = e.flatMap((edges) => [edges.source, edges.target]);
    const filteredNodes =
      used.length > 0 ? n.filter((node) => used.includes(node.id)) : n;
    // console.log();
    setNodes(filteredNodes);
    setEdges(e);
  }, [config, protocolCalls, transactionId]);
  const proOptions = { hideAttribution: true };
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultViewport={{ x: -200, y: 0, zoom: 1 }}
        proOptions={proOptions}
      >
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
}
