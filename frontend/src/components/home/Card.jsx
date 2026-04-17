const Card = ({ title, value, description, icon, tone = "default" }) => {
  return (
    <div className={`card card-tone-${tone}`}>
      <h3 className="card-title">{icon ? `${icon} ${title}` : title}</h3>
      <p className="card-value">{value}</p>
      {description && <small className="card-description">{description}</small>}
    </div>
  );
};

export default Card;
