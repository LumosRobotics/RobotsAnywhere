import React, { useState } from 'react';
import ProductList from './ProductList';
import ProductDetail from './ProductDetail';

const Products = ({ selectedCategory, selectedProduct, onCategorySelect, onProductSelect }) => {
  const getCurrentView = () => {
    if (selectedProduct) return 'detail';
    if (selectedCategory) return 'products';
    return 'categories';
  };

  const currentView = getCurrentView();

  const categories = [
    { id: 'sensors', name: 'Sensors', description: 'Accelerometer, gyroscope, proximity, and ambient light sensors' },
    { id: 'actuators', name: 'Actuators', description: 'Servo motors, vibrators, flashlights, and buzzers' },
    { id: 'connectivity', name: 'Connectivity', description: 'WiFi, Bluetooth, and NFC communication modules' },
    { id: 'location', name: 'Location', description: 'GPS receivers and geofencing systems' },
    { id: 'camera', name: 'Camera', description: 'Vision systems, image capture, and video recording' },
    { id: 'industrial', name: 'Industrial Robots', description: 'High-precision manufacturing and automation' },
    { id: 'service', name: 'Service Robots', description: 'Customer service and hospitality solutions' },
    { id: 'cleaning', name: 'Cleaning Robots', description: 'Automated cleaning and maintenance' }
  ];

  const handleCategorySelect = (categoryId) => {
    onCategorySelect(categoryId);
  };

  const handleProductSelect = (product) => {
    onProductSelect(product);
  };

  const handleBackToProducts = () => {
    onProductSelect(null);
  };

  const handleBackToCategories = () => {
    onCategorySelect(null);
  };


  if (currentView === 'detail') {
    return (
      <ProductDetail
        product={selectedProduct}
        onBack={handleBackToProducts}
      />
    );
  }

  if (currentView === 'products') {
    return (
      <div className="products-container">
        <button className="back-button" onClick={handleBackToCategories}>
          ← Back to Categories
        </button>
        <ProductList
          category={selectedCategory}
          onProductSelect={handleProductSelect}
        />
      </div>
    );
  }

  return (
    <div className="categories-container">
      <div className="categories-header">
        <h2>Robot Categories</h2>
        <p>Explore our comprehensive range of robotic solutions</p>
      </div>
      
      <div className="categories-grid">
        {categories.map(category => (
          <div
            key={category.id}
            className="category-card"
            onClick={() => handleCategorySelect(category.id)}
          >
            <div className="category-icon">🤖</div>
            <h3>{category.name}</h3>
            <p>{category.description}</p>
            <button className="view-products-btn">
              View Products
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;