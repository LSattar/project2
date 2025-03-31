import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Header } from "./components/Header.tsx";
import { Sidebar } from "./components/Sidebar.tsx";
import { Clients } from "./pages/Clients.tsx";
import { TaxReturns } from "./pages/TaxReturns.tsx";
import { EmploymentSectors } from "./pages/EmploymentSectors.tsx";
import { Payments } from "./pages/Payments.tsx";
import Home from "./pages/Home.tsx";

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
