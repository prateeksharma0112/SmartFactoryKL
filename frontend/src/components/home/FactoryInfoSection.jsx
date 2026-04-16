import Card from "./Card";

const FactoryInfoSection = ({ factory }) => {
  return (
    <section className="section">
      <h2 className="section-heading">Factory Info</h2>
      <div className="cards-row">
        <Card title="Name" value={factory.name || "-"} description="Configured factory instance" icon="" />
        <Card title="Country" value={factory.country || "-"} description="Deployment region" icon="" />
        <Card title="Unique ID" value={factory.uniqueId || "-"} description="Reference for digital traceability" icon="" />
        <Card title="Islands Count" value={factory.islandsCount ?? 0} description="Available production islands" icon="" />
      </div>
    </section>
  );
};

export default FactoryInfoSection;
