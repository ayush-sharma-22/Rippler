import React from 'react';
import { Network } from 'lucide-react';

const EmptyState = () => (
  <div className="absolute inset-y-0 right-0 left-[380px] flex flex-col items-center justify-center z-30 text-center pointer-events-none">
    <div className="w-28 h-28 rounded-full bg-[#00f2fe]/[0.02] border border-[#00f2fe]/10 flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(0,242,254,0.03)] pointer-events-auto">
      <Network size={56} strokeWidth={2.5} className="text-[#00b4d8] animate-pulse" />
    </div>
    <h2 className="text-2xl font-bold text-gray-200 mb-4 tracking-wide">No Architecture Map Loaded</h2>
    <p className="text-sm text-[#5a768c] max-w-lg leading-relaxed font-mono">
      Use the control panel on the left to ingest a local folder path, upload a ZIP file, or link a public GitHub repo.
    </p>
  </div>
);

export default EmptyState;
