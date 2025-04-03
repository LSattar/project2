import React from "react";
import { Link } from "react-router-dom";
import '../css/home.css';

export default  function Home() {
    return (
      <div>
        <h1>Welcome to Tax Tracker!</h1>
        <div className = "center">
        <p>This platform helps you manage clients, track returns, and monitor payment history... all in one place!</p>
        <p><strong>What would you like to do today?</strong></p>
        </div>
        <hr></hr>

<div className = "home-container">
            <div className="home-column">
            <img className = "home-image" src="/images/person.png" alt="clients icon"></img>
                <p><Link to="/clients">Manage Clients</Link></p>
            </div>
            <div className="home-column">
                <img className = "home-image" src="/images/tax.png" alt="tax returns icon"></img>
        <p><Link to="/tax-returns">Check Returns</Link></p>
</div>
<div className="home-column">
<img className = "home-image" src="/images/money.png" alt="payments icon"></img>
        <p><Link to="/payments">View Payments</Link></p>
</div>
        </div>
        <ul>

        </ul>
      </div>
    );
  }