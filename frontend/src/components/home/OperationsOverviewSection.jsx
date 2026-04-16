import Card from "./Card";

const OperationsOverviewSection = ({ operations }) => {
  return (
    <section className="section section-full">
      <h2 className="section-heading">Operations Overview</h2>
      <div className="cards-row">
        <Card
          title="Total Operations"
          value={operations.total}
          description="Operations across all machines"
          icon=""
        />
        <Card
          title="Running"
          value={operations.running}
          description="Operations currently in execution"
          icon=""
        />
        <Card
          title="Finished"
          value={operations.finished}
          description="Operations completed"
          icon=""
        />
        <Card
          title="Frozen"
          value={operations.frozen}
          description="Operations marked as frozen"
          icon=""
        />
      </div>
    </section>
  );
};

export default OperationsOverviewSection;
