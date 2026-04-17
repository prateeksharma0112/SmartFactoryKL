import React, { useMemo, useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import "./ganttChart.css";
import {
  CHART_MIN_DURATION_MIN,
  CHART_PRE_NOW_BUFFER_MIN,
  CHART_TAIL_PADDING_MIN,
  DEFAULT_BAR_COLOR,
  NOW_REFRESH_INTERVAL_MS,
  NOW_TOOLTIP_SIZE,
  OP_BAR_GAP_PX,
  OP_BAR_MIN_WIDTH_PX,
  OP_TOOLTIP_SIZE,
  TIME_SNAP_MIN,
  buildOrderColorMap,
  formatLocalTime,
  getCurrentOffsetMinutes,
  getEarliestOperation,
  getOrderKey,
  getTooltipPosition,
} from "./ganttChart.utils";

/**
 * GanttChart Component
 * Renders a production schedule with real-time tracking, auto-scrolling, 
 * and interactive tooltips for machine operations.
 */
export default function GanttChart({ productionPlan, isFollowMode }) {
  // 1) Component state and refs
  const [hoveredOp, setHoveredOp] = useState(null);
  const [hoveredNow, setHoveredNow] = useState(null);
  const [now, setNow] = useState(0);
  const scrollContainerRef = useRef(null);

  // 2) Layout constants
  const pixelsPerMin = 30; // Horizontal scale
  const rowHeight = 90;    // Vertical machine row height

  // 3) Lifecycle timers
  useEffect(() => {
    // Keeps "now" tooltip date/time refreshed.
    const tick = () => setNow(Date.now());
    const kickoff = setTimeout(tick, 0);
    const timer = setInterval(tick, NOW_REFRESH_INTERVAL_MS);
    return () => {
      clearTimeout(kickoff);
      clearInterval(timer);
    };
  }, []);

  // 4) Data preparation
  // Sort machines alphanumerically (M1, M2, M10).
  const machines = useMemo(() => {
    if (!productionPlan?.machines) return [];
    return [...productionPlan.machines].sort((a, b) => {
      return a.machineId.localeCompare(b.machineId, undefined, { numeric: true, sensitivity: 'base' });
    });
  }, [productionPlan]);

  // Global chart start snapped to 5-minute boundaries (in local timezone).
  // Includes a 30-minute buffer before NOW/first operation so NOW line appears in middle.
  const snappedStartBase = useMemo(() => {
    const firstOp = getEarliestOperation(machines);
    if (!firstOp) return null;

    // Use whichever is earlier: now or first operation start, then subtract 30-minute buffer
    const nowTime = new Date();
    const firstOpTime = new Date(firstOp.start);
    const baseTime = nowTime < firstOpTime ? nowTime : firstOpTime;
    
    // Go back 30 minutes for buffer
    const withBuffer = new Date(baseTime.getTime() - CHART_PRE_NOW_BUFFER_MIN * 60000);

    const snapped = new Date(withBuffer);
    snapped.setMinutes(
      Math.floor(withBuffer.getMinutes() / TIME_SNAP_MIN) * TIME_SNAP_MIN,
      0,
      0
    );
    return snapped;
  }, [machines]);

  // Compute x/width coordinates for rendering.
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

  // 5) Visual model (time scale + colors)
  // Chart width includes both operations and current time line.
  const maxTimeMins = useMemo(() => {
    const allOps = processedMachines.flatMap(m => m.operations);
    const opsMax = allOps.length > 0 ? Math.max(...allOps.map(op => op.renderX + op.renderW)) : 0;

    const currentOffset = getCurrentOffsetMinutes(snappedStartBase, now);

    const totalMax = Math.max(opsMax, currentOffset) + CHART_TAIL_PADDING_MIN; // Include current time
    return Math.max(totalMax, CHART_MIN_DURATION_MIN); // Minimum timeline width
  }, [processedMachines, snappedStartBase, now]);

  // Horizontal pixel location of the "Now" line.
  const nowLineX = useMemo(() => {
    return getCurrentOffsetMinutes(snappedStartBase, now) * pixelsPerMin;
  }, [snappedStartBase, pixelsPerMin, now]);

  const orderColorMap = useMemo(() => {
    return buildOrderColorMap(processedMachines);
  }, [processedMachines]);

  // 6) Interaction logic
  // Follow mode keeps the current time line near center.
  useEffect(() => {
    if (isFollowMode && scrollContainerRef.current && typeof nowLineX === 'number' && nowLineX > -1000) {
      const container = scrollContainerRef.current;
      const viewportWidth = container.offsetWidth;

      if (viewportWidth > 0) {
        // Clamp target so follow mode never overshoots scroll boundaries.
        const centeredScroll = nowLineX - (viewportWidth / 2);
        const maxScrollLeft = Math.max(container.scrollWidth - container.clientWidth, 0);
        const targetScroll = Math.max(0, Math.min(centeredScroll, maxScrollLeft));
        container.scrollTo({
          left: targetScroll,
          behavior: 'smooth'
        });
      }
    }
  }, [nowLineX, isFollowMode]);

  // 7) Formatting helpers
  const getClockLabel = (mins) => {
    if (!snappedStartBase) return "";
    const date = new Date(snappedStartBase.getTime() + mins * 60000);
    return formatLocalTime(date);
  };

  const getFullTimeLabel = (mins) => {
    if (!snappedStartBase) return "";
    const date = new Date(snappedStartBase.getTime() + mins * 60000);
    return formatLocalTime(date, true);
  };

  const getLivePrecisionTime = () => {
    return new Date().toLocaleTimeString("en-GB", { hour12: false });
  };

  // 8) Derived UI state
  const opTooltipPos = hoveredOp ? getTooltipPosition(hoveredOp, OP_TOOLTIP_SIZE.width, OP_TOOLTIP_SIZE.height) : null;
  const nowTooltipPos = hoveredNow ? getTooltipPosition(hoveredNow, NOW_TOOLTIP_SIZE.width, NOW_TOOLTIP_SIZE.height) : null;
  const hoveredOrderKey = hoveredOp ? getOrderKey(hoveredOp) : null;

  // 9) Render
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
                    const orderKey = getOrderKey(op);
                    const isFinished = (op.renderX + op.renderW) * pixelsPerMin < nowLineX;
                    const isRunning = nowLineX >= (op.renderX * pixelsPerMin) &&
                      nowLineX <= (op.renderX + op.renderW) * pixelsPerMin;

                    return (
                      <div
                        key={op.operationId}
                        className={`op-bar 
                          ${hoveredOrderKey && hoveredOrderKey !== orderKey ? 'is-faded' : ''} 
                          ${isFinished ? 'op-finished' : ''}
                          ${isRunning ? 'op-running' : ''}`}
                        style={{
                          left: op.renderX * pixelsPerMin,
                          width: Math.max(op.renderW * pixelsPerMin - OP_BAR_GAP_PX, OP_BAR_MIN_WIDTH_PX),
                          backgroundColor: orderColorMap[orderKey] || DEFAULT_BAR_COLOR,
                        }}
                        onMouseEnter={(e) => setHoveredOp({ ...op, x: e.clientX, y: e.clientY })}
                        onMouseLeave={() => setHoveredOp(null)}
                      >
                        {op.isFrozen && (
                          <div className="op-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                            <span style={{ fontSize: '12px' }}>🔒</span>
                          </div>
                        )}
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
      {hoveredOp && typeof document !== "undefined" && createPortal(
        <div className="gantt-tooltip" style={{ left: opTooltipPos.left, top: opTooltipPos.top }}>
          <div className="tooltip-header" style={{
            borderLeftColor: orderColorMap[hoveredOrderKey] || DEFAULT_BAR_COLOR,
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
        </div>,
        document.body
      )}

      {/* "Now" Line Validation Details */}
      {hoveredNow && typeof document !== "undefined" && createPortal(
        <div className="gantt-tooltip now-validation-tooltip" style={{ left: nowTooltipPos.left, top: nowTooltipPos.top }}>
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
        </div>,
        document.body
      )}
    </div>
  );
}