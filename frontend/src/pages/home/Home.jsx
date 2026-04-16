import React, { useEffect, useState } from "react";
import FactoryInfoSection from "../../components/home/FactoryInfoSection";
import OrdersOverviewSection from "../../components/home/OrdersOverviewSection";
import config from "../../config";

const Home = () => {
  const [data, setData] = useState({
    factory: { name: "", country: "", uniqueId: "", islandsCount: 0 },
    orders: { total: 0, planned: 0, running: 0, finished: 0 },
  });

  useEffect(() => {
    // 1. Initial Fetch to prevent blank screen
    const fetchInitialData = async () => {
      try {
        const response = await fetch(`${config.API_BASE_URL}/dashboard`);
        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error("Initial fetch failed:", err);
      }
    };

    fetchInitialData();

    // 2. WebSocket Connection
    let ws = new WebSocket(`${config.WS_BASE_URL}/ws/dashboard`);

    ws.onopen = () => console.log("Connected!");
    ws.onmessage = (event) => {
      const dashboardData = JSON.parse(event.data);
      setData(dashboardData);
    };
    ws.onerror = (err) => console.error("WebSocket error:", err);

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
    </div>
  );
};

export default Home;
