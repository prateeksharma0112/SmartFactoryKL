import { useEffect, useMemo, useState } from "react";
import GanttChart from "../../components/productionPlan/ganttChart";
import ProductionHeader from "./productionPlanHeader";
import config from "../../config";
import "./productionPlan.css";

const ActionIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
    <circle cx="12" cy="12" r="10" fill="#eff6ff" stroke="#93c5fd" strokeWidth="1.2" />
    <circle cx="8" cy="8" r="1.4" fill="#16a34a" />
    <circle cx="8" cy="12" r="1.4" fill="#f59e0b" />
    <circle cx="8" cy="16" r="1.4" fill="#ef4444" />
    <rect x="11" y="7.2" width="6" height="1.4" rx="0.7" fill="#2563eb" />
    <rect x="11" y="11.2" width="4.8" height="1.4" rx="0.7" fill="#2563eb" />
    <rect x="11" y="15.2" width="5.8" height="1.4" rx="0.7" fill="#2563eb" />
  </svg>
);

const GuideIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
    <g fill="none" stroke="#334155" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.8 5.2h5.8c2.1 0 3.6 0.6 4.4 1.7v11.1c-0.8-1.1-2.3-1.7-4.4-1.7H3.8z" />
      <path d="M20.2 5.2h-5.8c-2.1 0-3.6 0.6-4.4 1.7v11.1c0.8-1.1 2.3-1.7 4.4-1.7h5.8z" />
      <circle cx="17.7" cy="7.4" r="2.3" />
      <path d="M17.7 6.8v0.1" />
      <path d="M17.7 8v1.2" />
    </g>
  </svg>
);

const LegendIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
    <circle cx="12" cy="12" r="10" fill="#16a34a" />
    <circle cx="12" cy="12" r="7.1" fill="#ffffff" />
    <path
      d="M10.15 9.75c0-1.16.95-2.1 2.12-2.1 1.17 0 2.12.94 2.12 2.1 0 .95-.62 1.62-1.36 2.02-.78.44-1.16.79-1.16 1.48v.22"
      fill="none"
      stroke="#16a34a"
      strokeWidth="1.35"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12.1" cy="16.45" r="0.95" fill="#16a34a" />
  </svg>
);

const ProductionPlan = () => {
  const [productionPlan, setProductionPlan] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isFollowMode, setIsFollowMode] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const ws = new WebSocket(`${config.WS_BASE_URL}/ws/production_plan`);

    ws.onmessage = (event) => {
      const rawData = JSON.parse(event.data);
      setProductionPlan({ ...rawData.ProductionPlan });
    };

    ws.onerror = (err) => console.error("WebSocket error:", err);

    return () => {
      if (ws.readyState === WebSocket.OPEN) ws.close();
    };
  }, []);

  const formattedDate = currentDate.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric"
  });

  const formattedTime = currentDate.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });

  const planSnapshot = useMemo(() => {
    const machines = productionPlan?.machines || [];
    const operations = machines.flatMap((machine) => machine.operations || []);
    const running = operations.filter(
      (op) => String(op?.status || "").toLowerCase() === "running"
    ).length;
    const frozen = operations.filter((op) => Boolean(op?.isFrozen)).length;

    return {
      machines: machines.length,
      operations: operations.length,
      running,
      frozen,
    };
  }, [productionPlan]);

  return (
    <div className="homepage-container production-plan-page">
      <div className="plan-layout">
        <div className="plan-main-content">
          <section className="plan-top-bar" aria-label="Production context and metrics">
            <section className="plan-header-panel plan-top-context" aria-label="Production schedule status">
              <ProductionHeader
                formattedDate={formattedDate}
                formattedTime={formattedTime}
                productionPlan={productionPlan}
                isFollowMode={isFollowMode}
                setIsFollowMode={setIsFollowMode}
              />
            </section>
          </section>

          {productionPlan ? (
            <GanttChart
              productionPlan={productionPlan}
              isFollowMode={isFollowMode}
            />
          ) : (
            <div className="loading-container">
              <div className="loader-dots">Loading Production Plan ...</div>
            </div>
          )}
        </div>

        <aside className="plan-right-sidebar" aria-label="How to read production plan">
          <section className="plan-snapshot-strip plan-right-kpis" aria-label="Operations snapshot">
            <h3 className="plan-snapshot-heading">Overview</h3>

            <div className="plan-snapshot-grid">
              <article className="plan-snapshot-card">
                <p className="plan-snapshot-label">Machines</p>
                <p className="plan-snapshot-value">{planSnapshot.machines}</p>
                <p className="plan-snapshot-desc">Active units</p>
              </article>

              <article className="plan-snapshot-card">
                <p className="plan-snapshot-label">Operations</p>
                <p className="plan-snapshot-value">{planSnapshot.operations}</p>
                <p className="plan-snapshot-desc">Total tasks</p>
              </article>

              <article className="plan-snapshot-card plan-snapshot-card-running">
                <p className="plan-snapshot-label">Running</p>
                <p className="plan-snapshot-value">{planSnapshot.running}</p>
                <p className="plan-snapshot-desc">In progress</p>
              </article>

              <article className="plan-snapshot-card plan-snapshot-card-frozen">
                <p className="plan-snapshot-label">Frozen</p>
                <p className="plan-snapshot-value">{planSnapshot.frozen}</p>
                <p className="plan-snapshot-desc">Locked tasks</p>
              </article>
            </div>
          </section>

          <div className="plan-accordion-stack">
            <p className="plan-accordion-context">
              Need guidance with this view? Use the sections below for schedule reading, symbol meaning, and monitoring actions.
            </p>

            <details className="plan-accordion plan-guide-panel">
              <summary className="plan-accordion-summary">
                <span className="plan-accordion-title plan-accordion-title-with-icon">
                  <span className="plan-action-icon-wrap" aria-hidden="true">
                    <GuideIcon />
                  </span>
                  Timeline Guide
                </span>
              </summary>

              <div className="plan-accordion-body">
                <p className="plan-guide-intro">Use this sequence to review schedule flow quickly.</p>
                <div className="plan-step-list">
                  <div className="plan-step-item">
                    <span className="plan-step-index">1</span>
                    <p className="plan-guide-text">Start with one machine row to understand local sequence context.</p>
                  </div>
                  <div className="plan-step-item">
                    <span className="plan-step-index">2</span>
                    <p className="plan-guide-text">Scan bars left to right to verify order and overlap points.</p>
                  </div>
                  <div className="plan-step-item">
                    <span className="plan-step-index">3</span>
                    <p className="plan-guide-text">Compare bars to the NOW line to identify active and next operations.</p>
                  </div>
                </div>
              </div>
            </details>

            <details className="plan-accordion plan-guide-panel">
              <summary className="plan-accordion-summary">
                <span className="plan-accordion-title plan-accordion-title-with-icon">
                  <span className="plan-action-icon-wrap" aria-hidden="true">
                    <LegendIcon />
                  </span>
                  Status Legend
                </span>
              </summary>

              <div className="plan-accordion-body">
                <p className="plan-guide-intro">Each visual cue maps directly to execution state.</p>
                <div className="plan-legend-list">
                  <div className="plan-legend-item">
                    <span className="plan-legend-swatch plan-legend-order" />
                    <span>Same order always keeps the same color.</span>
                  </div>
                  <div className="plan-legend-item">
                    <span className="plan-legend-swatch plan-legend-running" />
                    <span>Running operation.</span>
                  </div>
                  <div className="plan-legend-item">
                    <span className="plan-legend-swatch plan-legend-finished" />
                    <span>Finished operation.</span>
                  </div>
                  <div className="plan-legend-item">
                    <span className="plan-legend-lock">LOCK</span>
                    <span>Frozen operation, locked from scheduling updates.</span>
                  </div>
                  <div className="plan-legend-item">
                    <span className="plan-legend-now" />
                    <span>Current-time reference line.</span>
                  </div>
                </div>
              </div>
            </details>

            <details className="plan-accordion plan-guide-panel">
              <summary className="plan-accordion-summary">
                <span className="plan-accordion-title plan-accordion-title-with-icon">
                  <span className="plan-action-icon-wrap">
                    <ActionIcon />
                  </span>
                  Monitoring Actions
                </span>
              </summary>

              <div className="plan-accordion-body">
                <p className="plan-guide-intro">Use these controls to monitor plan health during live updates.</p>
                <p className="plan-guide-text">Hover any bar to inspect order, machine, status, and timing.</p>
                <p className="plan-guide-text">Enable Follow Mode to keep the NOW line centered.</p>
                <p className="plan-guide-text">Use horizontal scroll for long planning horizons.</p>
              </div>
            </details>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ProductionPlan;