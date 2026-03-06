import { useState, useEffect } from "react";
import GanttChart from "../../components/productionPlan/ganttChart";
import ProductionHeader from "./productionHeader";
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
    const ws = new WebSocket("ws://localhost:8000/ws/production_plan");

    ws.onopen = () => console.log("WebSocket connected!");

    ws.onmessage = (event) => {
      const rawData = JSON.parse(event.data);
      setProductionPlan({ ...rawData.ProductionPlan });
      console.log("UI Update Triggered");
    };

    ws.onerror = (err) => console.error("WebSocket error:", err);

    return () => {
      if (ws.readyState === WebSocket.OPEN) ws.close();
    };
  }, []);

  const formattedDate = currentDate.toLocaleDateString("en-US", {
    weekday: "long",
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

  return (
    <div className="homepage-container">
      <ProductionHeader
        formattedDate={formattedDate}
        formattedTime={formattedTime}
        productionPlan={productionPlan}
        isFollowMode={isFollowMode}
        setIsFollowMode={setIsFollowMode}
      />

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
  );
};

export default ProductionPlan;