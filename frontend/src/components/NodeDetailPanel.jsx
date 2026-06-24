import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Target } from 'lucide-react';

const NodeDetailPanel = ({ selectedNode, edges, nodes, isBlastMode, blastRoot, onClose, onToggleBlast }) => (
  <AnimatePresence>
    {selectedNode && (
      <motion.div
        initial={{ x: "100%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: "100%", opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="absolute right-0 top-0 bottom-0 w-80 bg-[#0b0f19]/95 backdrop-blur-xl border-l border-white/10 shadow-[-20px_0_40px_rgba(0,0,0,0.5)] z-50 p-6 font-mono text-gray-300 overflow-y-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-white tracking-wide truncate pr-4">{selectedNode.data.label}</h2>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Type Badge + Blast Toggle */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-[10px] uppercase tracking-widest text-[#00f2fe] bg-[#00f2fe]/10 inline-block px-2 py-1 rounded border border-[#00f2fe]/30">
            {selectedNode.data.type}
          </div>
          <button
            onClick={() => onToggleBlast(selectedNode.id)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded transition-colors text-[10px] font-bold tracking-wider border ${
              isBlastMode && blastRoot === selectedNode.id
                ? 'bg-[#ff0055]/20 text-[#ff0055] border-[#ff0055]/50'
                : 'hover:bg-white/10 text-gray-400 hover:text-[#ff0055] border-white/10 hover:border-[#ff0055]/50'
            }`}
          >
            <Target size={12} />
            {isBlastMode && blastRoot === selectedNode.id ? 'STOP SIMULATION' : 'BLAST RADIUS'}
          </button>
        </div>

        {/* Metadata */}
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

        {/* Connections */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <h3 className="text-[10px] uppercase tracking-widest text-gray-500 mb-4">Connections</h3>
          <div className="space-y-2">
            {edges
              .filter(e => e.source === selectedNode.id || e.target === selectedNode.id)
              .map(e => {
                const isOut     = e.source === selectedNode.id;
                const otherId   = isOut ? e.target : e.source;
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
);

export default NodeDetailPanel;
