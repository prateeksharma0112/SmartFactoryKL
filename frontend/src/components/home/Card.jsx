const Card = ({ title, value, description, icon }) => {
  return (
    <div className="card">
      <h3 className="card-title">{icon ? `${icon} ${title}` : title}</h3>
      <p className="card-value">{value}</p>
      {description && <small className="card-description">{description}</small>}
    </div>
  );
};

export default Card;
