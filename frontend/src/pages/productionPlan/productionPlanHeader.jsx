const productionPlanHeader = ({
  formattedDate,
  formattedTime,
  productionPlan,
  isFollowMode,
  setIsFollowMode
}) => {
  return (
    <section className="production-header production-header-hero" aria-label="Production control center">
      <div className="production-header-shell">
        <div className="production-header-toprow">
          <div className="production-header-copy">
            <p className="production-header-kicker">Production control center</p>
            <div className="production-header-title-row">
              <h2 className="production-header-title">Live production schedule</h2>
              <p className={`production-header-live-line ${productionPlan ? "is-live" : "is-connecting"}`}>
                <span className="production-header-live-dot" />
                {productionPlan ? "Connected" : "Reconnecting"}
              </p>
            </div>
            <p className="production-header-subtitle">
              Real-time sequencing, machine allocation, and execution status in one operational view.
            </p>
          </div>

          <div className="production-header-right-rail" aria-label="Schedule controls">
            <div className="production-header-datetime-inline" aria-label="Current date and time">
              <span className="production-header-datetime-pill" aria-label="Current date">
                <span className="production-header-meta-label">Date</span>
                <span className="production-header-meta-value production-header-meta-inline">{formattedDate}</span>
              </span>
              <span className="production-header-datetime-pill" aria-label="Current time">
                <span className="production-header-meta-label">Time</span>
                <span className="production-header-meta-value production-header-meta-time production-header-meta-inline">{formattedTime}</span>
              </span>
            </div>

            <div className="production-header-rail-divider" aria-hidden="true" />

            <div className="production-header-features-line" aria-label="Header features row">
              <span className="production-header-feature-item-follow" aria-label="Follow mode control">
                <span className="production-header-meta-label">Auto-center timeline</span>
                <span className="production-header-follow-row">
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={isFollowMode}
                      onChange={(e) => setIsFollowMode(e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                  <span className={`production-header-meta-value production-header-follow-state ${isFollowMode ? "is-on" : "is-off"}`}>
                    {isFollowMode ? "Enabled" : "Manual"}
                  </span>
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default productionPlanHeader;