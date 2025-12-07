'use client';

import React, { useState } from 'react';
import { useCart } from '@/contexts/CartContext';

const ProductDetail = ({ product, onBack }) => {
  const { addToCart } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <div className="product-detail-container">
        <div className="error">Product not found</div>
      </div>
    );
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= product.stockCount) {
      setQuantity(newQuantity);
    }
  };

  const handlePreviousImage = () => {
    setSelectedImage((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setSelectedImage((prev) => (prev === product.images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="product-detail-container">

      <div className="product-detail">
        <div className="product-images">
          <div className="main-image">
            {product.images.length > 1 && (
              <>
                <button className="image-nav-arrow left" onClick={handlePreviousImage}>
                  ‹
                </button>
                <button className="image-nav-arrow right" onClick={handleNextImage}>
                  ›
                </button>
              </>
            )}
            <img
              src={product.images[selectedImage]}
              alt={product.name}
              onError={(e) => {
                e.target.src = '/api/placeholder/600/400';
              }}
            />
          </div>
          
          {product.images.length > 1 && (
            <div className="image-thumbnails">
              {product.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${product.name} view ${index + 1}`}
                  className={selectedImage === index ? 'active' : ''}
                  onClick={() => setSelectedImage(index)}
                  onError={(e) => {
                    e.target.src = '/api/placeholder/100/80';
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <div className="product-info">
          <div className="product-header">
            <h1>{product.name}</h1>
          </div>

          <div className="product-price">
            <span className="price">{formatPrice(product.price)}</span>
            <div className="stock-info">
              {product.inStock ? (
                <span className="in-stock">{product.stockCount} in stock</span>
              ) : (
                <span className="out-of-stock">Out of stock</span>
              )}
            </div>
          </div>

          <p className="product-description">{product.description}</p>

          <div className="product-features">
            <h3>Key Features</h3>
            <ul>
              {product.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </div>

          <div className="product-specifications">
            <h3>Specifications</h3>
            <div className="spec-grid">
              {Object.entries(product.specifications).map(([key, value]) => (
                <div key={key} className="spec-item">
                  <span className="spec-label">{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}</span>
                  <span className="spec-value">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="product-tags">
            {product.tags.map((tag, index) => (
              <span key={index} className="tag">{tag}</span>
            ))}
          </div>

          <div className="purchase-section">
            <div className="quantity-selector">
              <label>Quantity:</label>
              <div className="quantity-controls">
                <button 
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="quantity">{quantity}</span>
                <button 
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= product.stockCount}
                >
                  +
                </button>
              </div>
            </div>

            <button
              className="add-to-cart-btn large"
              onClick={handleAddToCart}
              disabled={!product.inStock}
            >
              {product.inStock ? `Add ${quantity} to Cart - ${formatPrice(product.price * quantity)}` : 'Out of Stock'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;