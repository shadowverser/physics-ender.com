'use client';

import React, { useState, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  Controls,
  Background,
  Node,
  Edge,
  Connection,
  ReactFlowProvider,
  useReactFlow,
  useNodes,
  BackgroundVariant,
  EdgeChange,
  EdgeRemoveChange,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere, Box } from '@react-three/drei';

// Data structure interfaces
interface GeometryData {
  color: string;
}

interface LightData {
  intensity: number;
}

interface RenderData {
  geometryIds: string[];
  lightIds: string[];
}

const initialNodes: Node<GeometryData | LightData | RenderData>[] = [];
let id = 0;
const getId = () => `dndnode_${id++}`;

const NodeWrapper = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div style={{
    border: '1px solid #ddd',
    padding: '10px 15px',
    background: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
    width: 180,
    color: '#333',
    fontFamily: 'sans-serif',
    fontSize: '14px',
  }}>
    <strong style={{ display: 'block', marginBottom: '8px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>{title}</strong>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>{children}</div>
    <Handle type="source" position={Position.Right} />
  </div>
);

const SphereNode = ({ data }: { data: GeometryData }) => (
  <NodeWrapper title="Sphere">
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span>Color</span>
      <div style={{ width: 20, height: 20, backgroundColor: data.color, borderRadius: '4px', border: '1px solid #ddd' }} />
    </div>
  </NodeWrapper>
);

const BoxNode = ({ data }: { data: GeometryData }) => (
  <NodeWrapper title="Box">
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span>Color</span>
      <div style={{ width: 20, height: 20, backgroundColor: data.color, borderRadius: '4px', border: '1px solid #ddd' }} />
    </div>
  </NodeWrapper>
);

const RenderNode = ({ data }: { data: RenderData }) => {
  const allNodes = useNodes();
  const { geometryIds = [], lightIds = [] } = data;

  const geometries = useMemo(() => 
    geometryIds
      .map(id => allNodes.find(n => n.id === id))
      .filter((n): n is Node<GeometryData> => !!n), 
    [geometryIds, allNodes]
  );

  const lights = useMemo(() => 
    lightIds
      .map(id => allNodes.find(n => n.id === id))
      .filter((n): n is Node<LightData> => !!n), 
    [lightIds, allNodes]
  );

  return (
    <div style={{ border: '1px solid #ddd', padding: 10, background: 'white', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', width: 320, height: 340, color: '#333', fontFamily: 'sans-serif', fontSize: '14px' }}>
      <strong style={{ display: 'block', marginBottom: '8px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>Render</strong>
      <Handle type="target" position={Position.Left} id="geometry-in" style={{ top: '30%' }} />
      <Handle type="target" position={Position.Left} id="light-in" style={{ top: '70%' }} />
      <div style={{ width: '300px', height: '300px', background: '#222', borderRadius: '4px', marginTop: '8px' }}>
        <Canvas camera={{ position: [0, 0, 5] }}>
          <color attach="background" args={['#111']} />
          <axesHelper args={[5]} />
          <ambientLight intensity={0.2} />
          {lights.map(lightNode => (
            <pointLight key={lightNode.id} intensity={lightNode.data.intensity} position={[0, 2, 5]} />
          ))}
          {geometries.map(geoNode => {
            if (geoNode.type === 'sphere') {
              return (
                <Sphere key={geoNode.id} position={[0, 0, 0]}>
                  <meshStandardMaterial color={geoNode.data.color} roughness={0.5} />
                </Sphere>
              );
            }
            if (geoNode.type === 'box') {
              return (
                <Box key={geoNode.id} position={[0, 0, 0]}>
                  <meshStandardMaterial color={geoNode.data.color} roughness={0.5} />
                </Box>
              );
            }
            return null;
          })}
          <OrbitControls />
        </Canvas>
      </div>
    </div>
  );
};

const FlowEditor = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, _onEdgesChange] = useEdgesState([]);
  const [jsonOutput, setJsonOutput] = useState('');
  const [isJsonVisible, setIsJsonVisible] = useState(false);
  const { toObject, setViewport } = useReactFlow();
  const [llmPrompt, setLlmPrompt] = useState('A box and a sphere rendered with one light');
  const [isGenerating, setIsGenerating] = useState(false);

  const LightNode = useCallback(({ id, data }: { id: string, data: LightData }) => {
    const handleIntensityChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
      const newIntensity = parseFloat(evt.target.value);
      if (!isNaN(newIntensity)) {
        setNodes((nds) =>
          nds.map((node) => {
            if (node.id === id) {
              return { ...node, data: { ...node.data, intensity: newIntensity } };
            }
            return node;
          })
        );
      }
    };

    return (
      <NodeWrapper title="Light">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label htmlFor={`intensity-${id}`}>Intensity</label>
          <input
            id={`intensity-${id}`}
            type="number"
            step="0.1"
            value={data.intensity}
            onChange={handleIntensityChange}
            style={{ width: '60px', textAlign: 'right', border: '1px solid #ddd', borderRadius: '4px', padding: '2px 4px' }}
            className="nodrag"
          />
        </div>
      </NodeWrapper>
    );
  }, [setNodes]);

  const nodeTypes = useMemo(() => ({
    sphere: SphereNode,
    box: BoxNode,
    light: LightNode,
    render: RenderNode,
  }), [LightNode]);

  const onConnect = useCallback(
    (params: Edge | Connection) => {
      setEdges((eds) => addEdge(params, eds));
      const sourceNode = nodes.find((n) => n.id === params.source);
      const targetNode = nodes.find((n) => n.id === params.target);

      if (sourceNode && targetNode && targetNode.type === 'render' && params.source) {
        setNodes((nds) =>
          nds.map((node) => {
            if (node.id === targetNode.id && node.type === 'render') {
              const currentData = node.data as RenderData;
              const updatedData: RenderData = { ...currentData };
              if ((sourceNode.type === 'sphere' || sourceNode.type === 'box') && params.targetHandle === 'geometry-in') {
                updatedData.geometryIds = [...(currentData.geometryIds || []), params.source!];
              } else if (sourceNode.type === 'light' && params.targetHandle === 'light-in') {
                updatedData.lightIds = [...(currentData.lightIds || []), params.source!];
              }
              return { ...node, data: updatedData };
            }
            return node;
          })
        );
      }
    },
    [nodes, setEdges, setNodes]
  );

  const onEdgesChange = (changes: EdgeChange[]) => {
    _onEdgesChange(changes);

    const edgesToRemove = changes.filter((c): c is EdgeRemoveChange => c.type === 'remove');
    if (edgesToRemove.length === 0) return;

    setNodes((currentNodes) => {
      const newNodes = [...currentNodes];
      const renderNodesToUpdate = new Map<string, RenderData>();

      for (const edgeChange of edgesToRemove) {
        const edge = edges.find(e => e.id === edgeChange.id);
        if (!edge) continue;

        const targetNode = newNodes.find(n => n.id === edge.target);
        if (targetNode && targetNode.type === 'render') {
          let currentRenderData = renderNodesToUpdate.get(targetNode.id);
          if (!currentRenderData) {
            currentRenderData = { ...(targetNode.data as RenderData) };
          }

          if (edge.targetHandle === 'geometry-in') {
            currentRenderData.geometryIds = (currentRenderData.geometryIds || []).filter(id => id !== edge.source);
          } else if (edge.targetHandle === 'light-in') {
            currentRenderData.lightIds = (currentRenderData.lightIds || []).filter(id => id !== edge.source);
          }
          renderNodesToUpdate.set(targetNode.id, currentRenderData);
        }
      }

      if (renderNodesToUpdate.size > 0) {
        return newNodes.map(n => {
          if (renderNodesToUpdate.has(n.id)) {
            return { ...n, data: renderNodesToUpdate.get(n.id)! };
          }
          return n;
        });
      }

      return currentNodes;
    });
  };

    type AllNodeData = GeometryData | LightData | RenderData;
  const addNode = (type: string, data: AllNodeData) => {
    const newNode = {
      id: getId(),
      type,
      position: {
        x: Math.random() * 400,
        y: Math.random() * 400,
      },
      data,
    };
    setNodes((nds) => nds.concat(newNode));
  };

  const addSphereNode = () => addNode('sphere', { color: 'orange' } as GeometryData);
  const addBoxNode = () => addNode('box', { color: 'mediumpurple' } as GeometryData);
  const addLightNode = () => addNode('light', { intensity: 1 });
  const addRenderNode = () => addNode('render', { geometryIds: [], lightIds: [] });

  const onGenerateJson = useCallback(async () => {
    if (!llmPrompt) {
        alert('Please enter a prompt.');
        return;
    }
    setIsGenerating(true);
    try {
        const response = await fetch('/api/generate-json', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userPrompt: llmPrompt }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to generate JSON.');
        }

        setJsonOutput(data.json);
        if (!isJsonVisible) {
            setIsJsonVisible(true);
        }
    } catch (error) {
        if (error instanceof Error) {
            alert(`Error: ${error.message}`);
        } else {
            alert('An unknown error occurred.');
        }
        console.error(error);
    } finally {
        setIsGenerating(false);
    }
  }, [llmPrompt, isJsonVisible]);

  const toggleJsonView = useCallback(() => {
    if (!isJsonVisible) {
      const flowObject = toObject();
      setJsonOutput(JSON.stringify(flowObject, null, 2));
    }
    setIsJsonVisible(!isJsonVisible);
  }, [isJsonVisible, toObject]);

  const handleJsonInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonOutput(event.target.value);
  };

  const onApplyJson = useCallback(() => {
    try {
      const flowObject = JSON.parse(jsonOutput);
      if (flowObject) {
        setNodes(flowObject.nodes || []);
        setEdges(flowObject.edges || []);
        if (flowObject.viewport) {
          setViewport(flowObject.viewport);
        }
      } else {
        alert('Invalid JSON structure.');
      }
    } catch (e) {
      alert('Error parsing JSON. Please check syntax.');
      console.error(e);
    }
  }, [jsonOutput, setNodes, setEdges, setViewport]);

  const buttonStyle = {
    color: '#333',
    background: '#f9f9f9',
    border: '1px solid #ddd',
    padding: '5px 15px',
    borderRadius: '6px',
    cursor: 'pointer',
  };

  return (
    <div style={{ width: '100vw', height: '100vh', fontFamily: 'sans-serif' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Controls />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
      <div style={{ position: 'absolute', top: 15, left: 15, zIndex: 4, display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div style={{ display: 'flex', gap: '10px', background: 'white', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
          <button onClick={addSphereNode} style={buttonStyle}>Add Sphere</button>
          <button onClick={addBoxNode} style={buttonStyle}>Add Box</button>
          <button onClick={addLightNode} style={buttonStyle}>Add Light</button>
          <button onClick={addRenderNode} style={buttonStyle}>Add Render</button>
        </div>
        <div style={{ background: 'white', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label htmlFor="llm-prompt" style={{ fontWeight: 'bold' }}>Generate with AI:</label>
            <textarea
                id="llm-prompt"
                value={llmPrompt}
                onChange={(e) => setLlmPrompt(e.target.value)}
                placeholder="e.g., A box and a sphere rendered with one light"
                style={{
                    width: '100%',
                    minHeight: '60px',
                    fontFamily: 'sans-serif',
                    fontSize: '14px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    padding: '8px',
                    boxSizing: 'border-box',
                    color: '#333' // Set text color to be visible
                }}
            />
            <button onClick={onGenerateJson} style={{...buttonStyle, alignSelf: 'flex-start'}} disabled={isGenerating}>
                {isGenerating ? 'Generating...' : 'Generate JSON'}
            </button>
          </div>
        </div>
        <div style={{ background: 'white', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={toggleJsonView} style={buttonStyle}>
              {isJsonVisible ? 'Hide JSON' : 'Show JSON'}
            </button>
            {isJsonVisible && (
              <button onClick={onApplyJson} style={buttonStyle}>
                Apply JSON
              </button>
            )}
          </div>
          {isJsonVisible && (
            <div style={{
              marginTop: '10px',
              width: '400px',
              maxHeight: '400px',
              overflow: 'auto',
            }}>
              <textarea
                value={jsonOutput}
                onChange={handleJsonInputChange}
                style={{
                  width: '100%',
                  height: '350px',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  color: '#333',
                  background: '#f5f5f5',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  padding: '10px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const QompathPage = () => (
  <ReactFlowProvider>
    <FlowEditor />
  </ReactFlowProvider>
);

export default QompathPage;
