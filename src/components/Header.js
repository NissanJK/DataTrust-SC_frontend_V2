import React, { useState } from "react";
import API from "../api/api";

export default function Header() {
  const [resetting, setResetting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleReset = async () => {
    setResetting(true);

    try {
      // Call backend reset endpoint
      await API.post("/system/reset");

      // Success - reload the page to refresh everything
      window.location.reload();
    } catch (error) {
      console.error("Reset failed:", error);
      alert("Reset failed. Please try again.");
      setResetting(false);
      setShowConfirm(false);
    }
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo-position">
          <img src="./android-chrome-512x512.png" className="logo" alt="" />
          <div className="header-text">
            <h1>DataTrust-SC</h1>
            <p>A Trusted and Privacy-Preserving Data Distribution Framework for Smart Cities</p>
          </div>
        </div>

        <div className="header-actions">
          {!showConfirm ? (
            <button
              className="reset-btn"
              onClick={() => setShowConfirm(true)}
              disabled={resetting}
            >
              🔄 Reset System
            </button>
          ) : (
            <div className="confirm-reset">
              <span className="confirm-text">⚠️ Delete all data?</span>
              <button
                className="confirm-yes"
                onClick={handleReset}
                disabled={resetting}
              >
                {resetting ? "Resetting..." : "Yes, Reset"}
              </button>
              <button
                className="confirm-no"
                onClick={() => setShowConfirm(false)}
                disabled={resetting}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
