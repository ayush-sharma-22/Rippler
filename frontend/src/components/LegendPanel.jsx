import React from 'react';
import { Panel } from '@xyflow/react';

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

export default LegendPanel;
