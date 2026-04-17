import Card from "./Card";

const OperationsOverviewSection = ({ operations }) => {
  return (
    <section className="section">
      <h2 className="section-heading">Operations Overview</h2>
      <div className="cards-row">
        <Card
          title="Total Operations"
          value={operations.total}
          description="Across all machines"
          tone="total"
          icon=""
        />
        <Card
          title="Running"
          value={operations.running}
          description="Now in progress"
          tone="running"
          icon=""
        />
        <Card
          title="Finished"
          value={operations.finished}
          description="Completed operations"
          tone="finished"
          icon=""
        />
        <Card
          title="Frozen"
          value={operations.frozen}
          description="Flagged as frozen"
          tone="frozen"
          icon=""
        />
      </div>
    </section>
  );
};

export default OperationsOverviewSection;
