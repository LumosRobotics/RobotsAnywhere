'use client';

import React from 'react';

const Home = ({ onButtonClick }) => {
  return (
    <section id="home" className="section">
      <h2>Home</h2>
      <p>Bringing robotic solutions to every corner of the world.</p>
      <button onClick={onButtonClick} className="button">
        Click Me!
      </button>
    </section>
  );
};

export default Home;