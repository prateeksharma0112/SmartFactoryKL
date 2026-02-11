import Card from "./Card";

const FactoryInfoSection = ({ factory }) => {
  return (
    <section className="section">
      <h2 className="section-heading">Factory Info</h2>
      <div className="cards-row">
        <Card title="Name" value={factory.name} icon="" />
        <Card title="Country" value={factory.country} icon="" />
        <Card title="Unique ID" value={factory.uniqueId} icon="" />
        <Card title="Islands Count" value={factory.islandsCount} icon="" />
      </div>
    </section>
  );
};

export default FactoryInfoSection;
