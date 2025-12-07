'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Search through all product categories
    const categories = ['sensors', 'cleaning', 'development-boards'];
    const searchPromises = categories.map(category =>
      fetch(`/products/data/${category}.json`)
        .then(res => res.json())
        .catch(() => ({ products: [] }))
    );

    Promise.all(searchPromises)
      .then(dataArray => {
        const allProducts = [];
        dataArray.forEach((data, index) => {
          if (data.products) {
            data.products.forEach(product => {
              product.categoryId = categories[index];
              product.categoryName = data.categoryName;
              allProducts.push(product);
            });
          }
        });

        // Filter products based on search query
        const searchLower = query.toLowerCase();
        const filtered = allProducts.filter(product =>
          product.name.toLowerCase().includes(searchLower) ||
          product.description?.toLowerCase().includes(searchLower) ||
          product.shortDescription?.toLowerCase().includes(searchLower) ||
          product.tags?.some(tag => tag.toLowerCase().includes(searchLower))
        );

        setResults(filtered);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error searching products:', error);
        setLoading(false);
      });
  }, [query]);

  const handleProductClick = (product) => {
    router.push(`/products/${product.categoryId}/${product.id}`);
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Searching...</div>
      </div>
    );
  }

  return (
    <div className="search-page">
      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link href="/">Home</Link>
          <span className="separator"> / </span>
          <span className="active">Search Results</span>
        </div>

        <h1>Search Results for "{query}"</h1>

        {results.length === 0 ? (
          <div className="no-results">
            <p>No products found matching your search.</p>
            <Link href="/products" className="btn">
              Browse All Products
            </Link>
          </div>
        ) : (
          <>
            <p className="results-count">
              Found {results.length} {results.length === 1 ? 'product' : 'products'}
            </p>
            <div className="products-grid">
              {results.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onProductClick={handleProductClick}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <React.Suspense fallback={<div>Loading search...</div>}>
      <SearchContent />
    </React.Suspense>
  );
}
