'use client';

import React, { useState } from 'react';
import { useUser } from '@/contexts/UserContext';

const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [mode, setMode] = useState(initialMode);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    confirmPassword: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, register, error, clearError, isLoading } = useUser();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (mode === 'register') {
        if (formData.password !== formData.confirmPassword) {
          alert('Passwords do not match');
          setIsSubmitting(false);
          return;
        }

        const result = await register({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          address: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: 'USA'
          }
        });

        if (result.success && result.requiresConfirmation) {
          setConfirmationMessage(result.message);
          setShowConfirmation(true);
          setFormData({
            email: '',
            password: '',
            firstName: '',
            lastName: '',
            phone: '',
            confirmPassword: ''
          });
        } else if (result.success) {
          handleClose();
        } else if (result.error) {
          console.error('Registration error:', result.error);
        }
      } else {
        const result = await login(formData.email, formData.password);
        if (result.success) {
          handleClose();
        } else if (result.error) {
          console.error('Login error:', result.error);
        }
      }
    } catch (err) {
      console.error('Unexpected error during authentication:', err);
    }

    setIsSubmitting(false);
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setShowConfirmation(false);
    setConfirmationMessage('');
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
      confirmPassword: ''
    });
    clearError();
  };

  const handleCloseConfirmation = () => {
    setShowConfirmation(false);
    setConfirmationMessage('');
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleClose = () => {
    // Reset all state when closing the modal
    setIsSubmitting(false);
    setShowConfirmation(false);
    setConfirmationMessage('');
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
      confirmPassword: ''
    });
    clearError();
    onClose();
  };

  if (!isOpen) return null;

  // Show confirmation message after successful registration
  if (showConfirmation) {
    return (
      <div className="auth-overlay" onClick={handleOverlayClick}>
        <div className="auth-modal">
          <div className="auth-header">
            <h2>Check Your Email</h2>
            <button className="close-auth-btn" onClick={handleCloseConfirmation}>×</button>
          </div>
          <div className="confirmation-content">
            <div className="confirmation-icon">📧</div>
            <p className="confirmation-message">{confirmationMessage}</p>
            <button 
              type="button" 
              className="auth-submit-btn" 
              onClick={handleCloseConfirmation}
            >
              Got it!
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-overlay" onClick={handleOverlayClick}>
      <div className="auth-modal">
        <div className="auth-header">
          <h2>{mode === 'login' ? 'Sign In' : 'Create Account'}</h2>
          <button className="close-auth-btn" onClick={handleClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'register' && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              disabled={isSubmitting}
            />
          </div>

          {mode === 'register' && (
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={isSubmitting}
                placeholder="+1 (555) 123-4567"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              disabled={isSubmitting}
            />
          </div>

          {mode === 'register' && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
              />
            </div>
          )}

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="auth-submit-btn"
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting || isLoading ? (
              mode === 'login' ? 'Signing In...' : 'Creating Account...'
            ) : (
              mode === 'login' ? 'Sign In' : 'Create Account'
            )}
          </button>

          <div className="auth-switch">
            <p>
              {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
              <button 
                type="button" 
                className="auth-switch-btn" 
                onClick={switchMode}
                disabled={isSubmitting}
              >
                {mode === 'login' ? 'Create Account' : 'Sign In'}
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;