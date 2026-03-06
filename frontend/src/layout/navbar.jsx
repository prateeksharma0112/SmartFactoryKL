import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav>
      <div className="logo">SmartFactory KL</div>
      <div className="links">
        <Link to="/">Home</Link>
        <Link to="/production-plan">Production Plan</Link>
      </div>
    </nav>
  );
};

export default Navbar;
