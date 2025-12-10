'use client';

import React from 'react';

export default function HomePage() {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section id="home" className="hero">
        <div className="hero-content">
          <h1>Welcome to Robots Anywhere</h1>
          <p>Your premier source for robotics components and solutions</p>
          <button
            className="cta-button"
            onClick={() => window.location.href = '/products'}
          >
            Browse Products
          </button>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about-section">
        <div className="container">
          <h2>About Us</h2>
          <p>
            Robots Anywhere specializes in innovative robotic solutions for businesses worldwide.
            We provide high-quality sensors, actuators, development boards, and complete robotic systems
            to help you build the next generation of automation and robotics projects.
          </p>
          <p>
            With years of experience in the robotics industry, we understand the unique challenges
            faced by engineers, hobbyists, and businesses. Our mission is to make advanced robotics
            technology accessible to everyone, anywhere in the world.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact-section">
        <div className="container">
          <h2>Contact Us</h2>
          <p>Have questions? We'd love to hear from you.</p>
          <div className="contact-info">
            <p><strong>Email:</strong> info@robotsanywhere.com</p>
            <p><strong>Phone:</strong> +1 (555) 123-4567</p>
            <p><strong>Address:</strong> 123 Robotics Way, San Francisco, CA 94102</p>
          </div>
        </div>
      </section>

    </div>
  );
}
