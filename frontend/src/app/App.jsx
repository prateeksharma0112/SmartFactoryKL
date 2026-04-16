import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import "./App.css";
import Navbar from "../layout/navbar.jsx";
import Home from "../pages/home/Home";
import ProductionPlan from "../pages/productionPlan/productionPlan";

const AppLayout = () => {
  const location = useLocation();
  const routeClass = location.pathname === "/" ? "route-home" : "route-default";

  return (
    <>
      <Navbar />
      <div className={`main-content ${routeClass}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/production-plan" element={<ProductionPlan />} />
        </Routes>
      </div>
    </>
  );
};

const App = () => {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
};


export default App;
