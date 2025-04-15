import { NavBar } from "./NavBar";
import React from 'react';
import '../css/header.css';

export const Header = () => {
    return (
      <header>
        <div className="header-content">
          <span className="logo">Tax Tracker</span>
          <span className="slogan"><em>Making your accounting less taxing</em></span>
        </div>
        <nav>
        <NavBar />
        </nav>

      </header>
    );
  }