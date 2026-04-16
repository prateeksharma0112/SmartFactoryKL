import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import OperationsOverviewSection from "../../components/home/OperationsOverviewSection";
import OrdersOverviewSection from "../../components/home/OrdersOverviewSection";
import config from "../../config";

const Home = () => {
  const [data, setData] = useState({
    factory: { name: "", country: "", uniqueId: "", islandsCount: 0 },
    orders: { total: 0, planned: 0, running: 0, finished: 0 },
  });
  const [streamStatus, setStreamStatus] = useState("connecting");
  const [lastUpdate, setLastUpdate] = useState(null);
  const [operations, setOperations] = useState({
    total: 0,
    running: 0,
    finished: 0,
    frozen: 0,
  });

  useEffect(() => {
    // 1. Initial Fetch to prevent blank screen
    const fetchInitialData = async () => {
      try {
        const response = await fetch(`${config.API_BASE_URL}/dashboard`);
        const result = await response.json();
        setData(result);
        setLastUpdate(new Date());
      } catch (err) {
        console.error("Initial fetch failed:", err);
      }
    };

    fetchInitialData();

    // 2. WebSocket Connection
    let ws = new WebSocket(`${config.WS_BASE_URL}/ws/dashboard`);

    ws.onopen = () => {
      setStreamStatus("live");
      console.log("Connected!");
    };
    ws.onmessage = (event) => {
      const dashboardData = JSON.parse(event.data);
      setData(dashboardData);
      setStreamStatus("live");
      setLastUpdate(new Date());
    };
    ws.onerror = (err) => {
      setStreamStatus("issue");
      console.error("WebSocket error:", err);
    };

    ws.onclose = () => {
      setStreamStatus((prev) => (prev === "issue" ? "issue" : "offline"));
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) ws.close();
    };
  }, []);

  useEffect(() => {
    const ws = new WebSocket(`${config.WS_BASE_URL}/ws/production_plan`);

    ws.onmessage = (event) => {
      const payload = JSON.parse(event.data);
      const machines = payload?.ProductionPlan?.machines || [];
      const allOps = machines.flatMap((machine) => machine.operations || []);

      const running = allOps.filter((op) =>
        String(op?.status || "").toLowerCase() === "running"
      ).length;
      const finished = allOps.filter((op) =>
        String(op?.status || "").toLowerCase() === "finished"
      ).length;
      const frozen = allOps.filter((op) => Boolean(op?.isFrozen)).length;

      setOperations({
        total: allOps.length,
        running,
        finished,
        frozen,
      });
    };

    ws.onerror = (err) => {
      console.error("Operations WebSocket error:", err);
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) ws.close();
    };
  }, []);

  const { factory, orders } = data;
  const completionRate = orders.total > 0
    ? Math.round((orders.finished / orders.total) * 100)
    : 0;
  const activeLoad = orders.total > 0
    ? Math.round((orders.running / orders.total) * 100)
    : 0;
  const streamLabel = streamStatus === "live"
    ? "Live"
    : streamStatus === "connecting"
      ? "Connecting"
      : streamStatus === "issue"
        ? "Connection Issue"
        : "Offline";
  const lastUpdateLabel = lastUpdate
    ? lastUpdate.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
    : "--:--:--";

  return (
    <div className="homepage-container">
      <section className="hero-value-section" aria-label="Product value statement">
        <p className="hero-value-eyebrow">Trade Fair Demo View</p>
        <h1 className="hero-value-title">SmartFactory KL Live Operations Cockpit</h1>
        <p className="hero-value-subtitle">
          Monitor production flow in real time, identify bottlenecks at a glance, and support faster scheduling decisions.
        </p>
        <div className="hero-value-points" role="list" aria-label="Core value points">
          <span className="hero-point" role="listitem">Live Production Visibility</span>
          <span className="hero-point" role="listitem">Rapid Bottleneck Detection</span>
          <span className="hero-point" role="listitem">Decision-Ready Scheduling</span>
        </div>
      </section>

      <div className="home-layout">
        <aside className="home-sidebar home-sidebar-left" aria-label="Factory context sidebar">
          <section className="sidebar-panel" aria-label="Factory context">
            <p className="sidebar-panel-label">Factory Profile</p>
            <p className="factory-profile-name">{factory.name || "-"}</p>
            <p className="sidebar-note sidebar-note-compact">
              Context block for the production KPIs shown in the center area.
            </p>
            <div className="context-chip-row">
              <span className="context-chip">Country: {factory.country || "-"}</span>
              <span className="context-chip">Islands: {factory.islandsCount ?? 0}</span>
            </div>
            <div className="context-list">
              <div className="context-item">
                <span className="context-key">Factory ID</span>
                <span className="context-value">{factory.uniqueId || "-"}</span>
              </div>
              <div className="context-item">
                <span className="context-key">Data Refresh</span>
                <span className="context-value">2 s</span>
              </div>
            </div>
          </section>

          <section className="sidebar-panel">
            <p className="sidebar-panel-label">System Stream</p>
            <div className={`sidebar-status-pill status-${streamStatus}`}>
              <span className="sidebar-status-dot" />
              <span>{streamLabel}</span>
            </div>
            <p className="sidebar-note">Last update: {lastUpdateLabel}</p>
          </section>
        </aside>

        <main className="home-main">
        <section className="home-kpi-strip" aria-label="Operational summary">
          <article className="home-kpi-tile">
            <p className="home-kpi-label">Total Orders</p>
            <p className="home-kpi-value">{orders.total}</p>
            <p className="home-kpi-meta">All orders tracked in the current plan</p>
          </article>

          <article className="home-kpi-tile">
            <p className="home-kpi-label">Completion Rate</p>
            <p className="home-kpi-value">{completionRate}%</p>
            <p className="home-kpi-meta">Share of orders already finished</p>
          </article>

          <article className="home-kpi-tile">
            <p className="home-kpi-label">Active Load</p>
            <p className="home-kpi-value">{activeLoad}%</p>
            <p className="home-kpi-meta">Orders currently running in production</p>
          </article>
        </section>

        <div className="home-sections-grid">
          <OrdersOverviewSection orders={orders} />
          <OperationsOverviewSection operations={operations} />
        </div>
        </main>

        <aside className="home-sidebar home-sidebar-right" aria-label="Live overview sidebar">
          <section className="sidebar-panel">
            <p className="sidebar-panel-label">Visitor Guide</p>
            <p className="sidebar-note">1. Use Total Orders, Completion Rate, and Active Load for a quick overview.</p>
            <p className="sidebar-note">2. Open Production Plan to view machine operations on the timeline.</p>
            <p className="sidebar-note">3. Use the NOW line and Follow Mode to track current execution in real time.</p>
          </section>

          <section className="sidebar-panel">
            <p className="sidebar-panel-label">Quick Navigation</p>
            <Link className="sidebar-action-link" to="/production-plan">
              Open Production Plan
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
};

export default Home;
