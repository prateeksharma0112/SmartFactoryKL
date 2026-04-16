import { NavLink } from "react-router-dom";

const Navbar = () => {
  const getNavLinkClass = ({ isActive }) =>
    `nav-link${isActive ? " is-active" : ""}`;

  return (
    <nav className="top-nav" aria-label="Main navigation">
      <div className="nav-brand-block">
        <p className="nav-brand">SmartFactory KL</p>
        <p className="nav-subtitle">Live Operations Dashboard</p>
      </div>

      <div className="nav-links" role="list" aria-label="Primary routes">
        <NavLink to="/" end className={getNavLinkClass}>
          Home
        </NavLink>
        <NavLink to="/production-plan" className={getNavLinkClass}>
          Production Plan
        </NavLink>
      </div>

      <div className="nav-meta" aria-label="System context">
        <span className="nav-badge">Trade Fair Mode</span>
        <span className="nav-dot-separator" aria-hidden="true">•</span>
        <span className="nav-build">Demo Ready</span>
      </div>
    </nav>
  );
};

export default Navbar;
