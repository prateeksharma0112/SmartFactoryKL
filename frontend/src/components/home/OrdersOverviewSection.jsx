import Card from "./Card";

const OrdersOverviewSection = ({ orders }) => {
  return (
    <section className="section">
      <h2 className="section-heading">Orders Overview</h2>
      <div className="cards-row">
        <Card title="Total Orders" value={orders.total} icon="" />
        <Card title="Planned" value={orders.planned} icon="" />
        <Card title="Running" value={orders.running} icon="" />
        <Card title="Finished" value={orders.finished} icon="" />
      </div>
    </section>
  );
};

export default OrdersOverviewSection;
