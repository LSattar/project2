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

<div className = "container">
            <div className="home-column">
            <img className = "home-image" src="/images/person.png"></img>
                <p><Link to="/clients">Manage Clients</Link></p>
            </div>
            <div className="home-column">
                <img className = "home-image" src="/images/tax.png"></img>
        <p><Link to="/tax-returns">Check Returns</Link></p>
</div>
<div className="home-column">
<img className = "home-image" src="/images/money.png"></img>
        <p><Link to="/payments">View Payments</Link></p>
</div>
        </div>
        <ul>

        </ul>
      </div>
    );
  }