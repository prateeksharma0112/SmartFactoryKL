const Card = ({ title, value, description, icon }) => {
  return (
    <div className="card">
      <h3>{icon ? `${icon} ${title}` : title}</h3>
      <p>{value}</p>
      {description && <small>{description}</small>}
    </div>
  );
};

export default Card;
