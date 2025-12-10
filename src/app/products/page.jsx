'use client';

import React from 'react';
import Link from 'next/link';

export default function ProductsPage() {
  const categories = [
    {
      id: 'sensors',
      name: 'Sensors',
      description: 'High-precision sensors for robotics applications',
      icon: '📡'
    },
    {
      id: 'cleaning',
      name: 'Cleaning Robots',
      description: 'Automated cleaning solutions',
      icon: '🤖'
    },
    {
      id: 'development-boards',
      name: 'Development Boards',
      description: 'Microcontrollers and development kits',
      icon: '💻'
    },
  ];

  return (
    <div className="products-page">
      <div className="container">
        <h1>Product Categories</h1>
        <p className="page-description">
          Browse our selection of high-quality robotics components and solutions
        </p>

        <div className="categories-grid">
          {categories.map(category => (
            <Link
              key={category.id}
              href={`/products/${category.id}`}
              className="category-card"
            >
              <div className="category-icon">{category.icon}</div>
              <h3>{category.name}</h3>
              <p>{category.description}</p>
              <span className="view-products-btn">View Products →</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
