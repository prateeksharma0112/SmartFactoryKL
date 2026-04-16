import Card from "./Card";

const OrdersOverviewSection = ({ orders }) => {
  return (
    <section className="section">
      <h2 className="section-heading">Orders Overview</h2>
      <div className="cards-row">
        <Card title="Total Orders" value={orders.total ?? 0} description="All tracked jobs in this production window" icon="" />
        <Card title="Planned" value={orders.planned ?? 0} description="Scheduled but not started" icon="" />
        <Card title="Running" value={orders.running ?? 0} description="Currently executing on machines" icon="" />
        <Card title="Finished" value={orders.finished ?? 0} description="Completed and closed jobs" icon="" />
      </div>
    </section>
  );
};

export default OrdersOverviewSection;
