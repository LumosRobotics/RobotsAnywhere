# EasyShip Integration Setup Guide

This guide explains how to set up EasyShip for shipping fulfillment, tax, and customs calculations in Robots Anywhere.

## Overview

EasyShip provides:
- Real-time shipping rate calculations from 550+ couriers
- Automatic tax and duty calculations for international orders
- Shipment creation and label generation
- Order tracking and fulfillment management

## Prerequisites

1. **EasyShip Account**: Sign up at [https://www.easyship.com](https://www.easyship.com)
2. **API Access**: Obtain API credentials from your EasyShip dashboard
3. **Backend Server**: You'll need a backend to proxy API requests (keep API keys secure)

## Environment Variables

### Frontend (.env.local)

```bash
# EasyShip Configuration
VITE_EASYSHIP_API_URL=http://localhost:3001/api  # Your backend API URL

# Existing variables
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key
```

### Backend (.env)

```bash
# EasyShip API Credentials
EASYSHIP_API_TOKEN=your_easyship_api_token
EASYSHIP_API_BASE_URL=https://public-api.easyship.com/2024-09

# Use sandbox for testing
# EASYSHIP_API_BASE_URL=https://sandbox-api.easyship.com/2024-09

# Shipping Origin Configuration
SHIPPING_ORIGIN_COUNTRY=US
SHIPPING_ORIGIN_POSTAL_CODE=94102
SHIPPING_ORIGIN_CITY=San Francisco
SHIPPING_ORIGIN_STATE=CA
```

## Getting Your EasyShip API Token

1. Log in to your EasyShip dashboard
2. Navigate to **Settings** → **Connect** → **API Integration**
3. Click **+ New Integration**
4. Select **API Integration**
5. Choose **Sandbox** (for testing) or **Production**
6. Copy the API token and save it securely

**Important**: Never expose your API token in the frontend code or commit it to version control.

## Backend API Setup

You need to create a backend server to proxy EasyShip API requests. This keeps your API token secure.

### Required Backend Endpoints

#### 1. POST /api/shipping/rates
**Purpose**: Get shipping rate options

**Request Body**:
```json
{
  "destination": {
    "country": "US",
    "postal_code": "10001",
    "city": "New York",
    "state": "NY"
  },
  "items": [
    {
      "actual_weight": 1.2,
      "height": 10,
      "width": 15,
      "length": 20,
      "declared_currency": "USD",
      "declared_customs_value": 299.99,
      "category": "electronics",
      "hs_code": "8471.30.01"
    }
  ]
}
```

**Backend Implementation** (forwards to EasyShip):
```javascript
// Example using Express.js
app.post('/api/shipping/rates', async (req, res) => {
  try {
    const { destination, items } = req.body;

    const easyshipRequest = {
      destination_country_alpha2: destination.country,
      destination_postal_code: destination.postal_code,
      destination_city: destination.city,
      destination_state: destination.state,
      origin_country_alpha2: process.env.SHIPPING_ORIGIN_COUNTRY,
      origin_postal_code: process.env.SHIPPING_ORIGIN_POSTAL_CODE,
      origin_city: process.env.SHIPPING_ORIGIN_CITY,
      origin_state: process.env.SHIPPING_ORIGIN_STATE,
      taxes_duties_paid_by: 'Sender',
      is_insured: false,
      apply_shipping_rules: true,
      items: items
    };

    const response = await fetch(
      `${process.env.EASYSHIP_API_BASE_URL}/rates`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.EASYSHIP_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(easyshipRequest)
      }
    );

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('EasyShip rates error:', error);
    res.status(500).json({ error: 'Failed to fetch shipping rates' });
  }
});
```

#### 2. POST /api/shipping/taxes-duties
**Purpose**: Calculate taxes and customs duties

**Request Body**:
```json
{
  "destination_country": "GB",
  "origin_country": "US",
  "items": [
    {
      "declared_customs_value": 299.99,
      "declared_currency": "USD",
      "hs_code": "8471.30.01",
      "quantity": 1
    }
  ],
  "shipping_charge": 25.00
}
```

#### 3. POST /api/shipping/shipment
**Purpose**: Create shipment after successful order

**Request Body**:
```json
{
  "order_id": "uuid",
  "courier_id": "easyship_courier_id",
  "recipient": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "address": {
      "line1": "123 Main St",
      "city": "New York",
      "state": "NY",
      "postal_code": "10001",
      "country": "US"
    }
  },
  "items": [...],
  "selected_rate": {...}
}
```

## Backend Implementation Options

### Option 1: Express.js Server
Create a simple Express server with the endpoints above.

### Option 2: Serverless Functions
- **Vercel**: Create API routes in `/api` directory
- **Netlify**: Create functions in `/netlify/functions`
- **AWS Lambda**: Deploy Lambda functions with API Gateway

### Option 3: Supabase Edge Functions
Use Supabase Edge Functions to create the proxy endpoints.

## Product Data Requirements

All products must include shipping information in their JSON files:

```json
{
  "id": "product-001",
  "name": "Product Name",
  "price": 299.99,
  // ... other fields ...
  "weight": 1.2,
  "dimensions": {
    "length": 20,
    "width": 15,
    "height": 10,
    "unit": "cm"
  },
  "hsCode": "8471.30.01",
  "originCountry": "US"
}
```

### HS Code Reference
- HS codes are required for international shipping
- Find HS codes: [https://hts.usitc.gov/](https://hts.usitc.gov/)
- Common robotics HS codes:
  - `8471.30.01` - Computer components
  - `8537.10.90` - Electronic control boards
  - `8542.31.00` - Electronic integrated circuits
  - `8525.80.50` - Camera modules
  - `9031.80.00` - Sensors and measuring instruments

## Testing

1. **Start with Sandbox**: Use EasyShip sandbox environment for testing
2. **Test Scenarios**:
   - Domestic shipping (same country)
   - International shipping (different countries)
   - Various package weights and sizes
   - Different shipping speeds (standard, express)
3. **Verify**:
   - Rates are calculated correctly
   - Taxes/duties show for international orders
   - Shipments are created successfully
   - Tracking numbers are generated

## Going Live

1. Switch from sandbox to production API token
2. Update `EASYSHIP_API_BASE_URL` to production URL
3. Verify all integrations work with production API
4. Test end-to-end with real orders (small test orders first)
5. Monitor for any errors or issues

## Troubleshooting

### Common Issues

**"Unauthorized" Error**
- Check API token is correct
- Verify Authorization header format: `Bearer <token>`
- Ensure token has correct scopes (public.rate:read, etc.)

**No Rates Returned**
- Verify origin and destination addresses are complete
- Check product weights and dimensions are set
- Ensure origin postal code/country is valid

**Tax Calculation Errors**
- Verify HS codes are correct for all products
- Check declared customs values are accurate
- Ensure both origin and destination countries are set

## Support

- **EasyShip Documentation**: [https://developers.easyship.com](https://developers.easyship.com)
- **EasyShip Support**: Available in your EasyShip dashboard
- **API Status**: Check [https://status.easyship.com](https://status.easyship.com)

## Security Notes

1. **Never expose API tokens** in frontend code or version control
2. **Use environment variables** for all sensitive configuration
3. **Implement rate limiting** on your backend endpoints
4. **Validate all inputs** before forwarding to EasyShip API
5. **Log errors** but don't expose sensitive details to frontend
