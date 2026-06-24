import { useCallback } from 'react';

/**
 * useCircuitTracer
 * On hover, traces all connected nodes and edges from a given nodeId,
 * dimming everything else to highlight the connection path.
 */
export const useCircuitTracer = (setNodes, setEdges) => {
  const handleNodeHover = useCallback((nodeId, isHovering) => {
    if (!isHovering) {
      setNodes(nds => nds.map(n => ({ ...n, data: { ...n.data, dimmed: false, highlighted: false } })));
      setEdges(eds => eds.map(e => ({ ...e, style: { ...e.style, opacity: 1 }, data: { ...e.data, dimmed: false, circuitTracer: false } })));
      return;
    }

    setEdges(eds => {
      const connectedNodes = new Set([nodeId]);
      const circuitEdges   = new Set();

      const trace = (currNode) => {
        eds.forEach(e => {
          if (e.source === currNode && !circuitEdges.has(e.id)) { circuitEdges.add(e.id); connectedNodes.add(e.target); trace(e.target); }
          if (e.target === currNode && !circuitEdges.has(e.id)) { circuitEdges.add(e.id); connectedNodes.add(e.source); trace(e.source); }
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

  return { handleNodeHover };
};
