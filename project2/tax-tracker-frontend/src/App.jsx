import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Sidebar } from "./components/Sidebar";
import { Clients } from "./pages/Clients";
import { TaxReturns } from "./pages/TaxReturns";
import { EmploymentSectors } from "./pages/EmploymentSectors";
import { Payments } from "./pages/Payments";
import Home from "./pages/Home";

export default function App() {
  return (
    <Router> 
      <div>
        <Sidebar />
        <div className = "main-content">
        <Routes>
          <Route path="/" element={< Home />} />
          <Route path="/clients" element={< Clients />} />
          <Route path="/tax-returns" element={< TaxReturns />} />
          <Route path="/employment-sectors" element={< EmploymentSectors />} />
          <Route path="/payments" element={< Payments />} />
        </Routes>
        </div>
      </div>
    </Router>
  );
}
