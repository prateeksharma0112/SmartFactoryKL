import React, { useMemo, useState, useEffect, useRef } from "react";
import "./ganttChart.css";

/**
 * GanttChart Component
 * Renders a production schedule with real-time tracking, auto-scrolling, 
 * and interactive tooltips for machine operations.
 */
export default function GanttChart({ productionPlan, isFollowMode }) {
  // --- STATE & REFS ---
  const [hoveredOp, setHoveredOp] = useState(null);
  const [hoveredNow, setHoveredNow] = useState(null);
  const [now, setNow] = useState(Date.now());
  const scrollContainerRef = useRef(null);

  // --- CONFIGURATION CONSTANTS ---
  const pixelsPerMin = 30; // Horizontal scale
  const rowHeight = 90;    // Vertical machine row height

  // --- 1. LIFECYCLE / TIMERS ---
  useEffect(() => {
    // Update the "Now" line position every 10 seconds
    const timer = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(timer);
  }, []);

  // --- 2. DATA ORCHESTRATION (useMemo) ---

  // Sort machines alphanumerically (e.g., M1, M2, M10)
  const machines = useMemo(() => {
    if (!productionPlan?.machines) return [];
    return [...productionPlan.machines].sort((a, b) => {
      return a.machineId.localeCompare(b.machineId, undefined, { numeric: true, sensitivity: 'base' });
    });
  }, [productionPlan]);

  // Determine the global start time of the chart, snapped to the nearest 5-minute block
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

  // Transform raw machine/operation data into renderable coordinates
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
          machineId: machine.machineId,
          orderId: op.orderId,
          status: op.status,
          isFrozen: op.isFrozen,
          renderX: startOffset,
          renderW: endOffset - startOffset,
          duration_min: (opEnd.getTime() - opStart.getTime()) / 60000
        };
      })
    }));
  }, [machines, snappedStartBase]);

  // Calculate current time offset from chart start
  const currentTimeOffset = useMemo(() => {
    if (!snappedStartBase) return 0;
    const localNow = new Date();
    const shiftedNow = Date.now() - (localNow.getTimezoneOffset() * 60000);
    const startUTC = snappedStartBase.getTime();
    return (shiftedNow - startUTC) / 60000;
  }, [snappedStartBase]);

  // Calculate total chart width based on operations AND current time
  const maxTimeMins = useMemo(() => {
    const allOps = processedMachines.flatMap(m => m.operations);
    const opsMax = allOps.length > 0 ? Math.max(...allOps.map(op => op.renderX + op.renderW)) : 0;

    // Calculate current time offset inline (no redundant variable)
    let currentOffset = 0;
    if (snappedStartBase) {
      const localNow = new Date();
      const shiftedNow = Date.now() - (localNow.getTimezoneOffset() * 60000);
      const startUTC = snappedStartBase.getTime();
      currentOffset = (shiftedNow - startUTC) / 60000;
    }

    const totalMax = Math.max(opsMax, currentOffset) + 10; // Include current time
    return Math.max(totalMax, 60); // Minimum 60 minutes
  }, [processedMachines, snappedStartBase]);

  // Calculate the horizontal pixel position for the "Now" line
  const nowLineX = useMemo(() => {
    if (!snappedStartBase) return 0;
    const localNow = new Date();
    const shiftedNow = Date.now() - (localNow.getTimezoneOffset() * 60000);
    const startUTC = snappedStartBase.getTime();
    const diffMins = (shiftedNow - startUTC) / 60000;
    return diffMins * pixelsPerMin;
  }, [snappedStartBase, pixelsPerMin]);

  // Assign consistent colors to jobs based on their Job ID
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

  // --- 3. INTERACTION LOGIC ---

  // Handle Follow Mode: Keep the "Now" line centered in the viewport
  useEffect(() => {
    if (isFollowMode && scrollContainerRef.current && typeof nowLineX === 'number' && nowLineX > -1000) {
      const container = scrollContainerRef.current;
      const viewportWidth = container.offsetWidth;

      if (viewportWidth > 0) {
        const targetScroll = nowLineX - (viewportWidth / 2);
        container.scrollTo({
          left: targetScroll,
          behavior: 'smooth'
        });
      }
    }
  }, [nowLineX, isFollowMode]);

  // --- 4. FORMATTING HELPERS ---
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

  const getLivePrecisionTime = () => {
    return new Date().toLocaleTimeString('en-GB', { hour12: false });
  };

  // --- 5. RENDER ---
  if (processedMachines.length === 0) {
    return <div className="no-data">Initializing Schedule...</div>;
  }

  return (
    <div className="gantt-root" style={{ position: 'relative' }} >
      {/* Unit Header */}
      <div className="gantt-unit-indicator-container">
        <span className="gantt-unit-pill">Production Time (HH:mm)</span>
      </div>

      <div style={{ display: 'flex' }}>
        {/* Sticky Left Sidebar: Machines */}
        <div className="machine-sidebar-fixed" >
          <div className="machine-column-header">Machines</div>
          {processedMachines.map((machine) => (
            <div key={machine.machineId} className="machine-label" style={{ height: rowHeight }}>
              {machine.machineId}
            </div>
          ))}
        </div>

        {/* Scrollable Area: Timeline and Operations */}
        <div
          className="gantt-scroll-container"
          ref={scrollContainerRef}
          style={{ flexGrow: 1, overflowX: 'auto' }}
        >
          {/* Time Axis Header */}
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

          {/* Main Body: Operations Grid */}
          <div className="gantt-body-relative" style={{ width: maxTimeMins * pixelsPerMin }}>
            
            {/* Real-time Indicator Overlay */}
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

            {/* Render Rows of Operations per Machine */}
            {processedMachines.map((machine) => (
              <div key={machine.machineId} className="machine-row" style={{ height: rowHeight }}>
                <div className="ops-container" style={{ width: maxTimeMins * pixelsPerMin, backgroundSize: `${pixelsPerMin}px 100%` }}>
                  {machine.operations.map((op) => {
                    const jobId = op.operationId.split("_")[1];
                    const isFinished = (op.renderX + op.renderW) * pixelsPerMin < nowLineX;
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

      {/* --- TOOLTIPS --- */}

      {/* Operation Hover Details */}
      {hoveredOp && (
        <div className="gantt-tooltip" style={{ left: hoveredOp.x + 15, top: hoveredOp.y - 10 }}>
          <div className="tooltip-header" style={{
            borderLeftColor: jobColors[hoveredOp.operationId.split("_")[1]],
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <strong className="tooltip-title">{hoveredOp.operationId}</strong>
            {hoveredOp.isFrozen && <span title="Frozen" style={{ fontSize: '14px' }}>❄️</span>}
          </div>
          <div className="tooltip-body">
            <div className="tooltip-time-row"><span className="tooltip-label">ORDER ID</span><strong className="tooltip-value">{hoveredOp.orderId}</strong></div>
            <div className="tooltip-time-row"><span className="tooltip-label">MACHINE</span><strong className="tooltip-value">{hoveredOp.machineId}</strong></div>
            <div className="tooltip-time-row"><span className="tooltip-label">STATUS</span><strong className="tooltip-value" style={{ textTransform: 'uppercase' }}>{hoveredOp.status}</strong></div>
            <div className="tooltip-divider" style={{ margin: '8px 0', borderTop: '1px solid #e2e8f0' }}></div>
            <div className="tooltip-time-row"><span className="tooltip-label">START DATE</span><strong className="tooltip-value">{new Date(hoveredOp.start).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</strong></div>
            <div className="tooltip-time-row"><span className="tooltip-label">START TIME</span><strong className="tooltip-value">{getFullTimeLabel(hoveredOp.renderX)}</strong></div>
            <div className="tooltip-time-row"><span className="tooltip-label">END TIME</span><strong className="tooltip-value">{getFullTimeLabel(hoveredOp.renderX + hoveredOp.renderW)}</strong></div>
            <div className="tooltip-divider"><span className="tooltip-label">DURATION: </span><span className="tooltip-duration">{Math.round(hoveredOp.duration_min)} min</span></div>
          </div>
        </div>
      )}

      {/* "Now" Line Validation Details */}
      {hoveredNow && (
        <div className="gantt-tooltip now-validation-tooltip" style={{ left: hoveredNow.x + 15, top: hoveredNow.y - 10 }}>
          <div className="tooltip-header" style={{ borderLeftColor: '#ef4444' }}>
            <strong className="tooltip-title">Live Status</strong>
          </div>
          <div className="tooltip-body">
            <div className="tooltip-time-row"><span className="tooltip-label">CURRENT TIME</span><strong className="tooltip-value" style={{ color: '#ef4444' }}>{getLivePrecisionTime()}</strong></div>
            <div className="tooltip-time-row">
              <span className="tooltip-label">DATE</span>
              <strong className="tooltip-value" style={{ color: '#ef4444' }}>
                {new Date(productionPlan.currentTime || now).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
              </strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}