import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ReactFlow, useNodesState, useEdgesState, ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import axios from 'axios';
import Particles from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';

// Nodes & Edges
import { nodeTypes } from './nodes/CustomNode';
import { edgeTypes } from './edges/CustomAnimatedEdge';

// Components
import Sidebar          from './components/Sidebar';
import LegendPanel      from './components/LegendPanel';
import EmptyState       from './components/EmptyState';
import CanvasToolbar    from './components/CanvasToolbar';
import NodeDetailPanel  from './components/NodeDetailPanel';

// Hooks
import { useCircuitTracer }  from './hooks/useCircuitTracer';
import { useBlastRadius }    from './hooks/useBlastRadius';
import { useGraphProcessor } from './hooks/useGraphProcessor';

import './App.css';

// ─────────────────────────────────────────────────────────────────────────────
// FlowApp — main app shell, holds all state, wires hooks ↔ components
// ─────────────────────────────────────────────────────────────────────────────
function FlowApp() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(false);

  // Ingest form state
  const [ingestTab,  setIngestTab]  = useState('LOCAL');
  const [githubUrl,  setGithubUrl]  = useState('');
  const [folderPath, setFolderPath] = useState('');

  // Graph state
  const [rawGraph,             setRawGraph]             = useState(null);
  const [viewMode,             setViewMode]             = useState('SERVICE');
  const [layoutMode,           setLayoutMode]           = useState('SEMANTIC');
  const [showUnconnectedNodes, setShowUnconnectedNodes] = useState(false);
  const [filters, setFilters] = useState({
    FEIGN: true, KAFKA_PUBLISH: true, KAFKA_CONSUME: true,
    REST:  true, JPA_RELATION:  true, INJECTION:     true,
  });

  // Selected node (detail panel)
  const [selectedNode, setSelectedNode] = useState(null);

  // Upload progress (0-100, null when not uploading)
  const [uploadProgress, setUploadProgress] = useState(null);

  // Particles
  const [, setInit] = useState(false);
  const particlesInit = useCallback(async engine => {
    await loadSlim(engine);
    setInit(true);
  }, []);

  const reactFlowWrapper = useRef(null);

  // ── Custom Hooks ────────────────────────────────────────────────────────────
  const { handleNodeHover }                          = useCircuitTracer(setNodes, setEdges);
  const { processGraphData, downloadImage }          = useGraphProcessor(setNodes, setEdges);
  const { isBlastMode, blastRoot, startBlast, resetBlast } = useBlastRadius(nodes, edges, setNodes);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleNodeClick = useCallback((nodeId) => {
    const node = nodes.find(n => n.id === nodeId);
    setSelectedNode(node || null);
    if (isBlastMode) startBlast(nodeId);
  }, [isBlastMode, nodes, startBlast]);

  const handleToggleBlast = useCallback((nodeId) => {
    if (isBlastMode && blastRoot === nodeId) {
      resetBlast();
    } else {
      startBlast(nodeId);
    }
  }, [isBlastMode, blastRoot, startBlast, resetBlast]);

  const handleCloseDetailPanel = useCallback(() => {
    setSelectedNode(null);
    resetBlast();
  }, [resetBlast]);

  const handleIngest = async () => {
    setLoading(true);
    try {
      let res;
      if (ingestTab === 'GITHUB' && githubUrl) {
        res = await axios.post('/api/analyze/github', { url: githubUrl });
      } else if (ingestTab === 'LOCAL' && folderPath) {
        res = await axios.post('/api/analyze/folder', { path: folderPath });
      } else {
        setLoading(false);
        return;
      }
      setRawGraph(res.data.graph);
    } catch (err) {
      console.error(err);
      alert('Failed to analyze repository.');
    } finally {
      setLoading(false);
    }
  };

  const handleZipUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setUploadProgress(0);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await axios.post('/api/analyze/zip', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const pct = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          setUploadProgress(pct);
        },
        timeout: 600000, // 10 minutes
      });
      setRawGraph(res.data.graph);
    } catch (err) {
      console.error(err);
      alert('Failed to analyze ZIP file.');
    } finally {
      setLoading(false);
      setUploadProgress(null);
    }
  };

  // Re-process whenever any graph control changes
  useEffect(() => {
    if (rawGraph) processGraphData(rawGraph, viewMode, layoutMode, showUnconnectedNodes, filters);
  }, [rawGraph, viewMode, layoutMode, showUnconnectedNodes, filters, processGraphData]);

  // ── Derived State ────────────────────────────────────────────────────────────
  const isIngestDisabled = (ingestTab === 'GITHUB' && !githubUrl) || (ingestTab === 'LOCAL' && !folderPath);
  const hasNoGraph = !rawGraph || nodes.length === 0;

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="flex w-screen h-screen bg-[#07090e] text-gray-200 font-mono overflow-hidden relative">

      <Sidebar
        ingestTab={ingestTab}           setIngestTab={setIngestTab}
        folderPath={folderPath}         setFolderPath={setFolderPath}
        githubUrl={githubUrl}           setGithubUrl={setGithubUrl}
        loading={loading}               isIngestDisabled={isIngestDisabled}
        onIngest={handleIngest}         onZipUpload={handleZipUpload}
        viewMode={viewMode}             setViewMode={setViewMode}
        layoutMode={layoutMode}         setLayoutMode={setLayoutMode}
        filters={filters}              setFilters={setFilters}
        showUnconnectedNodes={showUnconnectedNodes}
        setShowUnconnectedNodes={setShowUnconnectedNodes}
      />

      <main className="flex-1 relative bg-[#07090e]">
        {/* Ambient particle background */}
        <Particles
          id="tsparticles"
          particlesLoaded={() => {}}
          init={particlesInit}
          options={{
            background: { color: { value: 'transparent' } },
            fpsLimit: 60,
            particles: {
              color: { value: '#ffffff' },
              links: { enable: false },
              move: { direction: 'top', enable: true, random: false, speed: 0.1, straight: false },
              number: { density: { enable: true, area: 800 }, value: 60 },
              opacity: { value: 0.1, random: true },
              shape: { type: 'circle' },
              size: { value: { min: 0.5, max: 1.5 } },
            },
            detectRetina: true,
          }}
          className="absolute inset-0 z-0 pointer-events-none"
        />

        {/* Dotted grid */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] pointer-events-none z-0" />

        {/* Empty state */}
        {hasNoGraph && !loading && <EmptyState />}

        {loading && (
          <div className="absolute inset-y-0 right-0 left-[380px] bg-[#070a13]/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
            <div className="w-16 h-16 border-4 border-[#1a2333] border-t-[#00f2fe] rounded-full animate-spin mb-4" />
            {uploadProgress !== null && uploadProgress < 100 ? (
              <>
                <p className="text-gray-300 font-bold tracking-widest text-sm mb-3">
                  {uploadProgress < 30 ? 'UPLOADING ZIP...' :
                   uploadProgress < 70 ? 'TRANSFERRING DATA...' :
                   'ALMOST THERE...'}
                </p>
                <div className="w-64 bg-[#1a2333] rounded-full h-2 overflow-hidden">
                  <div
                    className="h-2 bg-gradient-to-r from-[#00f2fe] to-[#4facfe] rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </>
            ) : (
              <p className="text-gray-300 font-bold tracking-widest text-sm animate-pulse">INGESTING CODEBASE...</p>
            )}
          </div>
        )}

        {/* React Flow canvas */}
        <div className="absolute inset-0 z-10" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes} edges={edges}
            onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
            onNodeClick={(_, node) => handleNodeClick(node.id)}
            onNodeMouseEnter={(_, node) => handleNodeHover(node.id, true)}
            onNodeMouseLeave={(_, node) => handleNodeHover(node.id, false)}
            nodeTypes={nodeTypes} edgeTypes={edgeTypes}
            colorMode="dark" minZoom={0.05} maxZoom={4}
            style={{ background: 'transparent' }}
          >
            {!hasNoGraph && <LegendPanel />}
            {!hasNoGraph && <CanvasToolbar onDownload={downloadImage} />}
          </ReactFlow>

          <NodeDetailPanel
            selectedNode={selectedNode}
            edges={edges}
            nodes={nodes}
            isBlastMode={isBlastMode}
            blastRoot={blastRoot}
            onClose={handleCloseDetailPanel}
            onToggleBlast={handleToggleBlast}
          />
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return <ReactFlowProvider><FlowApp /></ReactFlowProvider>;
}
