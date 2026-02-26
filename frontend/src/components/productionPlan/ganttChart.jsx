import React, { useMemo, useState } from "react";
import "./ganttChart.css";

export default function GanttChart({ productionPlan }) {
  const [hoveredOp, setHoveredOp] = useState(null);

  const pixelsPerMin = 30;
  const rowHeight = 90;

  const sortedMachines = useMemo(() => {
    if (!productionPlan?.machines) return [];
    return [...productionPlan.machines].sort((a, b) => {
      return a.machineId.localeCompare(b.machineId, undefined, {
        numeric: true,
        sensitivity: 'base'
      });
    });
  }, [productionPlan]);

  const allOps = sortedMachines.flatMap((m) => m.operations || []);
  const maxTime = useMemo(() => Math.max(...allOps.map((op) => op.end_min), 0) + 5, [allOps]);

  const jobColors = useMemo(() => {
    const palette = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4", "#f97316"];
    const mapping = {};
    let colorIndex = 0;
    allOps.forEach(op => {
      const jobId = op.operationId.split("_")[1];
      if (jobId && !mapping[jobId]) {
        mapping[jobId] = palette[colorIndex % palette.length];
        colorIndex++;
      }
    });
    return mapping;
  }, [allOps]);

  if (sortedMachines.length === 0) return <div className="no-data">No data available</div>;

  return (
    <div className="gantt-root">
      <div className="gantt-scroll-container">
        <div className="gantt-header">
          <div className="machine-column-header">Machines</div>
          <div className="timeline-axis">
            {Array.from({ length: maxTime + 1 }).map((_, i) => (
              <div key={i} className={`time-tick ${i % 5 === 0 ? "major" : ""}`} style={{ width: pixelsPerMin }}>
                {i % 5 === 0 && <span className="time-text">{i}m</span>}
              </div>
            ))}
          </div>
        </div>

        {sortedMachines.map((machine) => (
          <div key={machine.machineId} className="machine-row" style={{ height: rowHeight }}>
            <div className="machine-label">{machine.machineId}</div>
            <div
              className="ops-container"
              style={{
                width: maxTime * pixelsPerMin,
                backgroundSize: `${pixelsPerMin}px 100%`
              }}
            >
              {(machine.operations || []).map((op) => {
                const jobId = op.operationId.split("_")[1];
                const startX = op.start_min * pixelsPerMin;
                const width = (op.end_min - op.start_min) * pixelsPerMin;
                const isRelatedJob = hoveredOp && hoveredOp.operationId.split("_")[1] === jobId;

                return (
                  <div
                    key={op.operationId}
                    className={`op-bar ${hoveredOp && !isRelatedJob ? 'is-faded' : ''} ${isRelatedJob ? 'is-highlighted' : ''}`}
                    style={{
                      left: startX,
                      width: Math.max(width - 4, 5),
                      backgroundColor: jobColors[jobId],
                    }}
                    onMouseEnter={(e) => setHoveredOp({ ...op, x: e.clientX, y: e.clientY })}
                    onMouseLeave={() => setHoveredOp(null)}
                  >
                    <div className="op-content">
                      {/* Removed op-time-label from here */}
                      <span className="op-id-label">{op.operationId}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {hoveredOp && (
        <div
          className="gantt-tooltip"
          style={{ left: hoveredOp.x + 15, top: hoveredOp.y - 10 }}
        >
          <div className="tooltip-header" style={{ borderLeftColor: jobColors[hoveredOp.operationId.split("_")[1]] }}>
            <strong>{hoveredOp.operationId}</strong>
          </div>
          <div className="tooltip-body">
            <p><span>Start:</span> {hoveredOp.start_min} min</p>
            <p><span>End:</span> {hoveredOp.end_min} min</p>
            <p><span>Duration:</span> {hoveredOp.duration_min} min</p>
          </div>
        </div>
      )}
    </div>
  );
}