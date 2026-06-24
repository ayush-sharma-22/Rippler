import React from 'react';
import { Panel } from '@xyflow/react';
import { ZoomIn, ZoomOut, Maximize, Download } from 'lucide-react';
import { useReactFlow } from '@xyflow/react';

const CanvasToolbar = ({ onDownload }) => {
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  return (
    <Panel position="top-right" className="flex gap-2 p-2 bg-[#0b0f19]/90 backdrop-blur-md border border-white/10 rounded-lg shadow-2xl m-4 pointer-events-auto">
      <button onClick={() => zoomIn({ duration: 200 })}  className="p-2 hover:bg-white/10 rounded text-gray-300 transition-colors" title="Zoom In"><ZoomIn size={16} /></button>
      <button onClick={() => zoomOut({ duration: 200 })} className="p-2 hover:bg-white/10 rounded text-gray-300 transition-colors" title="Zoom Out"><ZoomOut size={16} /></button>
      <div className="w-px bg-white/10 mx-1"></div>
      <button onClick={() => fitView({ duration: 300, padding: 0.2 })} className="p-2 hover:bg-white/10 rounded text-gray-300 transition-colors" title="Fit View"><Maximize size={16} /></button>
      <div className="w-px bg-white/10 mx-1"></div>
      <button onClick={onDownload} className="p-2 hover:bg-white/10 rounded text-gray-300 transition-colors" title="Download High-Res Image"><Download size={16} /></button>
    </Panel>
  );
};

export default CanvasToolbar;
