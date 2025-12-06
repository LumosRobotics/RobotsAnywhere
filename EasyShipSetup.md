What do I need to do on my EasyShip account?

⏺ Great question! Here's exactly what you need to do on your EasyShip account:

  Step-by-Step EasyShip Account Setup

  1. Create an Account

  1. Go to https://www.easyship.com
  2. Click "Sign Up" or "Get Started"
  3. Complete the registration form
  4. Verify your email address

  2. Complete Your Account Profile

  Once logged in, you'll need to set up:

  Company Information:
  - Business name
  - Business type (e-commerce, marketplace, etc.)
  - Business address (this becomes your default shipping origin)
  - Contact information

  Shipping Preferences:
  - Countries you ship from (e.g., United States)
  - Countries you ship to
  - Average monthly shipment volume
  - Product categories you sell

  3. Connect Your Warehouse/Origin Address

  1. Go to Settings → Warehouses
  2. Add your primary shipping location:
    - Warehouse name
    - Full address (street, city, state, ZIP)
    - Contact person
    - Phone number

  This address will be used as the origin for all shipping rate calculations.

  4. Get Your API Credentials

  For Testing (Sandbox):
  1. Go to Settings → Connect → Integrations
  2. Click + New Integration
  3. Select API Integration
  4. Choose Sandbox environment
  5. Click Create
  6. Copy the API Token (starts with sandbox_...)
  7. Save this token securely - you'll need it for your backend

  For Production (Later):
  - Repeat the same steps but select Production environment
  - You'll get a different token for live orders

  5. Set Up Payment Method (Optional for Sandbox)

  For sandbox testing, you don't need to add payment details. But for production:

  1. Go to Settings → Billing
  2. Add a credit card or payment method
  3. EasyShip will charge you for shipping labels when you create shipments

  6. Configure Shipping Rules (Optional but Recommended)

  1. Go to Settings → Shipping Rules
  2. Set up rules like:
    - Free shipping over certain amount
    - Exclude certain carriers
    - Preferred carriers by destination
    - Maximum dimensions/weight

  7. Review Courier Connections

  1. Go to Settings → Couriers
  2. EasyShip provides access to 550+ couriers by default
  3. Optionally connect your own carrier accounts for better rates:
    - USPS
    - FedEx
    - UPS
    - DHL
    - Regional carriers

  Note: You don't need your own carrier accounts to start - EasyShip's rates work out of the box.

  8. What You Need for Your Backend

  After setup, you'll have:
  - API Token: sandbox_xxxxxxxxxxxx (or production token later)
  - Origin Address: Your warehouse/shipping address
  - API Base URL:
    - Sandbox: https://sandbox-api.easyship.com/2024-09
    - Production: https://public-api.easyship.com/2024-09

  Add these to your backend .env file:
  EASYSHIP_API_TOKEN=sandbox_your_token_here
  EASYSHIP_API_BASE_URL=https://sandbox-api.easyship.com/2024-09
  SHIPPING_ORIGIN_COUNTRY=US
  SHIPPING_ORIGIN_POSTAL_CODE=94102
  SHIPPING_ORIGIN_CITY=San Francisco
  SHIPPING_ORIGIN_STATE=CA

  Quick Setup Checklist

  - Create EasyShip account
  - Complete company profile
  - Add warehouse/origin address
  - Create sandbox API integration
  - Copy API token
  - Save token to backend environment variables
  - Test with sandbox environment
  - (Later) Create production API integration
  - (Later) Add payment method for live shipments

  Testing in Sandbox Mode

  The sandbox environment lets you:
  - Get real shipping rates
  - Test the full integration flow
  - Create test shipments
  - Generate test labels
  - No charges applied - it's completely free for testing

  When to Switch to Production

  Switch to production when:
  1. You've tested thoroughly in sandbox
  2. All features work correctly
  3. You're ready to ship real orders
  4. You've added payment method to EasyShip
  5. You've updated backend with production API token

  Support

  If you need help:
  - EasyShip Help Center: https://support.easyship.com
  - API Documentation: https://developers.easyship.com
  - Live Chat: Available in your EasyShip dashboard
  - Email Support: support@easyship.com

  Cost Structure

  EasyShip pricing:
  - Free Plan: Available with basic features
  - Plus Plan: $29/month for advanced features
  - Premier/Enterprise: Custom pricing for high volume

  You pay separately for:
  - Actual shipping costs (charged per label)
  - EasyShip service fees (if any, depends on your plan)

  Pro Tip: Start with the free plan and sandbox environment to test everything before committing to a paid plan.

  That's it! Once you have your sandbox API token, add it to your backend and you're ready to test the integration. 🚀