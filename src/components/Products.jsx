'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProductList from './ProductList';
import ProductDetail from './ProductDetail';

const Products = () => {
  const { category, productId } = useParams();
  const router = useRouter();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(false);

  const categories = [
    { id: 'sensors', name: 'Sensors', description: 'Accelerometer, gyroscope, proximity, and ambient light sensors' },
    { id: 'cleaning', name: 'Cleaning Robots', description: 'Automated cleaning and maintenance' },
    { id: 'development-boards', name: 'Development Boards', description: 'Microcontrollers and development kits' }
  ];

  // Load product if productId is in URL
  useEffect(() => {
    if (category && productId) {
      setLoading(true);
      fetch(`/products/data/${category}.json`)
        .then(res => res.json())
        .then(data => {
          const product = data.products.find(p => p.id === productId);
          if (product) {
            product.categoryId = category;
            product.categoryName = data.categoryName;
            setSelectedProduct(product);
          }
          setLoading(false);
        })
        .catch(error => {
          console.error('Error loading product:', error);
          setLoading(false);
        });
    } else {
      setSelectedProduct(null);
    }
  }, [category, productId]);

  const handleCategorySelect = (categoryId) => {
    router.push(`/products/${categoryId}`);
  };

  const handleProductSelect = (product) => {
    router.push(`/products/${product.categoryId || category}/${product.id}`);
  };

  const handleBackToProducts = () => {
    router.push(`/products/${category}`);
  };

  const handleBackToCategories = () => {
    router.push('/products');
  };


  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (selectedProduct) {
    return (
      <ProductDetail
        product={selectedProduct}
        onBack={handleBackToProducts}
      />
    );
  }

  if (category) {
    return (
      <div className="products-container">
        <ProductList
          category={category}
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