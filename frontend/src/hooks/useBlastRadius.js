import { useState, useEffect } from 'react';

/**
 * useBlastRadius
 * Manages blast radius simulation state and the propagation effect.
 * Progressively spreads the "blast" to upstream callers and downstream dependencies.
 */
export const useBlastRadius = (nodes, edges, setNodes) => {
  const [isBlastMode,       setIsBlastMode]       = useState(false);
  const [blastRoot,         setBlastRoot]         = useState(null);
  const [blastAffectedNodes, setBlastAffectedNodes] = useState(new Set());

  // Propagation effect
  useEffect(() => {
    if (!isBlastMode || !blastRoot) return;

    const interval = setInterval(() => {
      setBlastAffectedNodes(prev => {
        const nextSet = new Set(prev);
        let changed = false;

        for (const e of edges) {
          const targetNode = nodes.find(n => n.id === e.target);

          // Upstream propagation: if a dependency fails, the caller fails
          if (e.data?.type !== 'KAFKA_CONSUME') {
            if (prev.has(e.target) && !prev.has(e.source)) {
              nextSet.add(e.source);
              changed = true;
              break;
            }
          }

          // Downstream: show affected DBs and Kafka topics
          if (prev.has(e.source) && !prev.has(e.target)) {
            if (targetNode?.data?.type === 'DATABASE' || targetNode?.data?.type === 'KAFKA_TOPIC') {
              nextSet.add(e.target);
              changed = true;
              break;
            }
            // Kafka consumers only fail if the topic itself was the root cause
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

  // Sync node visuals with blast state
  useEffect(() => {
    setNodes(nds => nds.map(n => ({
      ...n,
      data: {
        ...n.data,
        isBlastRoot:     isBlastMode && blastRoot === n.id,
        isBlastAffected: isBlastMode && blastRoot !== n.id && blastAffectedNodes.has(n.id),
      }
    })));
  }, [isBlastMode, blastRoot, blastAffectedNodes, setNodes]);

  const resetBlast = () => {
    setIsBlastMode(false);
    setBlastRoot(null);
    setBlastAffectedNodes(new Set());
  };

  const startBlast = (nodeId) => {
    setIsBlastMode(true);
    setBlastRoot(nodeId);
    setBlastAffectedNodes(new Set([nodeId]));
  };

  return {
    isBlastMode, blastRoot, blastAffectedNodes,
    setIsBlastMode, setBlastRoot, setBlastAffectedNodes,
    startBlast, resetBlast,
  };
};
