import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import "./LandingPage.css";

const LandingPage = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate("/login");
  };

  return (
    <div className="landing-container d-flex flex-column justify-content-center align-items-center text-center vh-100 bg-light px-3">
      <h1 className="fw-bold display-4 mb-3">Welcome to <span className="text-success">Trackify</span></h1>
      <p className="lead text-muted mb-4">
        Your smart companion for tracking daily expenses, managing income, and achieving financial goals.
      </p>

      <div className="mb-5">
        <ul className="text-start list-unstyled">
          <li className="mb-2">✅ Add and track your expenses & income</li>
          <li className="mb-2">📊 Visualize your spending with interactive charts</li>
          <li className="mb-2">🔒 Secure login and data storage with Firebase</li>
        </ul>
      </div>

      <Button variant="success" size="lg" className="px-5 py-2" onClick={handleStart}>
        Get Started
      </Button>
    </div>
  );
};

export default LandingPage;
