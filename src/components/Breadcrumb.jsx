'use client';

import React from 'react';

const Breadcrumb = ({ currentPage, selectedCategory, selectedProduct, searchQuery, onNavigate }) => {
  const getCategoryName = (categoryId) => {
    const categories = {
      sensors: 'Sensors',
      actuators: 'Actuators',
      connectivity: 'Connectivity',
      location: 'Location',
      camera: 'Camera',
      industrial: 'Industrial Robots',
      service: 'Service Robots',
      cleaning: 'Cleaning Robots'
    };
    return categories[categoryId] || categoryId;
  };

  const renderBreadcrumbs = () => {
    const breadcrumbs = [];

    // Always start with Home
    breadcrumbs.push({
      label: 'Home',
      onClick: () => onNavigate('home'),
      isActive: currentPage === 'home' && !selectedCategory && !selectedProduct
    });

    if (currentPage === 'products') {
      // Add Products
      breadcrumbs.push({
        label: 'Products',
        onClick: () => onNavigate('products'),
        isActive: !selectedCategory && !selectedProduct
      });

      if (selectedCategory) {
        // Add Category
        breadcrumbs.push({
          label: getCategoryName(selectedCategory),
          onClick: () => onNavigate('category', selectedCategory),
          isActive: !selectedProduct
        });

        if (selectedProduct) {
          // Add Product
          breadcrumbs.push({
            label: selectedProduct.name,
            onClick: null, // Current page, no navigation
            isActive: true
          });
        }
      }
    } else if (currentPage === 'account') {
      breadcrumbs.push({
        label: 'Account',
        onClick: null,
        isActive: true
      });
    } else if (currentPage === 'search') {
      breadcrumbs.push({
        label: `Search: "${searchQuery}"`,
        onClick: null,
        isActive: true
      });
    }

    return breadcrumbs;
  };

  const breadcrumbs = renderBreadcrumbs();

  // Don't show breadcrumb if we're just on home
  if (breadcrumbs.length <= 1 && currentPage === 'home') {
    return null;
  }

  return (
    <div className="breadcrumb">
      {breadcrumbs.map((crumb, index) => (
        <React.Fragment key={index}>
          <span 
            className={`breadcrumb-item ${crumb.isActive ? 'active' : ''} ${crumb.onClick ? 'clickable' : ''}`}
            onClick={crumb.onClick}
          >
            {crumb.label}
          </span>
          {index < breadcrumbs.length - 1 && (
            <span className="breadcrumb-separator"> / </span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default Breadcrumb;