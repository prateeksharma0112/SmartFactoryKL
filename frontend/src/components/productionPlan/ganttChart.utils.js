const COLOR_SATURATION_BANDS = [72, 64, 56, 48];
const COLOR_LIGHTNESS_BANDS = [44, 52, 60];

export const DEFAULT_BAR_COLOR = "#64748b";
export const NOW_REFRESH_INTERVAL_MS = 10000;
export const CHART_PRE_NOW_BUFFER_MIN = 30;
export const TIME_SNAP_MIN = 5;
export const CHART_TAIL_PADDING_MIN = 10;
export const CHART_MIN_DURATION_MIN = 60;
export const OP_BAR_GAP_PX = 4;
export const OP_BAR_MIN_WIDTH_PX = 5;
export const OP_TOOLTIP_SIZE = { width: 320, height: 260 };
export const NOW_TOOLTIP_SIZE = { width: 260, height: 150 };

/**
 * Normalizes order id from mixed payload shapes (string/number/object).
 */
export const getOrderKey = (op) => {
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
 * Returns minutes elapsed between chart start and now.
 * Epoch-time math is timezone-agnostic, so no manual offset conversion is needed.
 */
export const getCurrentOffsetMinutes = (startBase) => {
  if (!startBase) return 0;
  return (Date.now() - startBase.getTime()) / 60000;
};

/**
 * Returns the earliest operation found across all machines, or null for empty datasets.
 */
export const getEarliestOperation = (machines) => {
  const allOps = machines.flatMap((m) => m.operations || []);
  if (allOps.length === 0) return null;

  return allOps.reduce((earliest, current) =>
    new Date(current.start) < new Date(earliest.start) ? current : earliest,
    allOps[0]
  );
};

/**
 * Formats local time labels used on the axis and in tooltips.
 */
export const formatLocalTime = (date, includeSeconds = false) => {
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");

  if (!includeSeconds) return `${hh}:${mm}`;

  const ss = String(date.getSeconds()).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
};

/**
 * Builds deterministic colors per order id for the visible dataset.
 */
export const buildOrderColorMap = (machines) => {
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
export const getTooltipPosition = (point, tooltipWidth = 260, tooltipHeight = 160) => {
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