import { useCallback, useEffect } from 'react';
import { MarkerType, useReactFlow } from '@xyflow/react';
import { toPng } from 'html-to-image';
import { getLayoutedElements } from '../utils/layoutEngine';

/**
 * useGraphProcessor
 * Handles all graph data transformation: filtering, edge rescuing,
 * layout computation, and feeding nodes/edges into React Flow.
 */
export const useGraphProcessor = (setNodes, setEdges) => {
  const { fitView } = useReactFlow();

  const processGraphData = useCallback((graphData, mode, layoutMode, showUnconnectedNodes, activeFilters) => {
    if (!graphData || !graphData.nodes) return;

    let filteredNodes = graphData.nodes;

    // 1. Apply filter checkboxes to raw edges
    const activeRawEdges = graphData.edges.filter(e => {
      if (e.type === 'REST_CALL') return activeFilters?.['REST'] !== false;
      if (activeFilters && activeFilters[e.type] !== undefined) return activeFilters[e.type];
      return true;
    });

    let filteredEdges = activeRawEdges;

    if (mode === 'CLASS') {
      filteredNodes = graphData.nodes;

      const syntheticEdges = [];
      const classes  = filteredNodes.filter(n => n.type === 'CLASS');
      const services = filteredNodes.filter(n => n.type === 'SERVICE');

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
            const serviceName  = dbEdge.source;
            const serviceClasses = classes.filter(n => n.data?.metadata?.serviceName?.toLowerCase() === serviceName?.toLowerCase());
            if (serviceClasses.length > 0) {
              let targetClasses = serviceClasses.filter(n => n.label.toLowerCase().includes('repository'));
              if (targetClasses.length === 0) targetClasses = [serviceClasses[0]];
              targetClasses.forEach(repo => {
                rescuedDbEdges.push({ id: `class-db-${repo.id}-${db.id}`, source: repo.id, target: db.id, type: 'JPA_RELATION', data: { type: 'JPA_RELATION' } });
              });
            }
          }
        });

        const feignEdges = activeRawEdges.filter(e => e.type === 'FEIGN' || e.type === 'REST_CALL');
        feignEdges.forEach(feign => {
          const targetClasses = classes.filter(n => n.data?.metadata?.serviceName?.toLowerCase() === feign.target?.toLowerCase());
          if (targetClasses.length > 0) {
            let controllers = targetClasses.filter(n => n.label.toLowerCase().includes('controller'));
            if (controllers.length === 0) controllers = [targetClasses[0]];
            controllers.forEach(ctrl => {
              rescuedDbEdges.push({ id: `rescued-feign-${feign.source}-${ctrl.id}`, source: feign.source, target: ctrl.id, type: feign.type, data: { type: feign.type } });
            });
          }
        });

        const kafkaPubs = activeRawEdges.filter(e => e.type === 'KAFKA_PUBLISH');
        const kafkaCons = activeRawEdges.filter(e => e.type === 'KAFKA_CONSUME');

        kafkaPubs.forEach(pub => {
          const consumingServices = kafkaCons.filter(c => c.source === pub.target).map(c => c.target);
          consumingServices.forEach(targetService => {
            const targetClasses = classes.filter(n => n.data?.metadata?.serviceName?.toLowerCase() === targetService?.toLowerCase());
            if (targetClasses.length > 0) {
              let listeners = targetClasses.filter(n => n.label.toLowerCase().includes('listener') || n.label.toLowerCase().includes('service'));
              if (listeners.length === 0) listeners = [targetClasses[0]];
              listeners.forEach(listener => {
                rescuedDbEdges.push({ id: `rescued-kafka-${pub.source}-${listener.id}`, source: pub.source, target: listener.id, type: 'KAFKA_PUBLISH', data: { type: 'KAFKA_PUBLISH' } });
              });
            }
          });
        });

        const validIds = new Set(filteredNodes.map(n => n.id));
        filteredEdges = [
          ...activeRawEdges.filter(e => validIds.has(e.source) && validIds.has(e.target)),
          ...rescuedDbEdges,
          ...syntheticEdges
        ];
      } else {
        filteredEdges = [...activeRawEdges, ...syntheticEdges];
      }

    } else if (mode === 'SERVICE') {
      filteredNodes = graphData.nodes.filter(n => ['SERVICE', 'DATABASE', 'KAFKA_TOPIC'].includes(n.type));

      const serviceNodes    = filteredNodes.filter(n => n.type === 'SERVICE');
      const projectRootName = (graphData.projectName || '').toLowerCase().replace(/-main$/, '');

      const outgoingFeign = {};
      activeRawEdges.forEach(e => {
        if (e.type === 'FEIGN' || e.type === 'REST_CALL') outgoingFeign[e.source] = (outgoingFeign[e.source] || 0) + 1;
      });

      const hubThreshold = serviceNodes.length > 4 ? serviceNodes.length * 0.8 : Infinity;
      const hubNodes = new Set(serviceNodes
        .filter(n => {
          const labelLower = n.label.toLowerCase().replace(/-main$/, '');
          const isExactRootMatch = projectRootName && (labelLower === projectRootName || labelLower.includes(projectRootName));
          const isHubByEdges = (outgoingFeign[n.id] || 0) > hubThreshold;
          return isExactRootMatch || isHubByEdges;
        })
        .map(n => n.id));

      if (hubNodes.size > 0 && hubNodes.size < serviceNodes.length) {
        filteredNodes = filteredNodes.filter(n => !hubNodes.has(n.id));
      }

      const validNodeIds = new Set(filteredNodes.map(n => n.id));
      let rescuedEdges = [];

      hubNodes.forEach(hubId => {
        const incoming = activeRawEdges.filter(e => e.target === hubId && validNodeIds.has(e.source));
        const outgoing = activeRawEdges.filter(e => e.source === hubId && validNodeIds.has(e.target));

        incoming.forEach(inc => {
          outgoing.forEach(out => {
            rescuedEdges.push({ source: inc.source, target: out.target, type: out.type, id: `rescued-${inc.source}-${out.target}-${out.type}` });
          });
        });

        const hubDbs = activeRawEdges.filter(e => e.source === hubId && e.type === 'JPA_RELATION');
        hubDbs.forEach(e => {
          if (validNodeIds.has(e.target)) {
            const remainingServices = filteredNodes.filter(n => n.type === 'SERVICE');
            const dbLabel = e.target.replace(/^db:/, '').replace(/[-_]?dbs?$/i, '').toLowerCase();
            const ownerService = remainingServices.find(svc => {
              const svcName = svc.id.toLowerCase().replace(/[-_]service$/i, '');
              return svcName === dbLabel || svcName.startsWith(dbLabel) || dbLabel.startsWith(svcName);
            });
            if (ownerService) {
              rescuedEdges.push({ ...e, source: ownerService.id, id: `rescued-db-${e.target}-${ownerService.id}` });
            } else if (remainingServices.length > 0) {
              const leastConnected = remainingServices.reduce((min, n) => (outgoingFeign[n.id] || 0) < (outgoingFeign[min.id] || 0) ? n : min);
              rescuedEdges.push({ ...e, source: leastConnected.id, id: `rescued-${e.source}-${e.target}-${e.type}` });
            }
          }
        });
      });

      filteredEdges = [
        ...activeRawEdges.filter(e => validNodeIds.has(e.source) && validNodeIds.has(e.target)),
        ...rescuedEdges
      ];
    }

    // Filter unconnected nodes
    if (!showUnconnectedNodes) {
      const connectedIds = new Set();
      filteredEdges.forEach(e => { connectedIds.add(e.source); connectedIds.add(e.target); });
      const connectedNodes = filteredNodes.filter(n => {
        if (layoutMode === 'FORCE' && (n.type === 'SERVICE' || n.type === 'KAFKA_TOPIC')) return true;
        return connectedIds.has(n.id);
      });
      if (connectedNodes.length > 0) filteredNodes = connectedNodes;
    }

    const newNodes = filteredNodes.map(n => ({
      id: n.id, type: 'custom', position: { x: 0, y: 0 },
      data: { label: n.label, type: n.type, metadata: n.metadata }
    }));

    const newEdges = filteredEdges.map(e => {
      let color = '#4b5563';
      let strokeWidth = 1;
      let dashed = false;
      if (e.type === 'INJECTION')                                  { color = '#94a3b8'; strokeWidth = 1.5; }
      if (e.type === 'FEIGN' || e.type === 'REST_CALL')            { color = '#00f2fe'; strokeWidth = 2; dashed = true; }
      if (e.type === 'KAFKA_PUBLISH' || e.type === 'KAFKA_CONSUME') { color = '#ff6b35'; strokeWidth = 2; dashed = true; }
      if (e.type === 'JPA_RELATION')                               { color = '#b44fff'; strokeWidth = 2; dashed = true; }
      if (e.type === 'SERVICE_TO_CLASS')                           { color = '#3b82f6'; strokeWidth = 1.5; dashed = true; }
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
    fitView({ padding: 0.1, duration: 0 });
    setTimeout(async () => {
      const el = document.querySelector('.react-flow');
      if (!el) return;
      try {
        const dataUrl = await toPng(el, {
          backgroundColor: '#070a13',
          quality: 1.0,
          pixelRatio: 3,
          filter: (node) => {
            if (node.classList?.contains('react-flow__panel') || node.classList?.contains('react-flow__controls')) return false;
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
    }, 200);
  }, [fitView]);

  return { processGraphData, downloadImage };
};
