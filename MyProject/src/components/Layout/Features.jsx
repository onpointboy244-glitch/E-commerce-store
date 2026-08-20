import React from "react";
import "../../styles/Features.css";

export function Features() {
  const features = [
    {
      icon: "bi-truck",
      title: "Fast Delivery",
      description: "Get your favorite food delivered in less than 30 minutes.",
    },
    {
      icon: "bi-award",
      title: "Best Quality",
      description: "We use only fresh and organic ingredients for our meals.",
    },
    {
      icon: "bi-shield-check",
      title: "Easy to Order",
      description: "A seamless and secure ordering process at your fingertips.",
    },
  ];

  return (
    <section className="features-section py-5">
      <div className="container">
        <div className="row g-4">
          {features.map((feature, index) => (
            <div className="col-md-4" key={index}>
              <div className="feature-card text-center p-4">
                <div className="feature-icon-wrapper mb-3">
                  <i className={`bi ${feature.icon}`}></i>
                </div>
                <h5 className="fw-bold mb-2">{feature.title}</h5>
                <p className="text-muted small mb-0">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
