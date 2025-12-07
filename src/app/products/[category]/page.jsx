'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ProductList from '@/components/ProductList';

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const category = params.category;

  const getCategoryName = (categoryId) => {
    const categories = {
      'sensors': 'Sensors',
      'cleaning': 'Cleaning Robots',
      'development-boards': 'Development Boards'
    };
    return categories[categoryId] || categoryId;
  };

  const handleProductSelect = (product) => {
    router.push(`/products/${category}/${product.id}`);
  };

  return (
    <div className="category-page">
      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link href="/">Home</Link>
          <span className="separator"> / </span>
          <Link href="/products">Products</Link>
          <span className="separator"> / </span>
          <span className="active">{getCategoryName(category)}</span>
        </div>

        <h1>{getCategoryName(category)}</h1>

        <ProductList
          category={category}
          onProductSelect={handleProductSelect}
        />
      </div>
    </div>
  );
}
