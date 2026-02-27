import { useState, useEffect } from "react";
import GanttChart from "../../components/productionPlan/ganttChart";

const ProductionPlan = () => {
  const [productionPlan, setProductionPlan] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Keep the date updated (refreshes every minute)
  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 60000);
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

  // Format date nicely: e.g., "Thursday, Feb 26, 2026"
  const formattedDate = currentDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="homepage-container">
      {/* INTUITIVE HEADER */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        padding: '0 4px',
        borderBottom: '1px solid #e2e8f0',
        paddingBottom: '12px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
            <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.6rem', fontWeight: '800' }}>
              Production Schedule
            </h2>
            {/* NEW DATE DISPLAY */}
            <span style={{ 
              color: '#94a3b8', 
              fontSize: '0.9rem', 
              fontWeight: '500',
              borderLeft: '2px solid #e2e8f0',
              paddingLeft: '12px' 
            }}>
              {formattedDate}
            </span>
          </div>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>
            Real-time machine allocation and job sequence
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Status Pill */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '9999px',
            backgroundColor: productionPlan ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${productionPlan ? '#bbf7d0' : '#fecaca'}`,
            color: productionPlan ? '#166534' : '#991b1b',
            fontSize: '0.75rem',
            fontWeight: '700',
            letterSpacing: '0.05em'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: productionPlan ? '#22c55e' : '#ef4444',
              display: 'inline-block',
              boxShadow: productionPlan ? '0 0 8px #22c55e' : 'none'
            }} />
            {productionPlan ? 'LIVE SYSTEM' : 'CONNECTING...'}
          </div>
        </div>
      </div>

      {productionPlan ? (
        <GanttChart productionPlan={productionPlan} />
      ) : (
        <div style={{ textAlign: 'center', padding: '50px', color: '#64748b' }}>
          {/* Creative Loader */}
          <div className="loader-dots">Loading Production Plan ...</div>
          <style>{`
            .loader-dots:after {
              content: '.';
              animation: dots 1.5s steps(5, end) infinite;
            }
            @keyframes dots {
              0%, 20% { content: '.'; }
              40% { content: '..'; }
              60% { content: '...'; }
              80%, 100% { content: ''; }
            }
          `}</style>
        </div>
      )}
    </div>
  );
};

export default ProductionPlan;