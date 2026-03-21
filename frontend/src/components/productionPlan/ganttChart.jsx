import React, { useMemo, useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import "./ganttChart.css";

const DEFAULT_BAR_COLOR = "#64748b";
const COLOR_SATURATION_BANDS = [72, 64, 56, 48];
const COLOR_LIGHTNESS_BANDS = [44, 52, 60];

/**
 * Normalizes order id from mixed payload shapes (string/number/object).
 */
const getOrderKey = (op) => {
  const rawOrderId = op?.orderId;

  if (typeof rawOrderId === "string" || typeof rawOrderId === "number") {
    const value = String(rawOrderId).trim();
    return value || "Unknown";
  }

  if (rawOrderId && typeof rawOrderId === "object") {
    const nestedValue = rawOrderId.value ?? rawOrderId.id ?? rawOrderId.orderId ?? rawOrderId.OrderID;
    const value = String(nestedValue ?? "").trim();
    return value || "Unknown";
  }

  return "Unknown";
};

/**
 * Returns minutes elapsed between chart start and now in UTC.
 */
const getCurrentOffsetMinutes = (startBase) => {
  if (!startBase) return 0;
  return (Date.now() - startBase.getTime()) / 60000;
};

/**
 * Builds deterministic colors per order id for the visible dataset.
 */
const buildOrderColorMap = (machines) => {
  const keys = Array.from(new Set(
    machines.flatMap((m) => (m.operations || []).map((op) => getOrderKey(op)))
  )).sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));

  const total = Math.max(keys.length, 1);
  const map = {};

  keys.forEach((key, index) => {
    const hue = (index * 360) / total;
    const sat = COLOR_SATURATION_BANDS[Math.floor(index / 360) % COLOR_SATURATION_BANDS.length];
    const light = COLOR_LIGHTNESS_BANDS[Math.floor(index / (360 * COLOR_SATURATION_BANDS.length)) % COLOR_LIGHTNESS_BANDS.length];
    map[key] = `hsl(${hue.toFixed(2)}, ${sat}%, ${light}%)`;
  });

  return map;
};

/**
 * Keeps tooltip fully visible in the viewport while following cursor position.
 */
const getTooltipPosition = (point, tooltipWidth = 260, tooltipHeight = 160) => {
  if (!point || typeof window === "undefined") {
    return { left: 0, top: 0 };
  }

  const cursorGap = 14;
  const viewportPad = 12;
  const left = Math.max(
    viewportPad,
    Math.min(point.x + cursorGap, window.innerWidth - tooltipWidth - viewportPad)
  );

  // Prefer showing above cursor; flip below when there is no space.
  let top = point.y - tooltipHeight - cursorGap;
  if (top < viewportPad) {
    top = point.y + cursorGap;
  }

  top = Math.max(viewportPad, Math.min(top, window.innerHeight - tooltipHeight - viewportPad));
  return { left, top };
};

/**
 * GanttChart Component
 * Renders a production schedule with real-time tracking, auto-scrolling, 
 * and interactive tooltips for machine operations.
 */
export default function GanttChart({ productionPlan, isFollowMode }) {
  // 1) Component state and refs
  const [hoveredOp, setHoveredOp] = useState(null);
  const [hoveredNow, setHoveredNow] = useState(null);
  const [now, setNow] = useState(Date.now());
  const scrollContainerRef = useRef(null);

  // 2) Layout constants
  const pixelsPerMin = 30; // Horizontal scale
  const rowHeight = 90;    // Vertical machine row height

  // 3) Lifecycle timers
  useEffect(() => {
    // Keeps "now" tooltip date/time refreshed.
    const timer = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(timer);
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
  const snappedStartBase = useMemo(() => {
    const allOps = machines.flatMap(m => m.operations || []);
    if (allOps.length === 0) return null;

    const firstOp = allOps.reduce((earliest, current) =>
      new Date(current.start) < new Date(earliest.start) ? current : earliest
      , allOps[0]);

    const actualStart = new Date(firstOp.start);
    const snapped = new Date(actualStart);
    snapped.setMinutes(Math.floor(actualStart.getMinutes() / 5) * 5, 0, 0);
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

    const currentOffset = getCurrentOffsetMinutes(snappedStartBase);

    const totalMax = Math.max(opsMax, currentOffset) + 10; // Include current time
    return Math.max(totalMax, 60); // Minimum 60 minutes
  }, [processedMachines, snappedStartBase]);

  // Horizontal pixel location of the "Now" line.
  const nowLineX = useMemo(() => {
    return getCurrentOffsetMinutes(snappedStartBase) * pixelsPerMin;
  }, [snappedStartBase, pixelsPerMin]);

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
        const targetScroll = nowLineX - (viewportWidth / 2);
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
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const getFullTimeLabel = (mins) => {
    if (!snappedStartBase) return "";
    const date = new Date(snappedStartBase.getTime() + mins * 60000);
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
  };

  const getLivePrecisionTime = () => {
    return new Date().toLocaleTimeString('en-GB', { hour12: false });
  };

  // 8) Derived UI state
  const opTooltipPos = hoveredOp ? getTooltipPosition(hoveredOp, 320, 260) : null;
  const nowTooltipPos = hoveredNow ? getTooltipPosition(hoveredNow, 260, 150) : null;
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
                          width: Math.max(op.renderW * pixelsPerMin - 4, 5),
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