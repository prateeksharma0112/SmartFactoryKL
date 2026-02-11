import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Navbar from "../layout/navbar.jsx";
import Home from "../pages/home/Home";
import ProductionPlan from "../pages/productionPlan/productionPlan";

const App = () => {
  return (
    <Router>
      <Navbar />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/production-plan" element={<ProductionPlan />} />
        </Routes>
      </div>
    </Router>
  );
};


export default App;
