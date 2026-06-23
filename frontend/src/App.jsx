import React, { useState, useCallback, useRef } from 'react';
import { 
  ReactFlow, Controls, Background, useNodesState, useEdgesState,
  Handle, Position, MarkerType, useReactFlow, ReactFlowProvider, Panel, getBezierPath
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Cloud, Globe, Folder, Activity, Code, Server, Database, MessageSquare, Download, AlertTriangle, GitBranch, Layers, Share2, Search, Settings, Filter, X, ZoomIn, ZoomOut, Maximize, FileJson, Target, Code2, Dna, Network } from 'lucide-react';
import axios from 'axios';
import dagre from 'dagre';
import { toPng } from 'html-to-image';
import Particles from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { motion, AnimatePresence } from "framer-motion";
import ELK from 'elkjs/lib/elk.bundled.js';
import './App.css'; 

// --- Custom Nodes ---
const CustomNode = ({ data, id }) => {
  const type = data.type;
  
  let baseStyle = "flex flex-col p-2 px-3 min-w-[180px] bg-[#070a13]/90 backdrop-blur-md text-white font-mono text-[11px] transition-all duration-300 relative border overflow-hidden rounded-md will-change-transform";
  let borderClass = "";
  let icon = null;
  let labelColor = "";
  
  let badgeClass = "";
  
  if (type === 'SERVICE') {
    borderClass = "border-[#00f2fe] shadow-[0_0_20px_rgba(0,242,254,0.6)]";
    icon = <Server size={14} className="text-[#00f2fe]" />;
    badgeClass = "bg-[#00f2fe]/10 text-[#00f2fe]";
  } else if (type === 'DATABASE') {
    borderClass = "border-[#b44fff] shadow-[0_0_20px_rgba(180,79,255,0.6)] rounded-xl";
    icon = <Database size={14} className="text-[#b44fff]" />;
    badgeClass = "bg-[#b44fff]/10 text-[#b44fff]";
  } else if (type === 'KAFKA_TOPIC') {
    borderClass = "border-[#ff6b35] shadow-[0_0_20px_rgba(255,107,53,0.6)]";
    icon = <Share2 size={14} className="text-[#ff6b35]" />;
    badgeClass = "bg-[#ff6b35]/10 text-[#ff6b35]";
  } else if (type === 'CLASS') {
    borderClass = "border-[#00ff87] shadow-[0_0_15px_rgba(0,255,135,0.4)]";
    icon = <Code size={14} className="text-[#00ff87]" />;
    badgeClass = "bg-[#00ff87]/10 text-[#00ff87]";
  } else {
    borderClass = "border-[#3d4a5c] shadow-[0_0_10px_rgba(61,74,92,0.5)]";
    icon = <Folder size={14} className="text-gray-400" />;
    badgeClass = "bg-gray-500/10 text-gray-400";
  }

  if (data.dimmed) baseStyle += " opacity-20 grayscale";
  if (data.highlighted) baseStyle += " z-10 opacity-100 drop-shadow-[0_0_20px_currentColor]";
  if (data.isBlastRoot) {
    borderClass = "border-[#ff0055] shadow-[0_0_30px_rgba(255,0,85,0.8)]";
    baseStyle += " animate-pulse";
  } else if (data.isBlastAffected) {
    // Distinct crimson glow for affected nodes (so it doesn't look like Kafka orange)
    borderClass = "border-[#ff2a5f] shadow-[0_0_20px_rgba(255,42,95,0.8)]";
  } else if (type === 'SERVICE') {
    baseStyle += " animate-breathing";
  }

  return (
    <motion.div 
      className={`${baseStyle} ${borderClass} cursor-pointer`}
      whileHover={{ scale: 1.05 }}
      layout
    >
      <Handle type="target" position={Position.Top} className="!bg-transparent !border-none" />
      
      <div className="flex items-center gap-3 w-full">
        {/* Left Icon Box */}
        <div className="w-10 h-10 rounded border border-white/10 bg-white/5 flex items-center justify-center shrink-0">
          {icon}
        </div>
        
        {/* Right Info Section */}
        <div className="flex flex-col gap-1 overflow-hidden">
          <span className={`w-max px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest ${badgeClass}`}>
            {type}
          </span>
          <span className="font-semibold text-gray-100 tracking-wide text-xs truncate">
            {data.label}
          </span>
        </div>
      </div>
      
      <Handle type="source" position={Position.Bottom} className="!bg-transparent !border-none" />
    </motion.div>
  );
};

const nodeTypes = { custom: CustomNode };

// --- Custom Edge ---
const CustomAnimatedEdge = ({
  id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style = {}, markerEnd, data
}) => {
  // Deterministic per-edge offset so edges are staggered, not in sync
  const edgeHash = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const globalOffset = (edgeHash % 100) / 100; // 0.00 to 0.99 unique per edge

  const [edgePath] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });

  // Edge type configs:
  // FEIGN/REST_CALL: steady request dots, cyan, moderate pace
  // KAFKA_PUBLISH: fast fire-and-forget orange dots bursting from source
  // KAFKA_CONSUME: slow pull, dots meander toward consumer
  // JPA_RELATION: slow purple dots, heavy DB query
  // INJECTION: subtle gray dots, internal wiring
  let dotColor = '#6b7280';
  let dur = 3;
  let dotCount = 0;
  let dotRadius = 3;

  if (data?.type === 'FEIGN' || data?.type === 'REST_CALL') {
    dotColor = '#00f2fe'; dur = 2.5; dotCount = 3; dotRadius = 3;
  } else if (data?.type === 'KAFKA_PUBLISH') {
    dotColor = '#ff6b35'; dur = 1.2; dotCount = 4; dotRadius = 3.5;
  } else if (data?.type === 'KAFKA_CONSUME') {
    dotColor = '#ffa64d'; dur = 3.5; dotCount = 2; dotRadius = 2.5;
  } else if (data?.type === 'JPA_RELATION') {
    dotColor = '#b44fff'; dur = 4.5; dotCount = 2; dotRadius = 3;
  } else if (data?.type === 'INJECTION') {
    dotColor = '#4ade80'; dur = 5; dotCount = 1; dotRadius = 2;
  }

  const durStr = `${dur}s`;

  return (
    <>
      <path
        id={id}
        style={style}
        className={`react-flow__edge-path ${data?.dimmed ? 'dimmed' : ''} ${data?.circuitTracer ? 'circuit-tracer' : ''}`}
        d={edgePath}
        markerEnd={markerEnd}
      />
      {!data?.dimmed && dotCount > 0 && Array.from({ length: dotCount }).map((_, i) => {
        // Each dot within an edge is evenly spaced, plus a global per-edge offset
        const dotOffset = globalOffset + (i / dotCount);
        // Wrap to [0, dur) range using modulo-style: begin is negative to start partway through
        const beginSec = -((dotOffset % 1) * dur);
        return (
          <circle key={i} r={dotRadius} fill={dotColor} style={{ filter: `drop-shadow(0 0 4px ${dotColor})` }}>
            <animateMotion
              dur={durStr}
              repeatCount="indefinite"
              path={edgePath}
              begin={`${beginSec.toFixed(3)}s`}
            />
          </circle>
        );
      })}
    </>
  );
};

const edgeTypes = { custom: CustomAnimatedEdge };

const getLayoutedElements = async (nodes, edges, layoutMode, viewMode) => {
  const nodeWidth  = 250;
  const nodeHeight = 80;

  // LAYERS
  const kafkas = nodes.filter(n => n.data.type === 'KAFKA_TOPIC');
  const services = nodes.filter(n => n.data.type === 'SERVICE');
  const dbs = nodes.filter(n => n.data.type === 'DATABASE');
  const classes = nodes.filter(n => n.data.type === 'CLASS');
  const others = nodes.filter(n => !['SERVICE', 'KAFKA_TOPIC', 'DATABASE', 'CLASS'].includes(n.data.type));

  const isMonolith = services.length === 1 && kafkas.length === 0;

  if (layoutMode === 'SEMANTIC' && viewMode === 'CLASS' && isMonolith) {
    // For Monoliths, Dagre works beautifully to map the simple top-to-bottom call hierarchy
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({ rankdir: 'TB', nodesep: 60, ranksep: 120 });

    nodes.forEach((node) => {
      dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const positioned = nodes.map((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      return {
        ...node,
        position: {
          x: nodeWithPosition.x - nodeWidth / 2,
          y: nodeWithPosition.y - nodeHeight / 2,
        },
      };
    });

    return { nodes: positioned };
  }

  const positioned = [];

  if (layoutMode === 'FORCE') {
    const centerX = 0;
    const centerY = 0;
    
    if (isMonolith) {
       // --- ONION ARCHITECTURE (MONOLITH FORCE ORBIT) ---
       // Core: Database
       dbs.forEach((db, i) => {
         const angle = (i / Math.max(1, dbs.length)) * 2 * Math.PI;
         const r = dbs.length > 1 ? 150 : 0;
         positioned.push({ ...db, position: { x: centerX + r * Math.cos(angle) - nodeWidth/2, y: centerY + r * Math.sin(angle) - nodeHeight/2 } });
       });
       
       // Inner Orbit: Repositories
       const repos = classes.filter(c => c.data.label.toLowerCase().includes('repository') || c.data.label.toLowerCase().includes('dao'));
       const repoRadius = Math.max(300, (repos.length * (nodeWidth + 100)) / (2 * Math.PI));
       repos.forEach((n, i) => {
         const angle = (i / Math.max(1, repos.length)) * 2 * Math.PI;
         positioned.push({ ...n, position: { x: centerX + repoRadius * Math.cos(angle) - nodeWidth/2, y: centerY + repoRadius * Math.sin(angle) - nodeHeight/2 } });
       });
       
       // Middle Orbit: Services
       const svcs = classes.filter(c => c.data.label.toLowerCase().includes('service') && !repos.includes(c));
       const svcsRadius = Math.max(repoRadius + 300, (svcs.length * (nodeWidth + 100)) / (2 * Math.PI));
       svcs.forEach((n, i) => {
         const angle = (i / Math.max(1, svcs.length)) * 2 * Math.PI;
         positioned.push({ ...n, position: { x: centerX + svcsRadius * Math.cos(angle) - nodeWidth/2, y: centerY + svcsRadius * Math.sin(angle) - nodeHeight/2 } });
       });
       
       // Outer Orbit: Controllers
       const ctrls = classes.filter(c => c.data.label.toLowerCase().includes('controller') || c.data.label.toLowerCase().includes('resource'));
       const ctrlRadius = Math.max(svcsRadius + 300, (ctrls.length * (nodeWidth + 100)) / (2 * Math.PI));
       ctrls.forEach((n, i) => {
         const angle = (i / Math.max(1, ctrls.length)) * 2 * Math.PI;
         positioned.push({ ...n, position: { x: centerX + ctrlRadius * Math.cos(angle) - nodeWidth/2, y: centerY + ctrlRadius * Math.sin(angle) - nodeHeight/2 } });
       });
       
       // Outer Belt: Unassigned, Macro Nodes, etc
       const unassigned = classes.filter(c => !repos.includes(c) && !svcs.includes(c) && !ctrls.includes(c));
       const outerBelt = [...unassigned, ...services, ...kafkas, ...others];
       const beltRadius = Math.max(ctrlRadius + 400, (outerBelt.length * (nodeWidth + 100)) / (2 * Math.PI));
       
       outerBelt.forEach((n, i) => {
         const angle = (i / Math.max(1, outerBelt.length)) * 2 * Math.PI;
         positioned.push({ ...n, position: { x: centerX + beltRadius * Math.cos(angle) - nodeWidth/2, y: centerY + beltRadius * Math.sin(angle) - nodeHeight/2 } });
       });

       return { nodes: positioned };
    }

    // --- MICROSERVICES POLAR WEDGE ORBIT ---
    // 1. Place Kafkas in the exact center
    kafkas.forEach((n, i) => {
      const angle = (i / Math.max(1, kafkas.length)) * 2 * Math.PI;
      const radius = kafkas.length > 1 ? 150 : 0;
      positioned.push({
        ...n,
        position: { x: centerX + radius * Math.cos(angle) - nodeWidth/2, y: centerY + radius * Math.sin(angle) - nodeHeight/2 }
      });
    });

    // Determine the unique service slices
    const serviceNames = Array.from(new Set(services.map(s => s.id.toLowerCase())));
    if (classes.some(c => !serviceNames.includes(c.data?.metadata?.serviceName?.toLowerCase() || 'unknown'))) {
       serviceNames.push('unknown');
    }
    
    const numSlices = Math.max(1, serviceNames.length);
    const sliceAngle = (2 * Math.PI) / numSlices;

    // 2. Place Services in Orbit 1
    const serviceRadius = Math.max(500, (numSlices * (nodeWidth + 150)) / (2 * Math.PI));
    services.forEach(n => {
      let svcIdx = serviceNames.indexOf(n.id.toLowerCase());
      if (svcIdx === -1) svcIdx = 0;
      
      const angle = svcIdx * sliceAngle + (sliceAngle / 2); // Center of slice
      const x = centerX + serviceRadius * Math.cos(angle);
      const y = centerY + serviceRadius * Math.sin(angle);
      positioned.push({
        ...n,
        position: { x: x - nodeWidth/2, y: y - nodeHeight/2 }
      });
    });

    // 3. Place Databases in Orbit 2
    const dbRadius = serviceRadius + 300;
    dbs.forEach(db => {
      const edge = edges.find(e => (e.source === db.id || e.target === db.id) && e.data?.type === 'JPA_RELATION');
      let svcIdx = 0; // Default to first slice if unattached
      
      if (edge) {
        const connectedId = edge.source === db.id ? edge.target : edge.source;
        // Try finding it directly in services
        let foundIdx = serviceNames.indexOf(connectedId.toLowerCase());
        if (foundIdx === -1) {
           // Maybe it connected to a class?
           const cls = classes.find(c => c.id === connectedId);
           if (cls) {
              foundIdx = serviceNames.indexOf((cls.data?.metadata?.serviceName || 'unknown').toLowerCase());
           }
        }
        if (foundIdx !== -1) svcIdx = foundIdx;
      }
      
      const angle = svcIdx * sliceAngle + (sliceAngle / 2);
      const x = centerX + dbRadius * Math.cos(angle);
      const y = centerY + dbRadius * Math.sin(angle);
      positioned.push({
        ...db,
        position: { x: x - nodeWidth/2, y: y - nodeHeight/2 }
      });
    });

    // 4. Place Classes in their respective Wedges!
    let maxGlobalRadius = dbRadius;
    const classBaseRadius = dbRadius + 400;
    
    serviceNames.forEach((svcName, idx) => {
       const svcClasses = classes.filter(c => (c.data?.metadata?.serviceName?.toLowerCase() || 'unknown') === svcName);
       if (svcClasses.length === 0) return;
       
       // Sort classes to cluster controllers, services, repos together visually within the wedge
       svcClasses.sort((a, b) => {
          const tA = a.data?.label || '';
          const tB = b.data?.label || '';
          return tA.localeCompare(tB);
       });
       
       // Keep padding so wedges don't bleed into each other
       const paddingAngle = Math.min(0.15, sliceAngle * 0.1); 
       const wedgeStart = idx * sliceAngle + paddingAngle;
       const wedgeEnd = (idx + 1) * sliceAngle - paddingAngle;
       const wedgeSpan = wedgeEnd - wedgeStart;
       
       let currentRadius = classBaseRadius;
       let remainingClasses = [...svcClasses];
       
       while (remainingClasses.length > 0) {
          const arcLength = currentRadius * wedgeSpan;
          const itemsThisArc = Math.max(1, Math.floor(arcLength / (nodeWidth + 80)));
          
          const batch = remainingClasses.splice(0, itemsThisArc);
          
          batch.forEach((c, i) => {
             const angle = batch.length === 1 
                 ? wedgeStart + wedgeSpan / 2 
                 : wedgeStart + (i / (batch.length - 1)) * wedgeSpan;
                 
             const x = centerX + currentRadius * Math.cos(angle);
             const y = centerY + currentRadius * Math.sin(angle);
             positioned.push({
               ...c,
               position: { x: x - nodeWidth/2, y: y - nodeHeight/2 }
             });
          });
          
          currentRadius += nodeHeight + 150; // Step out for the next arc row
       }
       
       if (currentRadius > maxGlobalRadius) maxGlobalRadius = currentRadius;
    });

    // 5. Fallback for any others
    const outerRadius = maxGlobalRadius + 400;
    others.forEach((n, i) => {
      const angle = (i / Math.max(1, others.length)) * 2 * Math.PI;
      positioned.push({
        ...n,
        position: { x: centerX + outerRadius * Math.cos(angle) - nodeWidth/2, y: centerY + outerRadius * Math.sin(angle) - nodeHeight/2 }
      });
    });

    return { nodes: positioned };
  }

  // SEMANTIC LAYOUT for SERVICE mode (layered grid)
  const hGap       = 80;  // horizontal gap
  const vGap       = 160; // vertical gap
  const maxPerRow  = 5;   // max items per row

  const placeGroup = (group, startY, itemsPerRow = maxPerRow) => {
    if (group.length === 0) return startY;
    const rowW = itemsPerRow * (nodeWidth + hGap) - hGap;
    group.forEach((n, i) => {
      const row = Math.floor(i / itemsPerRow);
      const col = i % itemsPerRow;
      const rowCount = Math.min(itemsPerRow, group.length - row * itemsPerRow);
      const rowWidth = rowCount * (nodeWidth + hGap) - hGap;
      const offsetX = (rowW - rowWidth) / 2;
      
      const existing = positioned.find(p => p.id === n.id);
      if (!existing) {
        positioned.push({
          ...n,
          position: {
            x: offsetX + col * (nodeWidth + hGap) - nodeWidth / 2,
            y: startY + row * (nodeHeight + vGap) - nodeHeight / 2,
          },
        });
      }
    });
    const rowsUsed = Math.ceil(group.length / itemsPerRow);
    return startY + rowsUsed * (nodeHeight + vGap) + vGap;
  };

  const placeClassesHierarchy = (clsGroup, startY) => {
    if (clsGroup.length === 0) return startY;
    
    // Group classes by service
    const serviceGroups = {};
    clsGroup.forEach(c => {
      const svcName = c.data?.metadata?.serviceName || 'unknown';
      if (!serviceGroups[svcName]) serviceGroups[svcName] = [];
      serviceGroups[svcName].push(c);
    });

    let currentX = 0;
    const MAX_X = 5 * (nodeWidth + hGap); // Align width with the top 5-per-row grid
    
    let currentRowStartY = startY;
    let nextRowStartY = startY;

    Object.keys(serviceGroups).forEach(svcName => {
       const group = serviceGroups[svcName];
       
       // Wrap to next row of groups if we've gone too far right!
       if (currentX > 0 && currentX + nodeWidth > MAX_X) {
         currentX = 0;
         currentRowStartY = nextRowStartY + vGap * 2;
       }
       
       // Sort into tiers
       const controllers = group.filter(c => c.data.label.toLowerCase().includes('controller') || c.data.label.toLowerCase().includes('resource'));
       const svcs = group.filter(c => c.data.label.toLowerCase().includes('service') && !controllers.includes(c));
       const repositories = group.filter(c => c.data.label.toLowerCase().includes('repository') || c.data.label.toLowerCase().includes('dao'));
       const unassigned = group.filter(c => !controllers.includes(c) && !svcs.includes(c) && !repositories.includes(c));

       const tiers = [controllers, svcs, repositories, unassigned];
       
       // Layout this group as a vertical column of grids
       let localY = currentRowStartY;
       let maxColWidth = 0;
       
       tiers.forEach(tier => {
         if (tier.length === 0) return;
         
         const itemsPerRow = 3; // Keep columns relatively narrow
         tier.forEach((n, i) => {
           const row = Math.floor(i / itemsPerRow);
           const col = i % itemsPerRow;
           
           const existing = positioned.find(p => p.id === n.id);
           if (!existing) {
             positioned.push({
               ...n,
               position: {
                 x: currentX + col * (nodeWidth + hGap),
                 y: localY + row * (nodeHeight + vGap)
               }
             });
           }
           
           const colWidth = (col + 1) * (nodeWidth + hGap);
           if (colWidth > maxColWidth) maxColWidth = colWidth;
         });
         
         const rowsUsed = Math.ceil(tier.length / itemsPerRow);
         localY += rowsUsed * (nodeHeight + vGap) + vGap; // Add extra gap between tiers
       });
       
       if (localY > nextRowStartY) nextRowStartY = localY;
       currentX += maxColWidth + hGap * 2; // Advance X for the next service group
    });
    
    return nextRowStartY;
  };

  let currentY = 0;
  
  // Strict Horizontal Layers!
  if (services.length) currentY = placeGroup(services, currentY, maxPerRow);
  if (kafkas.length)   currentY = placeGroup(kafkas, currentY, 3);
  if (dbs.length)      currentY = placeGroup(dbs, currentY, maxPerRow);
  if (classes.length)  currentY = placeClassesHierarchy(classes, currentY);
  if (others.length)   placeGroup(others, currentY, maxPerRow);

  return { nodes: positioned };
};

// --- Legend Panel ---
const LegendPanel = () => (
  <Panel position="bottom-left" className="bg-[#0b0f19]/90 backdrop-blur-md border border-white/10 p-5 rounded-xl shadow-2xl font-mono text-[11px] text-gray-300 w-64 pointer-events-none">
    <h3 className="text-gray-400 font-bold tracking-widest mb-4">NODE TYPOLOGY</h3>
    <div className="flex flex-col gap-3 mb-6">
      <div className="flex items-center gap-3"><div className="w-4 h-4 rounded-sm bg-[#00f2fe] shadow-[0_0_10px_#00f2fe]"></div> <span className="text-sm">Service</span></div>
      <div className="flex items-center gap-3"><div className="w-4 h-4 rounded-sm bg-[#00ff87] shadow-[0_0_10px_#00ff87]"></div> <span className="text-sm">Class</span></div>
      <div className="flex items-center gap-3"><div className="w-4 h-4 rounded-md bg-[#b44fff] shadow-[0_0_10px_#b44fff]"></div> <span className="text-sm">Database</span></div>
      <div className="flex items-center gap-3"><div className="w-4 h-4 rounded-sm bg-[#ff6b35] shadow-[0_0_10px_#ff6b35]"></div> <span className="text-sm">Kafka Topic</span></div>
      <div className="flex items-center gap-3"><div className="w-4 h-4 rounded-sm bg-[#3d4a5c]"></div> <span className="text-sm">Package</span></div>
    </div>
    
    <h3 className="text-gray-400 font-bold tracking-widest mb-4">CONNECTION LINES</h3>
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3"><div className="w-8 border-t-2 border-dashed border-[#00f2fe]"></div> <span>Feign / REST</span></div>
      <div className="flex items-center gap-3"><div className="w-8 border-t-2 border-dashed border-[#ff6b35]"></div> <span>Kafka Feed</span></div>
      <div className="flex items-center gap-3"><div className="w-8 border-t-2 border-solid border-[#b44fff]"></div> <span>JPA Table</span></div>
      <div className="flex items-center gap-3"><div className="w-8 border-t border-solid border-[#3d4a5c]"></div> <span>Spring Inject</span></div>
    </div>
  </Panel>
);

// --- Main Component ---
function FlowApp() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(false);
  
  const [ingestTab, setIngestTab] = useState('LOCAL'); // LOCAL or GITHUB
  const [githubUrl, setGithubUrl] = useState('');
  const [folderPath, setFolderPath] = useState('');
  
  const [result, setResult] = useState(null);
  const [rawGraph, setRawGraph] = useState(null);
  const [viewMode, setViewMode] = useState('SERVICE'); // SERVICE or CLASS
  const [layoutMode, setLayoutMode] = useState('SEMANTIC'); // SEMANTIC or FORCE
  const [showUnconnectedNodes, setShowUnconnectedNodes] = useState(false);
  
  // Filters State
  const [filters, setFilters] = useState({
    FEIGN: true,
    KAFKA_PUBLISH: true,
    KAFKA_CONSUME: true,
    REST: true,
    JPA_RELATION: true,
    INJECTION: true
  });
  
  // Blast Radius State
  const [isBlastMode, setIsBlastMode] = useState(false);
  const [blastRoot, setBlastRoot] = useState(null);
  const [blastAffectedNodes, setBlastAffectedNodes] = useState(new Set());
  
  // Sidebar State
  const [selectedNode, setSelectedNode] = useState(null);
  
  const reactFlowWrapper = useRef(null);
  const [init, setInit] = useState(false);
  const particlesInit = useCallback(async engine => {
    await loadSlim(engine);
    setInit(true);
  }, []);
  
  const { fitView, zoomIn, zoomOut } = useReactFlow();

  // Circuit Tracer Logic
  const handleNodeHover = useCallback((nodeId, isHovering) => {
    if (!isHovering) {
      setNodes(nds => nds.map(n => ({ ...n, data: { ...n.data, dimmed: false, highlighted: false } })));
      setEdges(eds => eds.map(e => ({ ...e, style: { ...e.style, opacity: 1 }, data: { ...e.data, dimmed: false, circuitTracer: false } })));
      return;
    }

    setEdges(eds => {
      const connectedNodes = new Set([nodeId]);
      const circuitEdges = new Set();
      
      const trace = (currNode) => {
        let added = false;
        eds.forEach(e => {
          if (e.source === currNode && !circuitEdges.has(e.id)) { circuitEdges.add(e.id); connectedNodes.add(e.target); added = true; trace(e.target); }
          if (e.target === currNode && !circuitEdges.has(e.id)) { circuitEdges.add(e.id); connectedNodes.add(e.source); added = true; trace(e.source); }
        });
      };
      trace(nodeId);

      setNodes(nds => nds.map(n => ({
        ...n,
        data: { ...n.data, dimmed: !connectedNodes.has(n.id), highlighted: connectedNodes.has(n.id) }
      })));

      return eds.map(e => {
        const isConnected = circuitEdges.has(e.id);
        return {
          ...e,
          style: { ...e.style, opacity: isConnected ? 1 : 0.1 },
          data: { ...e.data, dimmed: !isConnected, circuitTracer: isConnected }
        };
      });
    });
  }, [setNodes, setEdges]);

  const handleNodeClick = useCallback((nodeId) => {
    const node = nodes.find(n => n.id === nodeId);
    setSelectedNode(node || null);
    // If we click a new node while blast mode is active, maybe reset or switch the blast root
    if (isBlastMode) {
      setBlastRoot(nodeId);
      setBlastAffectedNodes(new Set([nodeId]));
    }
  }, [isBlastMode, nodes]);

  // Blast Radius Effect
  React.useEffect(() => {
    if (!isBlastMode || !blastRoot) return;

    const interval = setInterval(() => {
      setBlastAffectedNodes(prev => {
        const nextSet = new Set(prev);
        let changed = false;
        
        for (const e of edges) {
          const targetNode = nodes.find(n => n.id === e.target);

          // 1. Upstream propagation: If a dependency fails, the caller fails.
          if (e.data?.type !== 'KAFKA_CONSUME') {
            if (prev.has(e.target) && !prev.has(e.source)) {
              nextSet.add(e.source);
              changed = true;
              break;
            }
          }

          // 2. Downstream Highlights: If a service goes down, show its DBs and Kafka topics
          if (prev.has(e.source) && !prev.has(e.target)) {
            if (targetNode?.data?.type === 'DATABASE' || targetNode?.data?.type === 'KAFKA_TOPIC') {
              nextSet.add(e.target);
              changed = true;
              break;
            }
            
            // 3. Kafka Consumers ONLY fail if the Topic itself was the root cause
            if (e.data?.type === 'KAFKA_CONSUME' && blastRoot === e.source) {
              nextSet.add(e.target);
              changed = true;
              break;
            }
          }
        }

        if (!changed) clearInterval(interval);
        return nextSet;
      });
    }, 400);

    return () => clearInterval(interval);
  }, [isBlastMode, blastRoot, edges]);

  // Sync node visuals with state
  React.useEffect(() => {
    setNodes(nds => nds.map(n => ({
      ...n,
      data: { 
        ...n.data, 
        isBlastRoot: isBlastMode && blastRoot === n.id,
        isBlastAffected: isBlastMode && blastRoot !== n.id && blastAffectedNodes.has(n.id)
      }
    })));
  }, [isBlastMode, blastRoot, blastAffectedNodes, setNodes]);

  const processGraphData = useCallback((graphData, mode, layoutMode, showUnconnectedNodes, activeFilters) => {
    if (!graphData || !graphData.nodes) return;
    
    let filteredNodes = graphData.nodes;
    
    // 1. Instantly apply all user checkbox filters to the raw edges!
    const activeRawEdges = graphData.edges.filter(e => {
        if (e.type === 'REST_CALL') return activeFilters?.['REST'] !== false;
        if (activeFilters && activeFilters[e.type] !== undefined) return activeFilters[e.type];
        return true; // if it's an unknown structural edge, keep it
    });
    
    let filteredEdges = activeRawEdges;

    if (mode === 'CLASS') {
      filteredNodes = graphData.nodes;
      
      const syntheticEdges = [];
      const classes = filteredNodes.filter(n => n.type === 'CLASS');
      const services = filteredNodes.filter(n => n.type === 'SERVICE');
      
      // Universally tie every class to its parent SERVICE so they are visually connected!
      classes.forEach(c => {
         const svcName = c.data?.metadata?.serviceName;
         if (svcName) {
            const svcNode = services.find(s => s.id.toLowerCase() === svcName.toLowerCase());
            if (svcNode) {
               syntheticEdges.push({
                 id: `svc-class-${svcNode.id}-${c.id}`,
                 source: svcNode.id,
                 target: c.id,
                 type: 'SERVICE_TO_CLASS',
                 data: { type: 'SERVICE_TO_CLASS' }
               });
            }
         }
      });

      if (layoutMode === 'FORCE') {
         let rescuedDbEdges = [];
         const dbs = graphData.nodes.filter(n => n.type === 'DATABASE');
         
         dbs.forEach(db => {
           const dbEdge = graphData.edges.find(e => e.target === db.id && e.type === 'JPA_RELATION');
           if (dbEdge) {
             const serviceName = dbEdge.source;
             const serviceClasses = classes.filter(n => n.data?.metadata?.serviceName?.toLowerCase() === serviceName?.toLowerCase());
             if (serviceClasses.length > 0) {
                let targetClasses = serviceClasses.filter(n => n.label.toLowerCase().includes('repository'));
                if (targetClasses.length === 0) targetClasses = [serviceClasses[0]];

                targetClasses.forEach(repo => {
                  rescuedDbEdges.push({
                    id: `class-db-${repo.id}-${db.id}`,
                    source: repo.id,
                    target: db.id,
                    type: 'JPA_RELATION',
                    data: { type: 'JPA_RELATION' }
                  });
                });
             }
           }
         });
         const feignEdges = activeRawEdges.filter(e => e.type === 'FEIGN' || e.type === 'REST_CALL');
         feignEdges.forEach(feign => {
            const targetService = feign.target;
            const targetClasses = classes.filter(n => n.data?.metadata?.serviceName?.toLowerCase() === targetService?.toLowerCase());
            if (targetClasses.length > 0) {
               let controllers = targetClasses.filter(n => n.label.toLowerCase().includes('controller'));
               if (controllers.length === 0) controllers = [targetClasses[0]];
               
               controllers.forEach(ctrl => {
                  rescuedDbEdges.push({
                    id: `rescued-feign-${feign.source}-${ctrl.id}`,
                    source: feign.source,
                    target: ctrl.id,
                    type: feign.type,
                    data: { type: feign.type }
                  });
               });
            }
         });

         const kafkaPubs = activeRawEdges.filter(e => e.type === 'KAFKA_PUBLISH');
         const kafkaCons = activeRawEdges.filter(e => e.type === 'KAFKA_CONSUME');
         
         kafkaPubs.forEach(pub => {
            const topicId = pub.target;
            const consumingServices = kafkaCons.filter(c => c.source === topicId).map(c => c.target);
            
            consumingServices.forEach(targetService => {
               const targetClasses = classes.filter(n => n.data?.metadata?.serviceName?.toLowerCase() === targetService?.toLowerCase());
               if (targetClasses.length > 0) {
                  let listeners = targetClasses.filter(n => n.label.toLowerCase().includes('listener') || n.label.toLowerCase().includes('service'));
                  if (listeners.length === 0) listeners = [targetClasses[0]];
                  
                  listeners.forEach(listener => {
                     rescuedDbEdges.push({
                        id: `rescued-kafka-${pub.source}-${listener.id}`,
                        source: pub.source,
                        target: listener.id,
                        type: 'KAFKA_PUBLISH',
                        data: { type: 'KAFKA_PUBLISH' }
                     });
                  });
               }
            });
         });
         
         const validIds = new Set(filteredNodes.map(n => n.id));
         
         // In FORCE mode, we WANT the original macro edges (Service->DB, Service->Service) so the inner ring is connected!
         // We also include our rescued direct class-to-class edges!
         filteredEdges = [
            ...activeRawEdges.filter(e => validIds.has(e.source) && validIds.has(e.target)),
            ...rescuedDbEdges,
            ...syntheticEdges
         ];
      } else {
         // SEMANTIC CLASS LAYOUT: Just raw edges + synthetic ties!
         filteredEdges = [...activeRawEdges, ...syntheticEdges];
      }
    } else if (mode === 'SERVICE') {
      filteredNodes = graphData.nodes.filter(n => ['SERVICE', 'DATABASE', 'KAFKA_TOPIC'].includes(n.type));

      // --- Hub-node detection: remove parent/aggregator modules ONLY ---
      // Criteria (must match BOTH to be safe):
      //   1. Node label exactly equals OR contains the full project root name, OR
      //   2. Has outgoing FEIGN edges to > 80% of ALL other services (truly dominant hub)
      // We do NOT check projectRootName.includes(label) — that incorrectly removes real services!
      const serviceNodes = filteredNodes.filter(n => n.type === 'SERVICE');
      const projectRootName = (graphData.projectName || '').toLowerCase().replace(/-main$/, '');
      
      const outgoingFeign = {};
      activeRawEdges.forEach(e => {
        if (e.type === 'FEIGN' || e.type === 'REST_CALL') {
          outgoingFeign[e.source] = (outgoingFeign[e.source] || 0) + 1;
        }
      });

      // Only remove as hub if it connects to >80% of other services (very high bar)
      const hubThreshold = serviceNodes.length > 4 ? serviceNodes.length * 0.8 : Infinity;
      
      const hubNodes = new Set(serviceNodes
        .filter(n => {
          const labelLower = n.label.toLowerCase().replace(/-main$/, '');
          // Only exact match or node label literally contains the full project root name
          const isExactRootMatch = projectRootName && (
            labelLower === projectRootName ||
            labelLower.includes(projectRootName)
          );
          // Hub by edges: must be overwhelming majority
          const isHubByEdges = (outgoingFeign[n.id] || 0) > hubThreshold;
          return isExactRootMatch || isHubByEdges;
        })
        .map(n => n.id));

      // Safety: only remove if > 0 services remain
      if (hubNodes.size > 0 && hubNodes.size < serviceNodes.length) {
        filteredNodes = filteredNodes.filter(n => !hubNodes.has(n.id));
      }

        const validNodeIds = new Set(filteredNodes.map(n => n.id));
      
      // Rescue edges that went THROUGH the hub node (e.g. ServiceA -> Hub -> ServiceB)
      // We'll just wire them directly for a cleaner semantic view
      let rescuedEdges = [];
      hubNodes.forEach(hubId => {
        const incoming = activeRawEdges.filter(e => e.target === hubId && validNodeIds.has(e.source));
        const outgoing = activeRawEdges.filter(e => e.source === hubId && validNodeIds.has(e.target));
        
        // If a service calls the hub, and the hub calls X, wire the service directly to X
        incoming.forEach(inc => {
          outgoing.forEach(out => {
            rescuedEdges.push({
              source: inc.source,
              target: out.target,
              type: out.type,
              id: `rescued-${inc.source}-${out.target}-${out.type}`
            });
          });
        });

        // Also rescue Database edges owned by the hub
        const hubDbs = activeRawEdges.filter(e => e.source === hubId && e.type === 'JPA_RELATION');
        if (hubDbs.length > 0) {
          hubDbs.forEach(e => {
            const target = e.target;
            if (validNodeIds.has(target)) {
              // Find a service to adopt this DB
              const remainingServices = filteredNodes.filter(n => n.type === 'SERVICE');
              
              // Smart DB → service matching by name similarity
              const dbLabel = target.replace(/^db:/, '').replace(/[-_]?dbs?$/i, '').toLowerCase();
              const ownerService = remainingServices.find(svc => {
                const svcName = svc.id.toLowerCase().replace(/[-_]service$/i, '');
                return svcName === dbLabel || svcName.startsWith(dbLabel) || dbLabel.startsWith(svcName);
              });

              if (ownerService) {
                rescuedEdges.push({ ...e, source: ownerService.id, id: `rescued-db-${target}-${ownerService.id}` });
              } else if (remainingServices.length > 0) {
                const leastConnected = remainingServices.reduce((min, n) =>
                  (outgoingFeign[n.id] || 0) < (outgoingFeign[min.id] || 0) ? n : min
                );
                rescuedEdges.push({ ...e, source: leastConnected.id, id: `rescued-${e.source}-${target}-${e.type}` });
              }
            }
          });
        }
      });

      filteredEdges = [
        ...activeRawEdges.filter(e => validNodeIds.has(e.source) && validNodeIds.has(e.target)),
        ...rescuedEdges
      ];
    }

    if (!showUnconnectedNodes) {
      const connectedIds = new Set();
      filteredEdges.forEach(e => {
        connectedIds.add(e.source);
        connectedIds.add(e.target);
      });
      const connectedNodes = filteredNodes.filter(n => {
        // Always keep macro nodes in FORCE orbit mode so they act as anchors!
        if (layoutMode === 'FORCE' && (n.type === 'SERVICE' || n.type === 'KAFKA_TOPIC')) return true;
        return connectedIds.has(n.id);
      });

      // If filtering unconnected nodes removes literally every single node (e.g. a monolith), 
      // fallback to showing the unconnected nodes so the screen isn't just an empty void!
      if (connectedNodes.length > 0) {
        filteredNodes = connectedNodes;
      }
    }

    const newNodes = filteredNodes.map(n => ({
      id: n.id, type: 'custom', position: { x: 0, y: 0 },
      data: { label: n.label, type: n.type, metadata: n.metadata }
    }));

    const newEdges = filteredEdges.map(e => {
      let color = '#4b5563'; // Brighter fallback color
      let strokeWidth = 1;
      let dashed = false;
      
      if (e.type === 'INJECTION') { color = '#94a3b8'; strokeWidth = 1.5; } // Bright slate gray for class connections
      if (e.type === 'FEIGN' || e.type === 'REST_CALL') { color = '#00f2fe'; strokeWidth = 2; dashed = true; }
      if (e.type === 'KAFKA_PUBLISH' || e.type === 'KAFKA_CONSUME') { color = '#ff6b35'; strokeWidth = 2; dashed = true; }
      if (e.type === 'JPA_RELATION') { color = '#b44fff'; strokeWidth = 2; dashed = true; }
      if (e.type === 'SERVICE_TO_CLASS') { color = '#3b82f6'; strokeWidth = 1.5; dashed = true; } // Glowing blue tether

      return {
        id: `${e.source}-${e.target}-${e.type}`,
        source: e.source, target: e.target, type: 'custom',
        animated: false,
        style: { stroke: color, strokeWidth, strokeDasharray: dashed ? "5,5" : "none" },
        data: { type: e.type },
        markerEnd: { type: MarkerType.ArrowClosed, color },
      };
    });

    getLayoutedElements(newNodes, newEdges, layoutMode, mode).then(({ nodes: layoutedNodes }) => {
      setNodes(layoutedNodes);
      setEdges(newEdges);
      setTimeout(() => fitView({ duration: 200, padding: 0.2 }), 50);
    });
  }, [setNodes, setEdges, fitView]);

  const downloadImage = useCallback(async () => {
    // 1. Zoom out completely to ensure the whole graph is rendered in the DOM viewport bounds
    fitView({ padding: 0.1, duration: 0 });
    
    // 2. Wait for the React Flow transform to settle
    setTimeout(async () => {
      const el = document.querySelector('.react-flow');
      if (!el) return;
      
      try {
        const dataUrl = await toPng(el, {
          backgroundColor: '#070a13',
          quality: 1.0,
          pixelRatio: 3, // High resolution (3x)
          filter: (node) => {
            // Exclude the floating UI panels and controls from the final screenshot
            if (node.classList?.contains('react-flow__panel') || 
                node.classList?.contains('react-flow__controls')) {
              return false;
            }
            return true;
          }
        });
        
        const link = document.createElement('a');
        link.download = `rippler-architecture.png`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error('Failed to export image', err);
        alert('Failed to generate high-resolution image.');
      }
    }, 200); // Wait 200ms for DOM update
  }, [fitView]);

  React.useEffect(() => {
    if (rawGraph) {
      processGraphData(rawGraph, viewMode, layoutMode, showUnconnectedNodes, filters);
    }
  }, [rawGraph, viewMode, layoutMode, showUnconnectedNodes, filters, processGraphData]);

  // APIs
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
      setResult(res.data);
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
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await axios.post('/api/analyze/zip', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(res.data);
      setRawGraph(res.data.graph);
    } catch (err) {
      console.error(err);
      alert('Failed to analyze ZIP file.');
    } finally {
      setLoading(false);
    }
  };

  const isIngestDisabled = (ingestTab === 'GITHUB' && !githubUrl) || (ingestTab === 'LOCAL' && !folderPath);

  const hasNoGraph = !rawGraph || nodes.length === 0;

  return (
    <div className="flex w-screen h-screen bg-[#07090e] text-gray-200 font-mono overflow-hidden relative">
      
      {/* Sidebar - Integrated */}
      <aside className="absolute top-4 left-4 bottom-4 w-[380px] bg-[#07090e]/95 border border-[#1a2333]/80 rounded-xl flex flex-col z-20 overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Branding */}
          <div className="p-6">
            <div className="flex items-center gap-3 text-[#00f2fe] font-bold text-xl tracking-widest uppercase">
              <Dna size={24} /> RIPPLER
            </div>
            <div className="text-[9px] text-gray-500 mt-2 uppercase tracking-[0.2em]">Spring Boot Architecture Visualizer</div>
          </div>

          {/* Tab Selector */}
          <div className="px-6 mb-6">
            <div className="flex bg-[#070a13] p-1 rounded-md border border-[#1a2333]">
              <button 
                className={`flex-1 py-2 rounded text-xs font-semibold flex items-center justify-center gap-2 transition-all ${ingestTab === 'LOCAL' ? 'bg-[#1a2333] text-[#00f2fe] shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                onClick={() => setIngestTab('LOCAL')}
              >
                <Folder size={14} /> Local / ZIP
              </button>
              <button 
                className={`flex-1 py-2 rounded text-xs font-semibold flex items-center justify-center gap-2 transition-all ${ingestTab === 'GITHUB' ? 'bg-[#1a2333] text-[#00f2fe] shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                onClick={() => setIngestTab('GITHUB')}
              >
                <Globe size={14} /> GitHub
              </button>
            </div>
          </div>

          {/* Ingest Form */}
          <div className="px-6 flex flex-col gap-6">
            {ingestTab === 'LOCAL' ? (
              <>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] text-gray-500 uppercase tracking-widest">Local Folder Path</label>
                  <input 
                    type="text" 
                    className="bg-[#070a13] border border-[#1a2333] rounded px-3 py-3 text-sm text-gray-200 focus:outline-none focus:border-[#00f2fe] transition-colors font-sans" 
                    placeholder="e.g. C:\workspace\project-service" 
                    value={folderPath} 
                    onChange={e => setFolderPath(e.target.value)} 
                  />
                </div>
                
                <div className="text-center text-[10px] text-gray-600 uppercase tracking-widest relative">
                  <span className="bg-[#0b0f19] px-2 relative z-10">— OR —</span>
                  <div className="absolute w-full h-[1px] bg-[#1a2333] top-1/2 left-0 -z-0"></div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] text-gray-500 uppercase tracking-widest">Drop Zone (Folder / Zip File)</label>
                  <label className="border border-dashed border-[#1a2333] hover:border-[#00f2fe] bg-[#070a13] rounded-md p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors group">
                    <div className="w-8 h-8 rounded-full bg-[#1a2333] group-hover:bg-[#00f2fe]/20 flex items-center justify-center text-gray-400 group-hover:text-[#00f2fe] transition-colors">
                      <Download size={16} className="rotate-180" />
                    </div>
                    <div className="text-xs text-gray-400">Drop folder or ZIP file here</div>
                    <div className="flex gap-2">
                      <span className="text-[10px] bg-[#1a2333] px-2 py-1 rounded">Select Folder</span>
                      <span className="text-[10px] bg-[#1a2333] px-2 py-1 rounded">Select ZIP</span>
                    </div>
                    <input type="file" accept=".zip" className="hidden" onChange={handleZipUpload} />
                  </label>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <label className="text-[10px] text-gray-500 uppercase tracking-widest">GitHub Repository URL</label>
                <input 
                  type="text" 
                  className="bg-[#070a13] border border-[#1a2333] rounded px-3 py-3 text-sm text-gray-200 focus:outline-none focus:border-[#00f2fe] transition-colors font-sans" 
                  placeholder="https://github.com/user/repo" 
                  value={githubUrl} 
                  onChange={e => setGithubUrl(e.target.value)} 
                />
              </div>
            )}

            <button 
              className="w-full bg-gradient-to-r from-[#00f2fe] to-[#4facfe] text-black font-bold text-sm py-2.5 rounded shadow-[0_0_15px_rgba(0,242,254,0.2)] hover:shadow-[0_0_25px_rgba(0,242,254,0.4)] transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
              onClick={handleIngest}
              disabled={loading || isIngestDisabled}
            >
              Ingest & Map
            </button>
          </div>

          <div className="mt-8 px-6 flex flex-col gap-6 border-t border-[#1a2333] pt-6">
            <div className="flex flex-col gap-3">
              <label className="text-[10px] text-gray-500 uppercase tracking-widest flex items-center gap-2"><Globe size={12}/> Graph Scope Toggle</label>
              <div className="flex bg-[#070a13] p-1 rounded border border-[#1a2333]">
                <button 
                  className={`flex-1 py-2 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${viewMode === 'SERVICE' ? 'bg-[#00f2fe] text-black' : 'text-gray-500 hover:text-gray-300'}`}
                  onClick={() => setViewMode('SERVICE')}
                >
                  Service Topology
                </button>
                <button 
                  className={`flex-1 py-2 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${viewMode === 'CLASS' ? 'bg-[#00f2fe] text-black' : 'text-gray-500 hover:text-gray-300'}`}
                  onClick={() => setViewMode('CLASS')}
                >
                  Class Code Map
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-[10px] text-gray-500 uppercase tracking-widest flex items-center gap-2"><Layers size={12}/> Layout Physics Mode</label>
              <div className="flex bg-[#070a13] p-1 rounded border border-[#1a2333]">
                <button 
                  className={`flex-1 py-2 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${layoutMode === 'SEMANTIC' ? 'bg-[#00f2fe] text-black' : 'text-gray-500 hover:text-gray-300'}`}
                  onClick={() => setLayoutMode('SEMANTIC')}
                >
                  Semantic Flow
                </button>
                <button 
                  className={`flex-1 py-2 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${layoutMode === 'FORCE' ? 'bg-[#00f2fe] text-black' : 'text-gray-500 hover:text-gray-300'}`}
                  onClick={() => setLayoutMode('FORCE')}
                >
                  Force Orbit
                </button>
              </div>
            </div>
          </div>

          {/* Dependency Filters */}
          <div className="mt-8 px-6 mb-8 flex flex-col gap-4 border-t border-[#1a2333] pt-6">
            <label className="text-[10px] text-gray-500 uppercase tracking-widest flex items-center gap-2"><Filter size={12}/> Dependency Filters</label>
            <div className="grid grid-cols-2 gap-3">
              {['FEIGN', 'KAFKA_PUBLISH', 'KAFKA_CONSUME', 'REST', 'JPA_RELATION', 'INJECTION'].map(filter => (
                <label key={filter} className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={filters[filter]} 
                    onChange={(e) => setFilters(prev => ({ ...prev, [filter]: e.target.checked }))}
                    className="w-3.5 h-3.5 rounded-sm bg-[#1a2333] border-transparent focus:ring-0 text-[#00f2fe]" 
                  />
                  <span className="text-[10px] text-gray-300 group-hover:text-white transition-colors">{filter}</span>
                </label>
              ))}
            </div>
            <div className="pt-4 mt-4 border-t border-[#1a2333]">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={showUnconnectedNodes}
                  onChange={(e) => setShowUnconnectedNodes(e.target.checked)}
                  className="w-4 h-4 rounded-sm bg-[#1a2333] border-transparent focus:ring-0 text-[#00f2fe]" 
                />
                <span className="text-[10px] font-bold text-[#00f2fe] group-hover:text-white transition-colors uppercase tracking-wider">Show Unconnected Nodes</span>
              </label>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Canvas Area */}
      <main className="flex-1 relative bg-[#07090e]">
        <Particles
          id="tsparticles"
          particlesLoaded={(container) => console.log(container)}
          init={particlesInit}
          options={{
            background: { color: { value: "transparent" } },
            fpsLimit: 60,
            particles: {
              color: { value: "#ffffff" },
              links: { enable: false },
              move: { direction: "top", enable: true, random: false, speed: 0.1, straight: false },
              number: { density: { enable: true, area: 800 }, value: 60 },
              opacity: { value: 0.1, random: true },
              shape: { type: "circle" },
              size: { value: { min: 0.5, max: 1.5 } },
            },
            detectRetina: true,
          }}
          className="absolute inset-0 z-0 pointer-events-none"
        />
        
        {/* Dotted Grid Background */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] pointer-events-none z-0"></div>

        {hasNoGraph && !loading && (
          <div className="absolute inset-y-0 right-0 left-[380px] flex flex-col items-center justify-center z-30 text-center pointer-events-none">
            <div className="w-28 h-28 rounded-full bg-[#00f2fe]/[0.02] border border-[#00f2fe]/10 flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(0,242,254,0.03)] pointer-events-auto">
              <Network size={56} strokeWidth={2.5} className="text-[#00b4d8] animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-gray-200 mb-4 tracking-wide">No Architecture Map Loaded</h2>
            <p className="text-sm text-[#5a768c] max-w-lg leading-relaxed font-mono">
              Use the control panel on the left to ingest a local folder path, upload a ZIP file, or link a public GitHub repo.
            </p>
          </div>
        )}

        {loading && (
          <div className="absolute inset-y-0 right-0 left-[380px] bg-[#070a13]/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
            <div className="w-16 h-16 border-4 border-[#1a2333] border-t-[#00f2fe] rounded-full animate-spin mb-4" />
            <p className="text-gray-300 font-bold tracking-widest text-sm animate-pulse">INGESTING CODEBASE...</p>
          </div>
        )}

        <div className="absolute inset-0 z-10" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
            onNodeClick={(e, node) => handleNodeClick(node.id)}
            onNodeMouseEnter={(e, node) => handleNodeHover(node.id, true)}
            onNodeMouseLeave={(e, node) => handleNodeHover(node.id, false)}
            nodeTypes={nodeTypes} edgeTypes={edgeTypes}
            colorMode="dark" minZoom={0.05} maxZoom={4}
            style={{ background: 'transparent' }}
          >
            {!hasNoGraph && <LegendPanel />}
            {!hasNoGraph && (
              <Panel position="top-right" className="flex gap-2 p-2 bg-[#0b0f19]/90 backdrop-blur-md border border-white/10 rounded-lg shadow-2xl m-4 pointer-events-auto">
                <button onClick={() => zoomIn({ duration: 200 })} className="p-2 hover:bg-white/10 rounded text-gray-300 transition-colors" title="Zoom In"><ZoomIn size={16} /></button>
                <button onClick={() => zoomOut({ duration: 200 })} className="p-2 hover:bg-white/10 rounded text-gray-300 transition-colors" title="Zoom Out"><ZoomOut size={16} /></button>
                <div className="w-px bg-white/10 mx-1"></div>
                <button onClick={() => fitView({ duration: 300, padding: 0.2 })} className="p-2 hover:bg-white/10 rounded text-gray-300 transition-colors" title="Fit View"><Maximize size={16} /></button>
                <div className="w-px bg-white/10 mx-1"></div>
                <button onClick={downloadImage} className="p-2 hover:bg-white/10 rounded text-gray-300 transition-colors" title="Download High-Res Image"><Download size={16} /></button>
              </Panel>
            )}
          </ReactFlow>
          
          <AnimatePresence>
            {selectedNode && (
              <motion.div
                initial={{ x: "100%", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: "100%", opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="absolute right-0 top-0 bottom-0 w-80 bg-[#0b0f19]/95 backdrop-blur-xl border-l border-white/10 shadow-[-20px_0_40px_rgba(0,0,0,0.5)] z-50 p-6 font-mono text-gray-300 overflow-y-auto"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold text-white tracking-wide truncate pr-4">{selectedNode.data.label}</h2>
                  <button onClick={() => { setSelectedNode(null); setIsBlastMode(false); setBlastRoot(null); setBlastAffectedNodes(new Set()); }} className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors"><X size={18}/></button>
                </div>
                
                <div className="flex items-center justify-between mb-6">
                  <div className="text-[10px] uppercase tracking-widest text-[#00f2fe] bg-[#00f2fe]/10 inline-block px-2 py-1 rounded border border-[#00f2fe]/30">
                    {selectedNode.data.type}
                  </div>
                  
                  <button 
                    onClick={() => {
                      if (isBlastMode && blastRoot === selectedNode.id) {
                        setIsBlastMode(false);
                        setBlastRoot(null);
                        setBlastAffectedNodes(new Set());
                      } else {
                        setIsBlastMode(true);
                        setBlastRoot(selectedNode.id);
                        setBlastAffectedNodes(new Set([selectedNode.id]));
                      }
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded transition-colors text-[10px] font-bold tracking-wider border ${isBlastMode && blastRoot === selectedNode.id ? 'bg-[#ff0055]/20 text-[#ff0055] border-[#ff0055]/50' : 'hover:bg-white/10 text-gray-400 hover:text-[#ff0055] border-white/10 hover:border-[#ff0055]/50'}`}
                  >
                    <Target size={12} /> {isBlastMode && blastRoot === selectedNode.id ? 'STOP SIMULATION' : 'BLAST RADIUS'}
                  </button>
                </div>

                {selectedNode.data.metadata && (
                  <div className="space-y-6">
                    {selectedNode.data.metadata.packageName && (
                      <div>
                        <h3 className="text-[10px] uppercase tracking-widest text-gray-500 mb-2">Package</h3>
                        <div className="text-xs break-all text-gray-400 bg-black/30 p-2 rounded border border-white/5">{selectedNode.data.metadata.packageName}</div>
                      </div>
                    )}
                    {selectedNode.data.metadata.serviceName && (
                      <div>
                        <h3 className="text-[10px] uppercase tracking-widest text-gray-500 mb-2">Service Context</h3>
                        <div className="text-xs text-gray-400">{selectedNode.data.metadata.serviceName}</div>
                      </div>
                    )}
                    {selectedNode.data.metadata.annotations?.length > 0 && (
                      <div>
                        <h3 className="text-[10px] uppercase tracking-widest text-gray-500 mb-2">Annotations</h3>
                        <div className="flex flex-col gap-1">
                          {selectedNode.data.metadata.annotations.map((ann, i) => (
                            <div key={i} className="text-xs text-[#b44fff] bg-[#b44fff]/5 px-2 py-1 rounded border border-[#b44fff]/20 w-fit">@{ann}</div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="mt-8 pt-6 border-t border-white/10">
                  <h3 className="text-[10px] uppercase tracking-widest text-gray-500 mb-4">Connections</h3>
                  <div className="space-y-2">
                    {edges.filter(e => e.source === selectedNode.id || e.target === selectedNode.id).map(e => {
                      const isOut = e.source === selectedNode.id;
                      const otherId = isOut ? e.target : e.source;
                      const otherNode = nodes.find(n => n.id === otherId);
                      return (
                        <div key={e.id} className="flex items-center gap-2 text-xs text-gray-400 bg-black/20 p-2 rounded border border-white/5">
                          <span className={isOut ? "text-[#ff6b35]" : "text-[#00f2fe]"}>{isOut ? "→" : "←"}</span>
                          <span className="truncate">{otherNode?.data?.label || otherId}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return <ReactFlowProvider><FlowApp /></ReactFlowProvider>;
}
