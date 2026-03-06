import React, { useMemo, useState, useEffect } from "react";
import "./ganttChart.css";

export default function GanttChart({ productionPlan }) {
  const [hoveredOp, setHoveredOp] = useState(null);
  const [hoveredNow, setHoveredNow] = useState(null); // New state for NOW hover
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(timer);
  }, []);

  const pixelsPerMin = 30;
  const rowHeight = 90;

  const machines = useMemo(() => {
    if (!productionPlan?.machines) return [];
    return [...productionPlan.machines].sort((a, b) => {
      return a.machineId.localeCompare(b.machineId, undefined, { numeric: true, sensitivity: 'base' });
    });
  }, [productionPlan]);

  const snappedStartBase = useMemo(() => {
    const allOps = machines.flatMap(m => m.operations || []);
    if (allOps.length === 0) return null;

    const firstOp = allOps.reduce((earliest, current) =>
      new Date(current.start) < new Date(earliest.start) ? current : earliest
      , allOps[0]);

    const actualStart = new Date(firstOp.start);
    const snapped = new Date(actualStart);
    snapped.setUTCMinutes(Math.floor(actualStart.getUTCMinutes() / 5) * 5, 0, 0);
    return snapped;
  }, [machines]);

  const processedMachines = useMemo(() => {
    if (!snappedStartBase) return [];
    return machines.map(machine => ({
      ...machine,
      operations: (machine.operations || []).map(op => {
        const opStart = new Date(op.start);
        const opEnd = new Date(op.end);
        const startOffset = (opStart.getTime() - snappedStartBase.getTime()) / 60000;
        const endOffset = (opEnd.getTime() - snappedStartBase.getTime()) / 60000;

        return {
          ...op,
          machineId: machine.machineId, // Added machine context
          orderId: op.orderId, // Added Order ID
          status: op.status, // Added status
          isFrozen: op.isFrozen, // Added frozen flag
          renderX: startOffset,
          renderW: endOffset - startOffset,
          duration_min: (opEnd.getTime() - opStart.getTime()) / 60000
        };
      })
    }));
  }, [machines, snappedStartBase]);

  const maxTimeMins = useMemo(() => {
    const allOps = processedMachines.flatMap(m => m.operations);
    return allOps.length > 0 ? Math.max(...allOps.map(op => op.renderX + op.renderW)) + 10 : 60;
  }, [processedMachines]);

  const nowLineX = useMemo(() => {
    if (!snappedStartBase) return -1000;
    const localNow = new Date();
    const shiftedNow = Date.now() - (localNow.getTimezoneOffset() * 60000);
    const startUTC = snappedStartBase.getTime();
    const diffMins = (shiftedNow - startUTC) / 60000;
    return diffMins * pixelsPerMin;
  }, [now, snappedStartBase, pixelsPerMin]);

  const jobColors = useMemo(() => {
    const palette = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4", "#f97316"];
    const mapping = {};
    let colorIndex = 0;
    processedMachines.flatMap(m => m.operations).forEach(op => {
      const jobId = op.operationId.split("_")[1];
      if (jobId && !mapping[jobId]) {
        mapping[jobId] = palette[colorIndex % palette.length];
        colorIndex++;
      }
    });
    return mapping;
  }, [processedMachines]);

  const getClockLabel = (mins) => {
    if (!snappedStartBase) return "";
    const date = new Date(snappedStartBase.getTime() + mins * 60000);
    return `${String(date.getUTCHours()).padStart(2, '0')}:${String(date.getUTCMinutes()).padStart(2, '0')}`;
  };

  const getFullTimeLabel = (mins) => {
    if (!snappedStartBase) return "";
    const date = new Date(snappedStartBase.getTime() + mins * 60000);
    return `${String(date.getUTCHours()).padStart(2, '0')}:${String(date.getUTCMinutes()).padStart(2, '0')}:${String(date.getUTCSeconds()).padStart(2, '0')}`;
  };

  // Helper for high-precision validation tooltip
  const getLivePrecisionTime = () => {
    return new Date().toLocaleTimeString('en-GB', { hour12: false });
  };

  if (processedMachines.length === 0) return <div className="no-data">Initializing Schedule...</div>;

  return (
    <div className="gantt-root" style={{ position: 'relative' }} >
      {/* FIXED CENTERED INDICATOR - Anchored to gantt-root */}
      <div className="gantt-unit-indicator-container">
        <span className="gantt-unit-pill">
          Production Time (HH:mm)
        </span>
      </div>

      {/* Wrap everything in a flex container */}
      <div style={{ display: 'flex' }}>

        {/* 1. FIXED COLUMN: Machines (Y-Axis) */}
        <div className="machine-sidebar-fixed" >
          <div className="machine-column-header">Machines</div>
          {processedMachines.map((machine) => (
            <div
              key={machine.machineId}
              className="machine-label"
              style={{ height: rowHeight }}
            >
              {machine.machineId}
            </div>
          ))}
        </div>

        {/* 2. SCROLLABLE COLUMN: Timeline (X-Axis) */}
        <div className="gantt-scroll-container" style={{ flexGrow: 1, overflowX: 'auto' }}>
          {/* Header with Timeline Axis */}
          <div className="gantt-header">
            <div className="timeline-axis" style={{ width: maxTimeMins * pixelsPerMin }}>
              {Array.from({ length: Math.ceil(maxTimeMins / 5) + 1 }).map((_, i) => {
                const mins = i * 5;
                return (
                  <div key={mins} className="time-tick major" style={{ left: mins * pixelsPerMin }}>
                    <span className="time-text">{getClockLabel(mins)}</span>
                  </div>

                );
              })}
            </div>
          </div>

          {/* Body with NOW line and Operations */}
          <div className="gantt-body-relative" style={{ width: maxTimeMins * pixelsPerMin }}>

            {/* NOW LINE OVERLAY - Positioned relative to the timeline start */}
            <div className="gantt-now-overlay" style={{ width: maxTimeMins * pixelsPerMin }}>
              <div className="now-line" style={{ left: nowLineX }}>
                <div
                  className="now-tag"
                  onMouseEnter={(e) => setHoveredNow({ x: e.clientX, y: e.clientY })}
                  onMouseLeave={() => setHoveredNow(null)}
                >
                  NOW
                </div>
              </div>
            </div>

            {processedMachines.map((machine) => (
              <div key={machine.machineId} className="machine-row" style={{ height: rowHeight }}>
                <div className="ops-container" style={{ width: maxTimeMins * pixelsPerMin, backgroundSize: `${pixelsPerMin}px 100%` }}>
                  {machine.operations.map((op) => {
                    const jobId = op.operationId.split("_")[1];

                    // 1. Logic for Past (Finished)
                    const isFinished = (op.renderX + op.renderW) * pixelsPerMin < nowLineX;

                    // 2. Logic for Running (Currently Active)
                    const isRunning = nowLineX >= (op.renderX * pixelsPerMin) &&
                      nowLineX <= (op.renderX + op.renderW) * pixelsPerMin;

                    return (
                      <div
                        key={op.operationId}
                        className={`op-bar 
        ${hoveredOp && hoveredOp.operationId.split("_")[1] !== jobId ? 'is-faded' : ''} 
        ${isFinished ? 'op-finished' : ''}
        ${isRunning ? 'op-running' : ''}`}
                        style={{
                          left: op.renderX * pixelsPerMin,
                          width: Math.max(op.renderW * pixelsPerMin - 4, 5),
                          backgroundColor: jobColors[jobId],
                        }}
                        onMouseEnter={(e) => setHoveredOp({ ...op, x: e.clientX, y: e.clientY })}
                        onMouseLeave={() => setHoveredOp(null)}
                      >
                        <div className="op-content" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0 8px' }}>
                          {/* 3. Logic for Frozen (Lock Icon) */}
                          {op.isFrozen && <span style={{ fontSize: '12px' }}>🔒</span>}
                          <span className="op-id-label" style={{ fontWeight: isRunning ? '800' : '500' }}>
                            {op.operationId}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* JOB TOOLTIP */}
      {hoveredOp && (
        <div className="gantt-tooltip" style={{ left: hoveredOp.x + 15, top: hoveredOp.y - 10 }}>
          <div className="tooltip-header" style={{
            borderLeftColor: jobColors[hoveredOp.operationId.split("_")[1]],
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <strong className="tooltip-title">{hoveredOp.operationId}</strong>
            {/* Frozen indicator in the header */}
            {hoveredOp.isFrozen && <span title="Frozen" style={{ fontSize: '14px' }}>❄️</span>}
          </div>

          <div className="tooltip-body">
            {/* ADDED: Order ID & Machine */}
            <div className="tooltip-time-row">
              <span className="tooltip-label">ORDER ID</span>
              <strong className="tooltip-value">{hoveredOp.orderId}</strong>
            </div>
            <div className="tooltip-time-row">
              <span className="tooltip-label">MACHINE</span>
              <strong className="tooltip-value">{hoveredOp.machineId}</strong>
            </div>
            <div className="tooltip-time-row">
              <span className="tooltip-label">STATUS</span>
              <strong className="tooltip-value" style={{ textTransform: 'uppercase' }}>{hoveredOp.status}</strong>
            </div>

            <div className="tooltip-divider" style={{ margin: '8px 0', borderTop: '1px solid #e2e8f0' }}></div>

            {/* KEPT: Original formatting for Dates and Times */}
            <div className="tooltip-time-row">
              <span className="tooltip-label">START DATE</span>
              <strong className="tooltip-value">{new Date(hoveredOp.start).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}</strong>
            </div>
            <div className="tooltip-time-row">
              <span className="tooltip-label">START TIME</span>
              <strong className="tooltip-value">{getFullTimeLabel(hoveredOp.renderX)}</strong>
            </div>
            <div className="tooltip-time-row">
              <span className="tooltip-label">END TIME</span>
              <strong className="tooltip-value">{getFullTimeLabel(hoveredOp.renderX + hoveredOp.renderW)}</strong>
            </div>
            <div className="tooltip-divider">
              <span className="tooltip-label">DURATION: </span>
              <span className="tooltip-duration">{Math.round(hoveredOp.duration_min)} min</span>
            </div>
          </div>
        </div>
      )}

      {/* NOW LINE VALIDATION TOOLTIP */}
      {hoveredNow && (
        <div className="gantt-tooltip now-validation-tooltip" style={{ left: hoveredNow.x + 15, top: hoveredNow.y - 10 }}>
          <div className="tooltip-header" style={{ borderLeftColor: '#ef4444' }}>
            <strong className="tooltip-title">Live Status</strong>
          </div>
          <div className="tooltip-body">
            <div className="tooltip-time-row">
              <span className="tooltip-label">CURRENT TIME (HH:MM:SS)</span>
              <strong className="tooltip-value" style={{ color: '#ef4444' }}>{getLivePrecisionTime()}</strong>
            </div>
            <div className="tooltip-time-row">
              <span className="tooltip-label">CURRENT DATE</span>
              <strong className="tooltip-value" style={{ color: '#ef4444' }}>
                {new Date(productionPlan.currentTime || now).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}