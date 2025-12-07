# Testing Guide - RobotsAnywhere Next.js Migration

This guide provides a comprehensive testing checklist to verify all functionality works correctly after the Next.js migration.

## Prerequisites

Before testing, ensure:
- [ ] `.env.local` is configured with all required environment variables
- [ ] Supabase database is set up with tables (profiles, orders, order_items)
- [ ] Development server is running: `npm run dev`

## Testing Checklist

### 1. Build & Compilation ✅

- [x] Project builds successfully without errors
- [x] All routes compile correctly (9 pages + 5 API routes)
- [x] No TypeScript/JavaScript errors
- [x] Environment variables load correctly

**Status:** PASSED - Build completes in ~3.4s with no errors

---

### 2. Authentication Flow

**Test User Registration:**
1. [ ] Navigate to home page
2. [ ] Click on Login/Register (trigger auth modal)
3. [ ] Switch to "Register" tab
4. [ ] Fill in registration form:
   - First Name
   - Last Name
   - Email
   - Phone
   - Password
   - Confirm Password
5. [ ] Submit registration
6. [ ] Verify email confirmation message appears
7. [ ] Check email for Supabase confirmation link
8. [ ] Click confirmation link
9. [ ] Verify can now log in

**Test User Login:**
1. [ ] Click Login/Register
2. [ ] Enter confirmed email and password
3. [ ] Submit login
4. [ ] Verify modal closes
5. [ ] Verify user name appears in header
6. [ ] Verify account dropdown shows Profile/Orders/Logout

**Test User Logout:**
1. [ ] Click account dropdown
2. [ ] Click "Logout"
3. [ ] Verify user is logged out
4. [ ] Verify header shows login button again

**Expected Results:**
- Registration creates user in Supabase auth
- Profile created in profiles table
- Email confirmation required before login
- Session persists across page refreshes
- Logout clears session

---

### 3. Product Browsing & Navigation

**Test Category Browsing:**
1. [ ] Navigate to `/products`
2. [ ] Verify 3 categories display:
   - Sensors
   - Cleaning Robots
   - Development Boards
3. [ ] Click "Sensors" category
4. [ ] Verify redirects to `/products/sensors`
5. [ ] Verify product list loads
6. [ ] Repeat for other categories

**Test Product Listing:**
1. [ ] On category page, verify products display
2. [ ] Check product cards show:
   - Product image
   - Name
   - Price
   - Description
   - Stock status
   - "Add to Cart" button
3. [ ] Test sort options:
   - [ ] Sort by name
   - [ ] Sort by price (low to high)
   - [ ] Sort by price (high to low)
4. [ ] Test filter options:
   - [ ] All products
   - [ ] In stock only
   - [ ] Out of stock

**Test Product Detail:**
1. [ ] Click on a product card
2. [ ] Verify redirects to `/products/[category]/[productId]`
3. [ ] Verify product detail shows:
   - [ ] Product images (carousel if multiple)
   - [ ] Product name and price
   - [ ] Full description
   - [ ] Specifications
   - [ ] Features list
   - [ ] Stock count
   - [ ] Quantity selector
   - [ ] Add to Cart button
4. [ ] Test quantity selector
5. [ ] Click "Add to Cart"
6. [ ] Verify success feedback

**Test Breadcrumb Navigation:**
1. [ ] Verify breadcrumbs show on all product pages
2. [ ] Click each breadcrumb level
3. [ ] Verify correct navigation

**Expected Results:**
- All product data loads from JSON files
- Images display correctly
- Navigation works smoothly
- Sort and filter work correctly
- Product details are accurate

---

### 4. Shopping Cart Functionality

**Test Add to Cart:**
1. [ ] Add product from product card
2. [ ] Add product from product detail page
3. [ ] Add multiple quantities
4. [ ] Verify cart icon updates with item count
5. [ ] Click cart icon to open cart modal

**Test Cart Modal:**
1. [ ] Verify cart modal displays all items
2. [ ] Verify each item shows:
   - [ ] Product image
   - [ ] Name
   - [ ] Price
   - [ ] Quantity controls (+/-)
   - [ ] Remove button
   - [ ] Line total
3. [ ] Test quantity increase/decrease
4. [ ] Test remove item
5. [ ] Test "Clear Cart" button
6. [ ] Verify subtotal calculates correctly
7. [ ] Close and reopen cart - verify persistence

**Test Cart Persistence:**
1. [ ] Add items to cart
2. [ ] Refresh page
3. [ ] Verify cart items persist (localStorage)
4. [ ] Clear browser data
5. [ ] Verify cart is empty

**Expected Results:**
- Cart updates in real-time
- localStorage persists cart across sessions
- Calculations are accurate
- Stock limits are enforced

---

### 5. Search Functionality

**Test Search:**
1. [ ] Navigate to search page or use search in header
2. [ ] Enter search term (e.g., "sensor")
3. [ ] Press Enter or click Search
4. [ ] Verify redirects to `/search?q=sensor`
5. [ ] Verify matching products display
6. [ ] Verify "No results" shows for non-matching search
7. [ ] Test search across different categories

**Expected Results:**
- Search finds products by name, description, tags
- Results show from all categories
- Empty state displays when no results
- Product cards link to correct detail pages

---

### 6. Checkout Process

**Test Checkout Access:**
1. [ ] Add items to cart
2. [ ] Click "Checkout" in cart modal
3. [ ] If not logged in, verify redirect or auth prompt
4. [ ] If logged in, verify redirects to `/checkout`

**Test Step 1: Shipping Address**
1. [ ] Verify form pre-fills from user profile
2. [ ] Fill in/edit shipping address:
   - [ ] Name
   - [ ] Email
   - [ ] Street
   - [ ] City
   - [ ] State
   - [ ] ZIP Code
3. [ ] Click "Continue to Shipping"
4. [ ] Verify validation works

**Test Step 2: Shipping Method (Mock Mode)**
1. [ ] Verify shipping rates load
2. [ ] Verify 3 mock options display:
   - [ ] Standard Shipping
   - [ ] Express Shipping
   - [ ] Overnight Shipping
3. [ ] Select a shipping method
4. [ ] Verify price updates in order summary
5. [ ] Click "Continue to Payment"

**Test Step 3: Payment**
1. [ ] Verify Stripe Elements loads
2. [ ] Enter test card: `4242 4242 4242 4242`
3. [ ] Enter any future expiry (e.g., 12/25)
4. [ ] Enter any 3-digit CVC (e.g., 123)
5. [ ] Enter ZIP code
6. [ ] Fill billing address
7. [ ] Review order summary
8. [ ] Click "Place Order"
9. [ ] Verify payment processes (may fail without real Stripe keys)

**Test Order Summary:**
1. [ ] Verify order summary shows:
   - [ ] All cart items
   - [ ] Subtotal
   - [ ] Shipping cost
   - [ ] Taxes/duties (if applicable)
   - [ ] Total
2. [ ] Verify totals calculate correctly

**Expected Results:**
- Form validation works
- Mock shipping rates display
- Stripe Elements load correctly
- Order summary is accurate
- Progress indicator shows current step

---

### 7. Checkout Success

**Test Success Page:**
1. [ ] After successful checkout
2. [ ] Verify redirects to `/checkout/success`
3. [ ] Verify success message displays
4. [ ] Verify order ID shows
5. [ ] Verify cart is cleared
6. [ ] Click "View Order Details"
7. [ ] Verify redirects to `/account/orders`

**Expected Results:**
- Success page shows order confirmation
- Cart is emptied
- Order appears in user account

---

### 8. User Account

**Test Profile View:**
1. [ ] Navigate to `/account/profile`
2. [ ] Verify profile displays:
   - [ ] Name
   - [ ] Email
   - [ ] Phone
   - [ ] Address
3. [ ] Click "Edit Profile"
4. [ ] Modify information
5. [ ] Click "Save"
6. [ ] Verify updates persist

**Test Orders View:**
1. [ ] Navigate to `/account/orders`
2. [ ] Verify orders list displays
3. [ ] Verify each order shows:
   - [ ] Order number
   - [ ] Date
   - [ ] Total
   - [ ] Status
   - [ ] Items
4. [ ] Click order to expand details
5. [ ] Verify shipping information displays

**Test Settings View:**
1. [ ] Navigate to `/account/settings`
2. [ ] Verify settings options (if implemented)

**Test Protected Routes:**
1. [ ] Log out
2. [ ] Try to access `/account/profile`
3. [ ] Verify redirects to home or shows login prompt

**Expected Results:**
- Profile updates save to Supabase
- Orders load from database
- Protected routes require authentication
- Account navigation works smoothly

---

### 9. API Routes Testing

**Test Shipping Rates API:**
```bash
curl -X POST http://localhost:3000/api/shipping/rates \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{
      "id": "test-1",
      "name": "Test Product",
      "price": 99.99,
      "quantity": 1,
      "weight": 0.5
    }],
    "destination": {
      "country": "US",
      "postalCode": "10001",
      "city": "New York",
      "state": "NY"
    }
  }'
```

Expected: Returns shipping rates or error if EasyShip not configured

**Test Payment Intent API:**
```bash
curl -X POST http://localhost:3000/api/payments/create-intent \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100.00,
    "currency": "usd",
    "metadata": {"orderId": "test-123"}
  }'
```

Expected: Returns clientSecret or error if Stripe not configured

**API Route Checklist:**
- [ ] `/api/shipping/rates` - Returns 200 or proper error
- [ ] `/api/shipping/taxes-duties` - Returns 200 or proper error
- [ ] `/api/shipping/shipment` - Returns 200 or proper error
- [ ] `/api/payments/create-intent` - Returns 200 or proper error
- [ ] `/api/payments/webhook` - Handles POST requests

---

### 10. Responsive Design Testing

**Test on Different Screen Sizes:**
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

**Elements to Check:**
- [ ] Navigation menu (hamburger on mobile)
- [ ] Product grid (columns adjust)
- [ ] Cart modal (fits screen)
- [ ] Checkout form (stacks on mobile)
- [ ] Product detail (images stack)

**Expected Results:**
- Layout adapts to screen size
- All content accessible
- Touch targets are large enough
- No horizontal scrolling

---

### 11. Cross-Browser Testing

**Test in Browsers:**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

**Features to Verify:**
- [ ] Page rendering
- [ ] JavaScript functionality
- [ ] CSS styling
- [ ] Form submission
- [ ] Cart persistence
- [ ] Stripe Elements

**Expected Results:**
- Consistent behavior across browsers
- No console errors
- Features work as expected

---

### 12. Performance Testing

**Run Lighthouse Audit:**
```bash
npm run build
npm start
# In another terminal:
npx lighthouse http://localhost:3000 --view
```

**Target Metrics:**
- [ ] Performance: > 90
- [ ] Accessibility: > 95
- [ ] Best Practices: > 90
- [ ] SEO: > 90

**Check:**
- [ ] Page load time < 3s
- [ ] Time to Interactive < 5s
- [ ] No layout shifts
- [ ] Images optimized
- [ ] JavaScript bundles reasonable size

---

### 13. Error Handling

**Test Error Scenarios:**
- [ ] Enter invalid email in registration
- [ ] Submit empty forms
- [ ] Add out-of-stock product
- [ ] Submit checkout with invalid card
- [ ] Access non-existent product URL
- [ ] Network error during API call

**Expected Results:**
- User-friendly error messages
- Form validation prevents submission
- Loading states show during operations
- Graceful degradation when APIs fail

---

### 14. Data Persistence

**Test Supabase Integration:**
- [ ] User registration creates profile
- [ ] Login retrieves user data
- [ ] Profile updates save
- [ ] Orders save to database
- [ ] Order items save correctly

**Test localStorage:**
- [ ] Cart persists across sessions
- [ ] Cart clears after checkout
- [ ] Cart survives page refresh

**Expected Results:**
- All data saves correctly
- No data loss
- Consistent state management

---

## Known Limitations (Before Production)

⚠️ **Items that need configuration before production use:**

1. **EasyShip Integration:**
   - Currently in mock mode
   - Need to set `EASYSHIP_API_TOKEN` in `.env.local`
   - Need to disable mock mode in Checkout component
   - Run `DATABASE_EASYSHIP_UPDATE.sql` in Supabase

2. **Stripe Integration:**
   - Using test keys
   - Need production keys for live payments
   - Need to set up webhook endpoint
   - Need `STRIPE_WEBHOOK_SECRET`

3. **Supabase:**
   - Need `SUPABASE_SERVICE_ROLE_KEY` for webhooks
   - Verify RLS policies are configured

4. **Email:**
   - Supabase email confirmation required
   - Configure email templates in Supabase

---

## Quick Test Summary

**Critical Path Test (5 minutes):**
1. ✅ Build project: `npm run build`
2. ✅ Start dev server: `npm run dev`
3. ✅ Browse products: `/products/sensors`
4. ✅ Add to cart
5. ✅ View cart modal
6. ✅ Register user (with email confirmation)
7. ✅ Login
8. ✅ Checkout (step through all 3 steps)
9. ✅ View account orders

**If all these work, the migration is successful!** ✅

---

## Reporting Issues

If you find issues during testing:

1. Check browser console for errors
2. Check server logs in terminal
3. Verify environment variables are set
4. Check Supabase logs for database issues
5. Verify API keys are valid

## Next Steps After Testing

Once testing is complete:
1. Fix any issues found
2. Configure production environment variables
3. Deploy to Vercel/Netlify
4. Run database migrations
5. Set up Stripe webhook
6. Test in production environment
