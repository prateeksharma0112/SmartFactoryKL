const productionPlanHeader = ({
  formattedDate,
  formattedTime,
  productionPlan,
  isFollowMode,
  setIsFollowMode
}) => {
  return (
    <div className="production-header">
      <div>
        <div className="title-row">
          <h2 className="title">Production Schedule</h2>

          <span className="date-display">
            {formattedDate}
          </span>
        </div>

        <p className="subtitle">
          Real-time machine allocation and job sequence
        </p>
      </div>

      <div className="switch-container">
        <span className="switch-label">Follow Mode</span>
        <label className="switch">
          <input
            type="checkbox"
            checked={isFollowMode}
            onChange={(e) => setIsFollowMode(e.target.checked)}
          />
          <span className="slider"></span>
        </label>
      </div>

      <div className="status-time-container">
        <div
          className={`status-pill ${
            productionPlan ? "live" : "connecting"
          }`}
        >
          <span className="status-dot" />
          {productionPlan ? "LIVE SYSTEM" : "CONNECTING..."}
        </div>

        <div className="time-container">
          <span className="time-display">{formattedTime}</span>
          <span className="time-label">HRS</span>
        </div>
      </div>
    </div>
  );
};

export default productionPlanHeader;