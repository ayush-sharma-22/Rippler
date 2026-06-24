import React from 'react';
import { Dna, Globe, Folder, Download, Layers, Filter } from 'lucide-react';

const Sidebar = ({
  ingestTab, setIngestTab,
  folderPath, setFolderPath,
  githubUrl, setGithubUrl,
  loading, isIngestDisabled,
  onIngest, onZipUpload,
  viewMode, setViewMode,
  layoutMode, setLayoutMode,
  filters, setFilters,
  showUnconnectedNodes, setShowUnconnectedNodes,
}) => (
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
                <input type="file" accept=".zip" className="hidden" onChange={onZipUpload} />
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
          onClick={onIngest}
          disabled={loading || isIngestDisabled}
        >
          Ingest &amp; Map
        </button>
      </div>

      {/* View & Layout Controls */}
      <div className="mt-8 px-6 flex flex-col gap-6 border-t border-[#1a2333] pt-6">
        <div className="flex flex-col gap-3">
          <label className="text-[10px] text-gray-500 uppercase tracking-widest flex items-center gap-2"><Globe size={12} /> Graph Scope Toggle</label>
          <div className="flex bg-[#070a13] p-1 rounded border border-[#1a2333]">
            <button className={`flex-1 py-2 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${viewMode === 'SERVICE' ? 'bg-[#00f2fe] text-black' : 'text-gray-500 hover:text-gray-300'}`} onClick={() => setViewMode('SERVICE')}>Service Topology</button>
            <button className={`flex-1 py-2 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${viewMode === 'CLASS'   ? 'bg-[#00f2fe] text-black' : 'text-gray-500 hover:text-gray-300'}`} onClick={() => setViewMode('CLASS')}>Class Code Map</button>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-[10px] text-gray-500 uppercase tracking-widest flex items-center gap-2"><Layers size={12} /> Layout Physics Mode</label>
          <div className="flex bg-[#070a13] p-1 rounded border border-[#1a2333]">
            <button className={`flex-1 py-2 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${layoutMode === 'SEMANTIC' ? 'bg-[#00f2fe] text-black' : 'text-gray-500 hover:text-gray-300'}`} onClick={() => setLayoutMode('SEMANTIC')}>Semantic Flow</button>
            <button className={`flex-1 py-2 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${layoutMode === 'FORCE'    ? 'bg-[#00f2fe] text-black' : 'text-gray-500 hover:text-gray-300'}`} onClick={() => setLayoutMode('FORCE')}>Force Orbit</button>
          </div>
        </div>
      </div>

      {/* Dependency Filters */}
      <div className="mt-8 px-6 mb-8 flex flex-col gap-4 border-t border-[#1a2333] pt-6">
        <label className="text-[10px] text-gray-500 uppercase tracking-widest flex items-center gap-2"><Filter size={12} /> Dependency Filters</label>
        <div className="grid grid-cols-2 gap-3">
          {['FEIGN', 'KAFKA_PUBLISH', 'KAFKA_CONSUME', 'REST', 'JPA_RELATION', 'INJECTION'].map(filter => (
            <label key={filter} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters[filter]}
                onChange={e => setFilters(prev => ({ ...prev, [filter]: e.target.checked }))}
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
              onChange={e => setShowUnconnectedNodes(e.target.checked)}
              className="w-4 h-4 rounded-sm bg-[#1a2333] border-transparent focus:ring-0 text-[#00f2fe]"
            />
            <span className="text-[10px] font-bold text-[#00f2fe] group-hover:text-white transition-colors uppercase tracking-wider">Show Unconnected Nodes</span>
          </label>
        </div>
      </div>

    </div>
  </aside>
);

export default Sidebar;
