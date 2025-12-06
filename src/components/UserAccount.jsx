import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

const UserAccount = ({ onBack }) => {
  const { view = 'profile' } = useParams();
  const navigate = useNavigate();
  const { user, updateProfile } = useUser();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: {
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      zipCode: user?.address?.zipCode || '',
      country: user?.address?.country || 'USA'
    }
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSave = () => {
    updateProfile(formData);
    setEditMode(false);
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: {
        street: user?.address?.street || '',
        city: user?.address?.city || '',
        state: user?.address?.state || '',
        zipCode: user?.address?.zipCode || '',
        country: user?.address?.country || 'USA'
      }
    });
    setEditMode(false);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderProfile = () => (
    <div className="account-section">
      <div className="account-section-header">
        <h3>Personal Information</h3>
        {!editMode ? (
          <button className="edit-btn" onClick={() => setEditMode(true)}>
            ✏️ Edit
          </button>
        ) : (
          <div className="edit-actions">
            <button className="save-btn" onClick={handleSave}>Save</button>
            <button className="cancel-btn" onClick={handleCancel}>Cancel</button>
          </div>
        )}
      </div>
      
      <div className="profile-form">
        <div className="form-row">
          <div className="form-group">
            <label>First Name</label>
            {editMode ? (
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
              />
            ) : (
              <p>{user?.firstName}</p>
            )}
          </div>
          <div className="form-group">
            <label>Last Name</label>
            {editMode ? (
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
              />
            ) : (
              <p>{user?.lastName}</p>
            )}
          </div>
        </div>

        <div className="form-group">
          <label>Email Address</label>
          {editMode ? (
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
            />
          ) : (
            <p>{user?.email}</p>
          )}
        </div>

        <div className="form-group">
          <label>Phone Number</label>
          {editMode ? (
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
            />
          ) : (
            <p>{user?.phone || 'Not provided'}</p>
          )}
        </div>

        <h4>Address</h4>
        <div className="form-group">
          <label>Street Address</label>
          {editMode ? (
            <input
              type="text"
              name="address.street"
              value={formData.address.street}
              onChange={handleInputChange}
            />
          ) : (
            <p>{user?.address?.street || 'Not provided'}</p>
          )}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>City</label>
            {editMode ? (
              <input
                type="text"
                name="address.city"
                value={formData.address.city}
                onChange={handleInputChange}
              />
            ) : (
              <p>{user?.address?.city || 'Not provided'}</p>
            )}
          </div>
          <div className="form-group">
            <label>State</label>
            {editMode ? (
              <input
                type="text"
                name="address.state"
                value={formData.address.state}
                onChange={handleInputChange}
              />
            ) : (
              <p>{user?.address?.state || 'Not provided'}</p>
            )}
          </div>
          <div className="form-group">
            <label>ZIP Code</label>
            {editMode ? (
              <input
                type="text"
                name="address.zipCode"
                value={formData.address.zipCode}
                onChange={handleInputChange}
              />
            ) : (
              <p>{user?.address?.zipCode || 'Not provided'}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="account-section">
      <h3>Order History</h3>
      {user?.orders && user.orders.length > 0 ? (
        <div className="orders-list">
          {user.orders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div>
                  <h4>Order #{order.id}</h4>
                  <p className="order-date">{formatDate(order.createdAt)}</p>
                </div>
                <div className="order-status">
                  <span className={`status-badge status-${order.status}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                  <p className="order-total">{formatPrice(order.total)}</p>
                </div>
              </div>
              <div className="order-items">
                {order.items.map(item => (
                  <div key={item.product.id} className="order-item">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      onError={(e) => {
                        e.target.src = '/api/placeholder/50/50';
                      }}
                    />
                    <div className="order-item-details">
                      <p className="item-name">{item.product.name}</p>
                      <p className="item-quantity">Qty: {item.quantity}</p>
                    </div>
                    <p className="item-price">{formatPrice(item.product.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
              {/* Shipping & Tracking Information */}
              {order.shipping_method && (
                <div className="order-shipping-info">
                  <h4>Shipping Information</h4>
                  <div className="shipping-details">
                    <div className="shipping-detail-row">
                      <span className="detail-label">Method:</span>
                      <span className="detail-value">
                        {order.shipping_method.serviceName || order.shipping_method.name || 'Standard Shipping'}
                      </span>
                    </div>
                    {order.courier_name && (
                      <div className="shipping-detail-row">
                        <span className="detail-label">Courier:</span>
                        <span className="detail-value">{order.courier_name}</span>
                      </div>
                    )}
                    {order.tracking_number && (
                      <div className="shipping-detail-row">
                        <span className="detail-label">Tracking:</span>
                        <span className="detail-value tracking-number">
                          {order.tracking_url ? (
                            <a href={order.tracking_url} target="_blank" rel="noopener noreferrer">
                              {order.tracking_number}
                            </a>
                          ) : (
                            order.tracking_number
                          )}
                        </span>
                      </div>
                    )}
                    {order.estimated_delivery_date && (
                      <div className="shipping-detail-row">
                        <span className="detail-label">Estimated Delivery:</span>
                        <span className="detail-value">{formatDate(order.estimated_delivery_date)}</span>
                      </div>
                    )}
                    {order.shipment_status && order.shipment_status !== 'pending' && (
                      <div className="shipping-detail-row">
                        <span className="detail-label">Shipment Status:</span>
                        <span className={`detail-value shipment-status status-${order.shipment_status}`}>
                          {order.shipment_status.charAt(0).toUpperCase() + order.shipment_status.slice(1).replace('_', ' ')}
                        </span>
                      </div>
                    )}
                    {order.label_url && (
                      <div className="shipping-detail-row">
                        <a href={order.label_url} target="_blank" rel="noopener noreferrer" className="label-link">
                          View Shipping Label
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="no-orders">
          <p>You haven't placed any orders yet.</p>
          <button className="shop-now-btn" onClick={onBack}>
            Start Shopping
          </button>
        </div>
      )}
    </div>
  );

  const renderSettings = () => (
    <div className="account-section">
      <h3>Account Settings</h3>
      <div className="settings-grid">
        <div className="setting-item">
          <h4>Email Notifications</h4>
          <p>Receive updates about your orders and new products</p>
          <label className="toggle-switch">
            <input type="checkbox" defaultChecked />
            <span className="slider"></span>
          </label>
        </div>
        
        <div className="setting-item">
          <h4>SMS Notifications</h4>
          <p>Get text messages for order updates</p>
          <label className="toggle-switch">
            <input type="checkbox" />
            <span className="slider"></span>
          </label>
        </div>
        
        <div className="setting-item">
          <h4>Marketing Communications</h4>
          <p>Receive promotional offers and product recommendations</p>
          <label className="toggle-switch">
            <input type="checkbox" defaultChecked />
            <span className="slider"></span>
          </label>
        </div>
        
        <div className="setting-item">
          <h4>Account Security</h4>
          <p>Manage your password and security settings</p>
          <button className="secondary-btn">Change Password</button>
        </div>
        
        <div className="setting-item danger-zone">
          <h4>Delete Account</h4>
          <p>Permanently delete your account and all associated data</p>
          <button className="danger-btn">Delete Account</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="user-account-container">
      <div className="account-header">
        <button className="back-button" onClick={onBack}>
          ← Back
        </button>
        <h2>My Account</h2>
      </div>

      <div className="account-tabs">
        <button
          className={`tab-btn ${view === 'profile' ? 'active' : ''}`}
          onClick={() => navigate('/account/profile')}
        >
          👤 Profile
        </button>
        <button
          className={`tab-btn ${view === 'orders' ? 'active' : ''}`}
          onClick={() => navigate('/account/orders')}
        >
          📦 Orders
        </button>
        <button
          className={`tab-btn ${view === 'settings' ? 'active' : ''}`}
          onClick={() => navigate('/account/settings')}
        >
          ⚙️ Settings
        </button>
      </div>

      <div className="account-content">
        {view === 'profile' && renderProfile()}
        {view === 'orders' && renderOrders()}
        {view === 'settings' && renderSettings()}
      </div>
    </div>
  );
};

export default UserAccount;