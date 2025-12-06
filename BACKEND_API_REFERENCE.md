# Backend API Reference for EasyShip Integration

This document provides example implementations for the backend API endpoints required to proxy EasyShip API requests. These endpoints are necessary to keep your EasyShip API token secure.

## Implementation Options

You can implement these endpoints using any backend technology:
- **Node.js/Express** (example below)
- **Serverless Functions** (Vercel, Netlify, AWS Lambda)
- **Supabase Edge Functions**
- **Python/Flask or FastAPI**
- **Any other backend framework**

## Environment Variables

Ensure your backend has these environment variables set:

```bash
EASYSHIP_API_TOKEN=your_easyship_api_token
EASYSHIP_API_BASE_URL=https://public-api.easyship.com/2024-09
SHIPPING_ORIGIN_COUNTRY=US
SHIPPING_ORIGIN_POSTAL_CODE=94102
SHIPPING_ORIGIN_CITY=San Francisco
SHIPPING_ORIGIN_STATE=CA
```

---

## Endpoint 1: Get Shipping Rates

### POST /api/shipping/rates

Get available shipping rates for a shipment.

**Request Body:**
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
      "hs_code": "9031.80.80",
      "origin_country_alpha2": "US",
      "quantity": 1,
      "description": "ProSense Accelerometer Kit",
      "sku": "sensors-001"
    }
  ]
}
```

**Example Implementation (Node.js/Express):**

```javascript
const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

router.post('/api/shipping/rates', async (req, res) => {
  try {
    const { destination, items } = req.body;

    // Validate required fields
    if (!destination || !items || items.length === 0) {
      return res.status(400).json({
        error: 'Missing required fields: destination and items'
      });
    }

    // Prepare EasyShip API request
    const easyshipRequest = {
      destination_country_alpha2: destination.country,
      destination_postal_code: destination.postal_code,
      destination_city: destination.city,
      destination_state: destination.state,
      origin_country_alpha2: process.env.SHIPPING_ORIGIN_COUNTRY || 'US',
      origin_postal_code: process.env.SHIPPING_ORIGIN_POSTAL_CODE,
      origin_city: process.env.SHIPPING_ORIGIN_CITY,
      origin_state: process.env.SHIPPING_ORIGIN_STATE,
      taxes_duties_paid_by: 'Sender',
      is_insured: false,
      apply_shipping_rules: true,
      items: items
    };

    // Call EasyShip API
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

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('EasyShip API error:', errorData);
      return res.status(response.status).json({
        error: errorData.message || 'Failed to fetch shipping rates',
        details: errorData
      });
    }

    const data = await response.json();

    // Return rates to frontend
    res.json({
      success: true,
      rates: data.rates || [],
      message: data.message
    });

  } catch (error) {
    console.error('Shipping rates error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

module.exports = router;
```

**Success Response (200):**
```json
{
  "success": true,
  "rates": [
    {
      "courier_id": "usps-priority",
      "courier_name": "USPS",
      "courier_display_name": "USPS Priority Mail",
      "min_delivery_time": 2,
      "max_delivery_time": 3,
      "total_charge": 9.99,
      "currency": "USD",
      "description": "2-3 business days",
      "is_insured": false,
      "tracking_available": true
    }
  ]
}
```

---

## Endpoint 2: Calculate Taxes and Duties

### POST /api/shipping/taxes-duties

Calculate customs taxes and duties for international shipments.

**Request Body:**
```json
{
  "destination_country": "GB",
  "origin_country": "US",
  "items": [
    {
      "declared_customs_value": 299.99,
      "declared_currency": "USD",
      "hs_code": "9031.80.80",
      "quantity": 1,
      "origin_country_alpha2": "US"
    }
  ],
  "shipping_charge": 25.00
}
```

**Example Implementation (Node.js/Express):**

```javascript
router.post('/api/shipping/taxes-duties', async (req, res) => {
  try {
    const { destination_country, origin_country, items, shipping_charge } = req.body;

    // Validate required fields
    if (!destination_country || !items || items.length === 0) {
      return res.status(400).json({
        error: 'Missing required fields'
      });
    }

    // Skip calculation for domestic shipments
    if (destination_country === origin_country) {
      return res.json({
        success: true,
        taxes: 0,
        duties: 0,
        total: 0,
        isDomestic: true
      });
    }

    // Prepare EasyShip API request
    const easyshipRequest = {
      destination_country_alpha2: destination_country,
      origin_country_alpha2: origin_country,
      items: items,
      shipping_charge: shipping_charge || 0,
      insurance_charge: 0
    };

    // Call EasyShip Taxes & Duties API
    const response = await fetch(
      `${process.env.EASYSHIP_API_BASE_URL}/taxes_and_duties`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.EASYSHIP_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(easyshipRequest)
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('EasyShip taxes/duties API error:', errorData);
      return res.status(response.status).json({
        error: errorData.message || 'Failed to calculate taxes and duties'
      });
    }

    const data = await response.json();

    res.json({
      success: true,
      taxes: data.import_tax_charge || 0,
      duties: data.import_duty_charge || 0,
      total: (data.import_tax_charge || 0) + (data.import_duty_charge || 0),
      breakdown: data
    });

  } catch (error) {
    console.error('Taxes/duties calculation error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});
```

**Success Response (200):**
```json
{
  "success": true,
  "taxes": 45.50,
  "duties": 23.75,
  "total": 69.25,
  "breakdown": {
    "import_tax_charge": 45.50,
    "import_duty_charge": 23.75,
    "ddp_handling_fee": 0
  }
}
```

---

## Endpoint 3: Create Shipment

### POST /api/shipping/shipment

Create a shipment after successful order payment.

**Request Body:**
```json
{
  "order_id": "550e8400-e29b-41d4-a716-446655440000",
  "courier_id": "usps-priority",
  "recipient": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "company_name": "",
    "address": {
      "line_1": "123 Main St",
      "line_2": "Apt 4B",
      "city": "New York",
      "state": "NY",
      "postal_code": "10001",
      "country_alpha2": "US"
    }
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
      "hs_code": "9031.80.80",
      "quantity": 1,
      "description": "ProSense Accelerometer Kit",
      "sku": "sensors-001"
    }
  ],
  "selected_rate": {
    "courier_id": "usps-priority",
    "total_charge": 9.99
  }
}
```

**Example Implementation (Node.js/Express):**

```javascript
router.post('/api/shipping/shipment', async (req, res) => {
  try {
    const { order_id, courier_id, recipient, items, selected_rate } = req.body;

    // Validate required fields
    if (!order_id || !courier_id || !recipient || !items) {
      return res.status(400).json({
        error: 'Missing required fields'
      });
    }

    // Prepare EasyShip shipment request
    const easyshipRequest = {
      platform_name: 'Robots Anywhere',
      platform_order_number: order_id,
      selected_courier_id: courier_id,
      destination: {
        name: recipient.name,
        email: recipient.email,
        phone: recipient.phone,
        company_name: recipient.company_name || '',
        line_1: recipient.address.line_1,
        line_2: recipient.address.line_2 || '',
        city: recipient.address.city,
        state: recipient.address.state,
        postal_code: recipient.address.postal_code,
        country_alpha2: recipient.address.country_alpha2
      },
      origin: {
        country_alpha2: process.env.SHIPPING_ORIGIN_COUNTRY,
        postal_code: process.env.SHIPPING_ORIGIN_POSTAL_CODE,
        city: process.env.SHIPPING_ORIGIN_CITY,
        state: process.env.SHIPPING_ORIGIN_STATE
      },
      items: items,
      set_as_residential: true,
      shipping_settings: {
        buy_label: true,
        buy_label_synchronous: true
      }
    };

    // Create shipment via EasyShip API
    const response = await fetch(
      `${process.env.EASYSHIP_API_BASE_URL}/shipments`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.EASYSHIP_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(easyshipRequest)
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('EasyShip shipment creation error:', errorData);
      return res.status(response.status).json({
        error: errorData.message || 'Failed to create shipment'
      });
    }

    const data = await response.json();
    const shipment = data.shipment || data;

    res.json({
      success: true,
      shipment_id: shipment.easyship_shipment_id,
      tracking_number: shipment.tracking_number,
      tracking_page_url: shipment.tracking_page_url,
      label_url: shipment.label_url,
      courier_name: shipment.courier?.name,
      estimated_delivery_date: shipment.delivery_date,
      status: shipment.shipment_state
    });

  } catch (error) {
    console.error('Shipment creation error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});
```

**Success Response (200):**
```json
{
  "success": true,
  "shipment_id": "ESUS123456789",
  "tracking_number": "9400111899223344556677",
  "tracking_page_url": "https://track.easyship.com/ESUS123456789",
  "label_url": "https://labels.easyship.com/label_123.pdf",
  "courier_name": "USPS",
  "estimated_delivery_date": "2025-11-03",
  "status": "created"
}
```

---

## Error Handling

All endpoints should return appropriate error responses:

**400 Bad Request:**
```json
{
  "error": "Missing required fields: destination and items"
}
```

**401 Unauthorized:**
```json
{
  "error": "Invalid or missing EasyShip API token"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal server error",
  "message": "Detailed error message"
}
```

---

## Security Considerations

1. **Never expose API token** in frontend code
2. **Validate all inputs** before forwarding to EasyShip
3. **Implement rate limiting** to prevent abuse
4. **Log errors** but don't expose sensitive details to frontend
5. **Use HTTPS** for all API communication
6. **Authenticate requests** from your frontend (e.g., verify user session)

---

## Testing

Use EasyShip's sandbox environment for testing:

```bash
EASYSHIP_API_BASE_URL=https://sandbox-api.easyship.com/2024-09
```

Get a sandbox API token from your EasyShip dashboard under Settings → Connect → API Integration (Sandbox).

---

## Complete Express.js Example

```javascript
// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import shipping routes
const shippingRoutes = require('./routes/shipping');
app.use(shippingRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'easyship-proxy' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`EasyShip proxy server running on port ${PORT}`);
});
```

---

## Serverless Function Example (Vercel)

Create files in `/api` directory:

```javascript
// api/shipping/rates.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Same logic as Express example above
  // ...
}
```

---

## Next Steps

1. Choose your backend implementation approach
2. Set up environment variables
3. Implement the three required endpoints
4. Test with EasyShip sandbox
5. Update frontend `.env.local` with your backend URL:
   ```
   VITE_EASYSHIP_API_URL=http://localhost:3001/api
   ```
