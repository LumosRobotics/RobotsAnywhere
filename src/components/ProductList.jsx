import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';

const ProductList = ({ category, onProductSelect }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('name');
  const [filterBy, setFilterBy] = useState('all');

  useEffect(() => {
    loadProducts();
  }, [category]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/products/data/${category}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load ${category} products`);
      }
      const data = await response.json();
      setProducts(data.products);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const sortProducts = (products, sortBy) => {
    const sorted = [...products];
    switch (sortBy) {
      case 'price-low':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-high':
        return sorted.sort((a, b) => b.price - a.price);
      case 'rating':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'name':
      default:
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
    }
  };

  const filterProducts = (products, filterBy) => {
    switch (filterBy) {
      case 'in-stock':
        return products.filter(product => product.inStock);
      case 'out-of-stock':
        return products.filter(product => !product.inStock);
      case 'all':
      default:
        return products;
    }
  };

  const processedProducts = sortProducts(filterProducts(products, filterBy), sortBy);

  if (loading) {
    return (
      <div className="product-list-container">
        <div className="loading">Loading products...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-list-container">
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="product-list-container">
      <div className="product-list-header">
        <h2>{products.length > 0 ? products[0]?.name ? 
          `${category.charAt(0).toUpperCase() + category.slice(1)} Robots` : 
          'Products' : 'No Products Found'}
        </h2>
        <p>{processedProducts.length} products available</p>
      </div>

      <div className="product-controls">
        <div className="sort-control">
          <label htmlFor="sort">Sort by:</label>
          <select 
            id="sort" 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="name">Name</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Rating</option>
          </select>
        </div>

        <div className="filter-control">
          <label htmlFor="filter">Filter:</label>
          <select 
            id="filter" 
            value={filterBy} 
            onChange={(e) => setFilterBy(e.target.value)}
          >
            <option value="all">All Products</option>
            <option value="in-stock">In Stock</option>
            <option value="out-of-stock">Out of Stock</option>
          </select>
        </div>
      </div>

      <div className="products-grid">
        {processedProducts.map(product => (
          <ProductCard 
            key={product.id} 
            product={product} 
            onProductClick={onProductSelect}
          />
        ))}
      </div>

      {processedProducts.length === 0 && (
        <div className="no-products">
          <p>No products found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default ProductList;