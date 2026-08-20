import React from "react";
import "../../styles/Toggle.css";
export function CategoryBar({ setCategory, currentCategory }) {
  return (
    <div className="category-container" id="menu-section">
      <div className="container-fluid px-4">
        <div className="category-simple-nav">
          <span className="category-label">Category:</span>
          <span
            className={`nav-item-text ${currentCategory === "food" ? "active" : ""}`}
            onClick={() => setCategory("food")}
          >
            Food
          </span>
          <span className="nav-separator">/</span>
          <span
            className={`nav-item-text ${currentCategory === "sweet" ? "active" : ""}`}
            onClick={() => setCategory("sweet")}
          >
            Sweets
          </span>
        </div>
      </div>
    </div>
  );
}
