# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Robots Anywhere is a **Next.js 16** e-commerce web application for robotics products and components. The application uses the Next.js App Router, Supabase for authentication and data storage, Stripe for payments, and EasyShip for shipping integration. It follows a context-based state management pattern with Server and Client Components.

## Commands

### Development
- `npm run dev` - Start the Next.js development server with Turbopack
- `npm run build` - Build for production
- `npm start` - Start the production server
- `npm run lint` - Run ESLint to check code quality

### Environment Setup
Configure `.env.local` with the following variables:

**Public variables (accessible in browser):**
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key

**Server-only variables (secure, not sent to browser):**
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (for webhooks)
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret
- `EASYSHIP_API_TOKEN` - EasyShip API token
- `EASYSHIP_API_BASE_URL` - EasyShip API base URL

See `.env.example` for the complete list.

## Architecture Overview

### Application Structure
The app uses Next.js 16 App Router with file-based routing:

- **Root Layout** (`src/app/layout.jsx`): Wraps app with context providers
- **Context Providers**: Global state management (client-side)
  - `UserProvider` - Authentication and user profile management
  - `CartProvider` - Shopping cart functionality with localStorage persistence
  - `ShippingProvider` - Shipping rate management with EasyShip integration
- **API Routes** (`src/app/api/`): Server-side API endpoints for payments and shipping

### Routing Structure
- `/` - Home page
- `/products` - Product category listing
- `/products/[category]` - Dynamic category pages
- `/products/[category]/[productId]` - Dynamic product detail pages
- `/checkout` - Multi-step checkout process
- `/checkout/success` - Order confirmation
- `/account/[view]` - User account pages (profile, orders, settings)
- `/search` - Product search with query parameters

### State Management Pattern
The application uses React Context API with client-side state management:

- **UserContext** (`src/contexts/UserContext.jsx`): Handles authentication, user profiles, and order management with full Supabase integration
- **CartContext** (`src/contexts/CartContext.jsx`): Manages shopping cart state with localStorage persistence
- **ShippingContext** (`src/contexts/ShippingContext.jsx`): Manages shipping rates, taxes, and duties calculation

### Data Layer
- **Supabase Client** (`src/lib/supabase.js`): Configured client for authentication, database operations
- **Database Schema**: Uses three main tables - profiles, orders, and order_items with Row Level Security enabled
- **Product Data**: Static JSON files in `public/products/data/` organized by category (sensors, cleaning, development-boards)

### API Routes (Next.js Route Handlers)
The application includes server-side API routes that handle secure operations:

**Payment Routes:**
- `POST /api/payments/create-intent` - Creates Stripe payment intent
- `POST /api/payments/webhook` - Handles Stripe webhook events

**Shipping Routes:**
- `POST /api/shipping/rates` - Fetches shipping rates from EasyShip
- `POST /api/shipping/taxes-duties` - Calculates taxes and duties
- `POST /api/shipping/shipment` - Creates shipment in EasyShip

### Component Architecture
Components are organized by functionality with proper 'use client' directives:

- **Pages**: Implemented as Next.js App Router pages
- **UI Components** (`src/components/`): Header, Footer, Cart, AuthModal, ProductCard, ProductList, ProductDetail, Checkout
- **Client Components**: All interactive components marked with 'use client'
- **Authentication Flow**: Modal-based login/registration with profile management

### Key Features
- **Authentication**: Full Supabase Auth integration with user profiles
- **E-commerce Cart**: Persistent cart with quantity management and stock checking
- **Product Catalog**: Category-based product browsing with detailed product pages
- **Checkout Flow**: Multi-step checkout (Address → Shipping Method → Payment)
- **Payment Processing**: Stripe integration with server-side payment intent creation
- **Shipping Integration**: EasyShip integration for real-time rates and label generation
- **Order Management**: Complete order creation and tracking system
- **Responsive Design**: Mobile-friendly interface

### Database Setup
Run the SQL commands in `DATABASE_SETUP.sql` in your Supabase SQL Editor to set up the required tables and security policies.

For EasyShip integration, also run `DATABASE_EASYSHIP_UPDATE.sql` to add shipping-related columns.

### Product Data Structure
Products are stored as static JSON files in `public/products/data/` with the following categories:
- sensors.json, cleaning.json, development-boards.json

Each product should include: id, name, price, description, category, inStock, stock, specifications, features, and images array.

## Development Notes

### Next.js Specifics
- Uses App Router (not Pages Router)
- Server Components by default, Client Components marked with 'use client'
- Environment variables: `NEXT_PUBLIC_*` for client-side, no prefix for server-only
- Path aliasing: `@/*` maps to `./src/*` (configured in jsconfig.json)

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

### Shipping Implementation
The ShippingContext implements:
- Mock mode for development (when EASYSHIP_API_TOKEN not configured)
- Real-time shipping rate fetching from EasyShip
- Tax and duty calculation for international shipments
- Shipping method selection and pricing breakdown

### Checkout Flow
The checkout process consists of three steps:
1. **Shipping Address**: Collect and validate shipping information
2. **Shipping Method**: Display rates from EasyShip, allow selection
3. **Payment**: Stripe Elements for card entry, payment intent creation

### Navigation System
The app uses Next.js navigation:
- `useRouter()` hook from 'next/navigation'
- `router.push()` for programmatic navigation
- `Link` component from 'next/link' for declarative navigation
- Client-side transitions between pages

### Environment Variables
Ensure `.env.local` contains all required configuration. The app will throw errors if critical variables are missing. See `.env.example` for reference.

## Migration Notes

This project was migrated from Vite + React to Next.js. Key changes:
- Replaced Vite with Next.js build system
- Converted to App Router file-based routing
- Added API routes for backend functionality (eliminates need for separate backend)
- Updated environment variables from `VITE_*` to `NEXT_PUBLIC_*`
- Added 'use client' directives to all interactive components
- Migrated from React Router to Next.js navigation

For detailed migration steps, see `NEXTJS_MIGRATION_PLAN.md`.

## Testing

See `TESTING_GUIDE.md` for comprehensive testing procedures including:
- Authentication flow testing
- Product browsing and cart functionality
- Checkout process (all 3 steps)
- API route testing
- Performance benchmarks
- Cross-browser compatibility
