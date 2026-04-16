import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import FactoryInfoSection from "../../components/home/FactoryInfoSection";
import OrdersOverviewSection from "../../components/home/OrdersOverviewSection";
import config from "../../config";

const Home = () => {
  const [data, setData] = useState({
    factory: { name: "", country: "", uniqueId: "", islandsCount: 0 },
    orders: { total: 0, planned: 0, running: 0, finished: 0 },
  });
  const [streamStatus, setStreamStatus] = useState("connecting");
  const [lastUpdate, setLastUpdate] = useState(null);

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
          <FactoryInfoSection factory={factory} />
          <OrdersOverviewSection orders={orders} />
        </div>
        </main>

        <aside className="home-sidebar" aria-label="Live overview sidebar">
          <section className="sidebar-panel">
            <p className="sidebar-panel-label">System Stream</p>
            <div className={`sidebar-status-pill status-${streamStatus}`}>
              <span className="sidebar-status-dot" />
              <span>{streamLabel}</span>
            </div>
            <p className="sidebar-note">Last update: {lastUpdateLabel}</p>
          </section>

          <section className="sidebar-panel">
            <p className="sidebar-panel-label">Visitor Guide</p>
            <p className="sidebar-note">1. Start with operational KPIs to assess current load.</p>
            <p className="sidebar-note">2. Open Production Plan to inspect sequence and machine timing.</p>
            <p className="sidebar-note">3. Use live status for confidence during demonstrations.</p>
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
