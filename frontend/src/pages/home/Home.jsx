import React, { useEffect, useState } from "react";
import FactoryInfoSection from "../../components/home/FactoryInfoSection";
import OrdersOverviewSection from "../../components/home/OrdersOverviewSection";


const Home = () => {
  const [data, setData] = useState({
    factory: { name: "", country: "", uniqueId: "", islandsCount: 0 },
    orders: { total: 0, planned: 0, running: 0, finished: 0 },
  });

  useEffect(() => {
    let ws = new WebSocket("ws://localhost:8000/ws/dashboard");

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

  return (
    <div className="homepage-container">
      <FactoryInfoSection factory={data.factory} />
      <OrdersOverviewSection orders={data.orders} />
    </div>
  );
};

export default Home;
