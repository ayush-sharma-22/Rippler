import React from 'react';
import { getBezierPath } from '@xyflow/react';

const CustomAnimatedEdge = ({
  id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style = {}, markerEnd, data
}) => {
  const edgeHash = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const globalOffset = (edgeHash % 100) / 100;

  const [edgePath] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });

  let dotColor = '#6b7280';
  let dur = 3;
  let dotCount = 0;
  let dotRadius = 3;

  if (data?.type === 'FEIGN' || data?.type === 'REST_CALL') {
    dotColor = '#00f2fe'; dur = 2.5; dotCount = 3; dotRadius = 3;
  } else if (data?.type === 'KAFKA_PUBLISH') {
    dotColor = '#ff6b35'; dur = 1.2; dotCount = 4; dotRadius = 3.5;
  } else if (data?.type === 'KAFKA_CONSUME') {
    dotColor = '#ffa64d'; dur = 3.5; dotCount = 2; dotRadius = 2.5;
  } else if (data?.type === 'JPA_RELATION') {
    dotColor = '#b44fff'; dur = 4.5; dotCount = 2; dotRadius = 3;
  } else if (data?.type === 'INJECTION') {
    dotColor = '#4ade80'; dur = 5; dotCount = 1; dotRadius = 2;
  }

  const durStr = `${dur}s`;

  return (
    <>
      <path
        id={id}
        style={style}
        className={`react-flow__edge-path ${data?.dimmed ? 'dimmed' : ''} ${data?.circuitTracer ? 'circuit-tracer' : ''}`}
        d={edgePath}
        markerEnd={markerEnd}
      />
      {!data?.dimmed && dotCount > 0 && Array.from({ length: dotCount }).map((_, i) => {
        const dotOffset = globalOffset + (i / dotCount);
        const beginSec = -((dotOffset % 1) * dur);
        return (
          <circle key={i} r={dotRadius} fill={dotColor} style={{ filter: `drop-shadow(0 0 4px ${dotColor})` }}>
            <animateMotion
              dur={durStr}
              repeatCount="indefinite"
              path={edgePath}
              begin={`${beginSec.toFixed(3)}s`}
            />
          </circle>
        );
      })}
    </>
  );
};

export const edgeTypes = { custom: CustomAnimatedEdge };
export default CustomAnimatedEdge;
