'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ProductDetail from '@/components/ProductDetail';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { category, productId } = params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const getCategoryName = (categoryId) => {
    const categories = {
      'sensors': 'Sensors',
      'cleaning': 'Cleaning Robots',
      'development-boards': 'Development Boards'
    };
    return categories[categoryId] || categoryId;
  };

  useEffect(() => {
    if (category && productId) {
      setLoading(true);
      fetch(`/products/data/${category}.json`)
        .then(res => res.json())
        .then(data => {
          const foundProduct = data.products.find(p => p.id === productId);
          if (foundProduct) {
            foundProduct.categoryId = category;
            foundProduct.categoryName = data.categoryName;
            setProduct(foundProduct);
          }
          setLoading(false);
        })
        .catch(error => {
          console.error('Error loading product:', error);
          setLoading(false);
        });
    }
  }, [category, productId]);

  const handleBack = () => {
    router.push(`/products/${category}`);
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading product...</div>
      </div>
    );
  }

  return (
    <div className="product-detail-page">
      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link href="/">Home</Link>
          <span className="separator"> / </span>
          <Link href="/products">Products</Link>
          <span className="separator"> / </span>
          <Link href={`/products/${category}`}>{getCategoryName(category)}</Link>
          <span className="separator"> / </span>
          <span className="active">{product?.name || productId}</span>
        </div>

        <ProductDetail product={product} onBack={handleBack} />
      </div>
    </div>
  );
}
