import { useEffect, useMemo, useState } from "react";
import GanttChart from "../../components/productionPlan/ganttChart";
import ProductionHeader from "./productionPlanHeader";
import config from "../../config";
import "./productionPlan.css";

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
            <details className="plan-accordion plan-guide-panel">
              <summary className="plan-accordion-summary">
                <span className="plan-accordion-title">Schedule guide</span>
              </summary>

              <div className="plan-accordion-body">
                <p className="plan-guide-intro">Use this sequence for a fast schedule review.</p>
                <div className="plan-step-list">
                  <div className="plan-step-item">
                    <span className="plan-step-index">1</span>
                    <p className="plan-guide-text">Start with one machine row to understand local sequence context.</p>
                  </div>
                  <div className="plan-step-item">
                    <span className="plan-step-index">2</span>
                    <p className="plan-guide-text">Scan bars from left to right to verify order and overlap points.</p>
                  </div>
                  <div className="plan-step-item">
                    <span className="plan-step-index">3</span>
                    <p className="plan-guide-text">Compare bars against the NOW line to identify active and next operations.</p>
                  </div>
                </div>
              </div>
            </details>

            <details className="plan-accordion plan-guide-panel">
              <summary className="plan-accordion-summary">
                <span className="plan-accordion-title">Legend</span>
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
                <span className="plan-accordion-title">Actions</span>
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