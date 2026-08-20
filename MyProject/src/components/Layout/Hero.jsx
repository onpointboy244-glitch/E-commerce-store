import React from "react";
import "../../styles/Hero.css";

export function Hero() {
  const scrollToMenu = () => {
    const element = document.getElementById("menu-section");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="hero-section">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-6 hero-content text-start">
            <span className="badge-top">New Flavors are here! </span>
            <h1 className="hero-title">
              Delicious Food, <br />
              Delivered to <span className="text-brand">Your Door.</span>
            </h1>
            <p className="hero-description">
              Experience the taste of authentic recipes made with passion. Order
              now and enjoy the fastest delivery in the city.
            </p>
            <div className="hero-actions">
              <button
                className="btn btn-brand-main me-3"
                onClick={scrollToMenu}
              >
                Order Now
              </button>
              <button className="btn btn-outline-custom" onClick={scrollToMenu}>
                View Menu
              </button>
            </div>
          </div>
          <div className="col-lg-6 hero-image-container d-flex">
            <div className="hero-circle-bg"></div>
            <img
              src="/images/istockphoto-603267744-612x612.jpg"
              alt="Delicious food"
              className="hero-img-floating"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
