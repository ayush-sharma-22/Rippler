import dagre from 'dagre';
import ELK from 'elkjs/lib/elk.bundled.js';

export const getLayoutedElements = async (nodes, edges, layoutMode, viewMode) => {
  const nodeWidth  = 250;
  const nodeHeight = 80;

  const kafkas   = nodes.filter(n => n.data.type === 'KAFKA_TOPIC');
  const services = nodes.filter(n => n.data.type === 'SERVICE');
  const dbs      = nodes.filter(n => n.data.type === 'DATABASE');
  const classes  = nodes.filter(n => n.data.type === 'CLASS');
  const others   = nodes.filter(n => !['SERVICE', 'KAFKA_TOPIC', 'DATABASE', 'CLASS'].includes(n.data.type));

  const isMonolith = services.length === 1 && kafkas.length === 0;

  if (layoutMode === 'SEMANTIC' && viewMode === 'CLASS' && isMonolith) {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({ rankdir: 'TB', nodesep: 60, ranksep: 120 });
    nodes.forEach(node => dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight }));
    edges.forEach(edge => dagreGraph.setEdge(edge.source, edge.target));
    dagre.layout(dagreGraph);
    const positioned = nodes.map(node => {
      const nodeWithPosition = dagreGraph.node(node.id);
      return { ...node, position: { x: nodeWithPosition.x - nodeWidth / 2, y: nodeWithPosition.y - nodeHeight / 2 } };
    });
    return { nodes: positioned };
  }

  const positioned = [];

  if (layoutMode === 'FORCE') {
    const centerX = 0;
    const centerY = 0;

    if (isMonolith) {
      dbs.forEach((db, i) => {
        const angle = (i / Math.max(1, dbs.length)) * 2 * Math.PI;
        const r = dbs.length > 1 ? 150 : 0;
        positioned.push({ ...db, position: { x: centerX + r * Math.cos(angle) - nodeWidth/2, y: centerY + r * Math.sin(angle) - nodeHeight/2 } });
      });

      const repos = classes.filter(c => c.data.label.toLowerCase().includes('repository') || c.data.label.toLowerCase().includes('dao'));
      const repoRadius = Math.max(300, (repos.length * (nodeWidth + 100)) / (2 * Math.PI));
      repos.forEach((n, i) => {
        const angle = (i / Math.max(1, repos.length)) * 2 * Math.PI;
        positioned.push({ ...n, position: { x: centerX + repoRadius * Math.cos(angle) - nodeWidth/2, y: centerY + repoRadius * Math.sin(angle) - nodeHeight/2 } });
      });

      const svcs = classes.filter(c => c.data.label.toLowerCase().includes('service') && !repos.includes(c));
      const svcsRadius = Math.max(repoRadius + 300, (svcs.length * (nodeWidth + 100)) / (2 * Math.PI));
      svcs.forEach((n, i) => {
        const angle = (i / Math.max(1, svcs.length)) * 2 * Math.PI;
        positioned.push({ ...n, position: { x: centerX + svcsRadius * Math.cos(angle) - nodeWidth/2, y: centerY + svcsRadius * Math.sin(angle) - nodeHeight/2 } });
      });

      const ctrls = classes.filter(c => c.data.label.toLowerCase().includes('controller') || c.data.label.toLowerCase().includes('resource'));
      const ctrlRadius = Math.max(svcsRadius + 300, (ctrls.length * (nodeWidth + 100)) / (2 * Math.PI));
      ctrls.forEach((n, i) => {
        const angle = (i / Math.max(1, ctrls.length)) * 2 * Math.PI;
        positioned.push({ ...n, position: { x: centerX + ctrlRadius * Math.cos(angle) - nodeWidth/2, y: centerY + ctrlRadius * Math.sin(angle) - nodeHeight/2 } });
      });

      const unassigned = classes.filter(c => !repos.includes(c) && !svcs.includes(c) && !ctrls.includes(c));
      const outerBelt = [...unassigned, ...services, ...kafkas, ...others];
      const beltRadius = Math.max(ctrlRadius + 400, (outerBelt.length * (nodeWidth + 100)) / (2 * Math.PI));
      outerBelt.forEach((n, i) => {
        const angle = (i / Math.max(1, outerBelt.length)) * 2 * Math.PI;
        positioned.push({ ...n, position: { x: centerX + beltRadius * Math.cos(angle) - nodeWidth/2, y: centerY + beltRadius * Math.sin(angle) - nodeHeight/2 } });
      });

      return { nodes: positioned };
    }

    // Microservices Polar Wedge Orbit
    kafkas.forEach((n, i) => {
      const angle = (i / Math.max(1, kafkas.length)) * 2 * Math.PI;
      const radius = kafkas.length > 1 ? 150 : 0;
      positioned.push({ ...n, position: { x: centerX + radius * Math.cos(angle) - nodeWidth/2, y: centerY + radius * Math.sin(angle) - nodeHeight/2 } });
    });

    const serviceNames = Array.from(new Set(services.map(s => s.id.toLowerCase())));
    if (classes.some(c => !serviceNames.includes(c.data?.metadata?.serviceName?.toLowerCase() || 'unknown'))) {
      serviceNames.push('unknown');
    }

    const numSlices = Math.max(1, serviceNames.length);
    const sliceAngle = (2 * Math.PI) / numSlices;
    const serviceRadius = Math.max(500, (numSlices * (nodeWidth + 150)) / (2 * Math.PI));

    services.forEach(n => {
      let svcIdx = serviceNames.indexOf(n.id.toLowerCase());
      if (svcIdx === -1) svcIdx = 0;
      const angle = svcIdx * sliceAngle + (sliceAngle / 2);
      positioned.push({ ...n, position: { x: centerX + serviceRadius * Math.cos(angle) - nodeWidth/2, y: centerY + serviceRadius * Math.sin(angle) - nodeHeight/2 } });
    });

    const dbRadius = serviceRadius + 300;
    dbs.forEach(db => {
      const edge = edges.find(e => (e.source === db.id || e.target === db.id) && e.data?.type === 'JPA_RELATION');
      let svcIdx = 0;
      if (edge) {
        const connectedId = edge.source === db.id ? edge.target : edge.source;
        let foundIdx = serviceNames.indexOf(connectedId.toLowerCase());
        if (foundIdx === -1) {
          const cls = classes.find(c => c.id === connectedId);
          if (cls) foundIdx = serviceNames.indexOf((cls.data?.metadata?.serviceName || 'unknown').toLowerCase());
        }
        if (foundIdx !== -1) svcIdx = foundIdx;
      }
      const angle = svcIdx * sliceAngle + (sliceAngle / 2);
      positioned.push({ ...db, position: { x: centerX + dbRadius * Math.cos(angle) - nodeWidth/2, y: centerY + dbRadius * Math.sin(angle) - nodeHeight/2 } });
    });

    let maxGlobalRadius = dbRadius;
    const classBaseRadius = dbRadius + 400;

    serviceNames.forEach((svcName, idx) => {
      const svcClasses = classes.filter(c => (c.data?.metadata?.serviceName?.toLowerCase() || 'unknown') === svcName);
      if (svcClasses.length === 0) return;
      svcClasses.sort((a, b) => (a.data?.label || '').localeCompare(b.data?.label || ''));

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
          const angle = batch.length === 1 ? wedgeStart + wedgeSpan / 2 : wedgeStart + (i / (batch.length - 1)) * wedgeSpan;
          positioned.push({ ...c, position: { x: centerX + currentRadius * Math.cos(angle) - nodeWidth/2, y: centerY + currentRadius * Math.sin(angle) - nodeHeight/2 } });
        });

        currentRadius += nodeHeight + 150;
      }

      if (currentRadius > maxGlobalRadius) maxGlobalRadius = currentRadius;
    });

    const outerRadius = maxGlobalRadius + 400;
    others.forEach((n, i) => {
      const angle = (i / Math.max(1, others.length)) * 2 * Math.PI;
      positioned.push({ ...n, position: { x: centerX + outerRadius * Math.cos(angle) - nodeWidth/2, y: centerY + outerRadius * Math.sin(angle) - nodeHeight/2 } });
    });

    return { nodes: positioned };
  }

  // SEMANTIC LAYOUT
  const hGap      = 80;
  const vGap      = 160;
  const maxPerRow = 5;

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
        positioned.push({ ...n, position: { x: offsetX + col * (nodeWidth + hGap) - nodeWidth / 2, y: startY + row * (nodeHeight + vGap) - nodeHeight / 2 } });
      }
    });
    return startY + Math.ceil(group.length / itemsPerRow) * (nodeHeight + vGap) + vGap;
  };

  const placeClassesHierarchy = (clsGroup, startY) => {
    if (clsGroup.length === 0) return startY;
    const serviceGroups = {};
    clsGroup.forEach(c => {
      const svcName = c.data?.metadata?.serviceName || 'unknown';
      if (!serviceGroups[svcName]) serviceGroups[svcName] = [];
      serviceGroups[svcName].push(c);
    });

    let currentX = 0;
    const MAX_X = 5 * (nodeWidth + hGap);
    let currentRowStartY = startY;
    let nextRowStartY = startY;

    Object.keys(serviceGroups).forEach(svcName => {
      const group = serviceGroups[svcName];
      if (currentX > 0 && currentX + nodeWidth > MAX_X) {
        currentX = 0;
        currentRowStartY = nextRowStartY + vGap * 2;
      }

      const controllers  = group.filter(c => c.data.label.toLowerCase().includes('controller') || c.data.label.toLowerCase().includes('resource'));
      const svcs         = group.filter(c => c.data.label.toLowerCase().includes('service') && !controllers.includes(c));
      const repositories = group.filter(c => c.data.label.toLowerCase().includes('repository') || c.data.label.toLowerCase().includes('dao'));
      const unassigned   = group.filter(c => !controllers.includes(c) && !svcs.includes(c) && !repositories.includes(c));
      const tiers        = [controllers, svcs, repositories, unassigned];

      let localY = currentRowStartY;
      let maxColWidth = 0;

      tiers.forEach(tier => {
        if (tier.length === 0) return;
        const itemsPerRow = 3;
        tier.forEach((n, i) => {
          const row = Math.floor(i / itemsPerRow);
          const col = i % itemsPerRow;
          const existing = positioned.find(p => p.id === n.id);
          if (!existing) {
            positioned.push({ ...n, position: { x: currentX + col * (nodeWidth + hGap), y: localY + row * (nodeHeight + vGap) } });
          }
          const colWidth = (col + 1) * (nodeWidth + hGap);
          if (colWidth > maxColWidth) maxColWidth = colWidth;
        });
        localY += Math.ceil(tier.length / itemsPerRow) * (nodeHeight + vGap) + vGap;
      });

      if (localY > nextRowStartY) nextRowStartY = localY;
      currentX += maxColWidth + hGap * 2;
    });

    return nextRowStartY;
  };

  let currentY = 0;
  if (services.length) currentY = placeGroup(services, currentY, maxPerRow);
  if (kafkas.length)   currentY = placeGroup(kafkas, currentY, 3);
  if (dbs.length)      currentY = placeGroup(dbs, currentY, maxPerRow);
  if (classes.length)  currentY = placeClassesHierarchy(classes, currentY);
  if (others.length)   placeGroup(others, currentY, maxPerRow);

  return { nodes: positioned };
};
