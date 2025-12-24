"use client";

import { getRoles } from '@/app/actions/roles';
import { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
    addEdge, Background, Controls, Edge,
    MarkerType, MiniMap, Node, useEdgesState, useNodesState
} from 'reactflow';
import 'reactflow/dist/style.css';

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

export default function CareerPage() {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [roles, setRoles] = useState<any[]>([]);

    useEffect(() => {
        const fetchRoles = async () => {
            const data = await getRoles();
            setRoles(data);

            // Transform roles to nodes and paths to edges
            const newNodes: Node[] = data.map((role, index) => ({
                id: role.id,
                position: { x: 250 * (index % 3), y: 150 * Math.floor(index / 3) }, // Simple grid layout
                data: { label: role.title },
                style: { width: 180, border: '1px solid #777', padding: 10, borderRadius: 5, background: '#fff', color: '#333' }
            }));

            const newEdges: Edge[] = [];
            data.forEach(role => {
                role.paths.forEach((path: any) => {
                    if (path.sourceRoleId) {
                        newEdges.push({
                            id: path.id,
                            source: path.sourceRoleId,
                            target: role.id,
                            animated: true,
                            markerEnd: {
                                type: MarkerType.ArrowClosed,
                            },
                        });
                    }
                });
            });

            setNodes(newNodes);
            setEdges(newEdges);
        };

        fetchRoles();
    }, [setNodes, setEdges]);

    const onConnect = useCallback((params: any) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

    return (
        <div className="flex-1 bg-slate-50 h-full">
            <div className="p-6 border-b bg-background z-10">
                <h1 className="text-3xl font-bold tracking-tight">Career Explorer</h1>
                <p className="text-muted-foreground">Visualize your career path and required milestones.</p>
            </div>
            <div className="h-[calc(100%-88px)]">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    fitView
                >
                    <Controls />
                    <MiniMap />
                    <Background gap={12} size={1} />
                </ReactFlow>
            </div>
        </div>
    );
}
