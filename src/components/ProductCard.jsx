import React from 'react';
import { useCart } from '../contexts/CartContext';

const ProductCard = ({ product, onProductClick }) => {
  const { addToCart } = useCart();
  
  const handleClick = () => {
    if (onProductClick) {
      onProductClick(product);
    }
  };

  const handleAddToCart = (e) => {
    e.stopPropagation(); // Prevent card click
    addToCart(product, 1);
    alert(`Added ${product.name} to cart!`);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push('⭐');
    }
    if (hasHalfStar) {
      stars.push('⭐');
    }

    return stars.join('');
  };

  return (
    <div className="product-card" onClick={handleClick}>
      <div className="product-image">
        <img 
          src={product.images[0]} 
          alt={product.name}
          onError={(e) => {
            e.target.src = '/api/placeholder/300/200';
          }}
        />
        {!product.inStock && <div className="out-of-stock-badge">Out of Stock</div>}
      </div>
      
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-description">{product.shortDescription}</p>
        
        <div className="product-rating">
          <span className="stars">{renderStars(product.rating)}</span>
          <span className="rating-text">({product.reviews} reviews)</span>
        </div>
        
        <div className="product-price">
          <span className="price">{formatPrice(product.price)}</span>
          {product.inStock && (
            <span className="stock-info">{product.stockCount} in stock</span>
          )}
        </div>
        
        <div className="product-tags">
          {product.tags.slice(0, 3).map((tag, index) => (
            <span key={index} className="tag">{tag}</span>
          ))}
        </div>
        
        <button 
          className="add-to-cart-btn" 
          disabled={!product.inStock}
          onClick={handleAddToCart}
        >
          {product.inStock ? 'Add to Cart' : 'Unavailable'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;