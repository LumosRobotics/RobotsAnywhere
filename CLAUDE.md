# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Robots Anywhere is a React-based e-commerce web application for robotics products and components. The application uses Vite as the build tool, Supabase for authentication and data storage, and follows a context-based state management pattern.

## Commands

### Development
- `npm run dev` - Start the development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint to check code quality

### Environment Setup
- Copy `.env.local` file with Supabase credentials:
  - `VITE_SUPABASE_URL` - Your Supabase project URL
  - `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

## Architecture Overview

### Application Structure
The app uses a single-page application architecture with client-side routing handled through state management:

- **Main App Component** (`src/App.jsx`): Central routing logic using state-based page navigation
- **Context Providers**: Wrap the entire app for global state management
  - `UserProvider` - Authentication and user profile management
  - `CartProvider` - Shopping cart functionality with localStorage persistence

### State Management Pattern
The application uses React Context API with useReducer for complex state management:

- **UserContext** (`src/contexts/UserContext.jsx`): Handles authentication, user profiles, and order management with full Supabase integration
- **CartContext** (`src/contexts/CartContext.jsx`): Manages shopping cart state with localStorage persistence and cart operations

### Data Layer
- **Supabase Client** (`src/lib/supabase.js`): Configured client for authentication, database operations, and real-time features
- **Database Schema**: Uses three main tables - profiles, orders, and order_items with Row Level Security enabled
- **Product Data**: Static JSON files in `public/products/data/` organized by category (actuators, sensors, camera, etc.)

### Component Architecture
Components are organized by functionality:
- **Pages**: Home, About, Contact, Products, UserAccount
- **UI Components**: Header, Footer, Cart, AuthModal, ProductCard, ProductList, ProductDetail
- **Authentication Flow**: Modal-based login/registration with profile management

### Key Features
- **Authentication**: Full Supabase Auth integration with user profiles
- **E-commerce Cart**: Persistent cart with quantity management and stock checking
- **Product Catalog**: Category-based product browsing with detailed product pages
- **Order Management**: Complete order creation and tracking system
- **Responsive Design**: Mobile-friendly interface

### Database Setup
Run the SQL commands in `DATABASE_SETUP.sql` in your Supabase SQL Editor to set up the required tables and security policies.

### Product Data Structure
Products are stored as static JSON files in `public/products/data/` with the following categories:
- actuators.json, camera.json, cleaning.json, connectivity.json, industrial.json, location.json, sensors.json, service.json

Each product should include: id, name, price, description, category, inStock, specifications, and image path.

## Development Notes

### Authentication Implementation
The UserContext provides a complete authentication system with:
- Login/logout with Supabase Auth
- User registration with profile creation
- Profile management with address information
- Order creation and tracking
- Session persistence and management

### Cart Implementation  
The CartContext implements:
- Add/remove items with quantity management
- localStorage persistence across sessions
- Stock validation before adding items
- Cart total calculations and item counts

### Navigation System
The app uses a custom navigation system in App.jsx that handles:
- Page-based routing through state management
- Smooth scrolling to sections within the home page
- Modal management for cart and authentication

### Environment Variables
Ensure `.env.local` contains the required Supabase configuration. The app will throw an error if these are missing.