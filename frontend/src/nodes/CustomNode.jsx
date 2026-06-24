import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Server, Database, Share2, Code, Folder } from 'lucide-react';
import { motion } from 'framer-motion';

const CustomNode = ({ data }) => {
  const type = data.type;

  let baseStyle = "flex flex-col p-2 px-3 min-w-[180px] bg-[#070a13]/90 backdrop-blur-md text-white font-mono text-[11px] transition-all duration-300 relative border overflow-hidden rounded-md will-change-transform";
  let borderClass = "";
  let icon = null;
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

  if (data.dimmed)      baseStyle += " opacity-20 grayscale";
  if (data.highlighted) baseStyle += " z-10 opacity-100 drop-shadow-[0_0_20px_currentColor]";

  if (data.isBlastRoot) {
    borderClass = "border-[#ff0055] shadow-[0_0_30px_rgba(255,0,85,0.8)]";
    baseStyle += " animate-pulse";
  } else if (data.isBlastAffected) {
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
        <div className="w-10 h-10 rounded border border-white/10 bg-white/5 flex items-center justify-center shrink-0">
          {icon}
        </div>
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

export const nodeTypes = { custom: CustomNode };
export default CustomNode;
