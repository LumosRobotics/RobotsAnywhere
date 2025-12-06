# Stripe Payment Integration Setup

This guide will help you complete the Stripe payment integration for RobotsAnywhere.

## Current Status

✅ **Completed:**
- Stripe dependencies installed (`@stripe/stripe-js`, `@stripe/react-stripe-js`)
- Checkout component created with Stripe Elements
- Cart updated to navigate to checkout page
- Checkout success page implemented
- Environment variables configured in `.env.local`

⚠️ **Remaining:**
- Add your Stripe API keys
- Set up backend payment processing (required for production)

## Step 1: Get Your Stripe Keys

1. Sign up for a Stripe account at https://dashboard.stripe.com/register
2. Navigate to **Developers** > **API keys**
3. Copy your **Publishable key** (starts with `pk_test_`)
4. Copy your **Secret key** (starts with `sk_test_`) - keep this secure!

## Step 2: Update Environment Variables

Edit `.env.local` and replace the placeholder with your actual Stripe publishable key:

```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_ACTUAL_KEY_HERE
```

**Important:** Never commit your secret key to the repository. The publishable key is safe to use in the frontend.

## Step 3: Backend Payment Processing (Required for Production)

Currently, the checkout process simulates a successful payment. For production, you need to:

### Option 1: Supabase Edge Functions (Recommended)

Create a Supabase Edge Function to handle payment processing:

```typescript
// supabase/functions/create-payment-intent/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
});

serve(async (req) => {
  try {
    const { amount, currency = "usd" } = await req.json();

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return new Response(
      JSON.stringify({ clientSecret: paymentIntent.client_secret }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
```

Deploy the function:
```bash
supabase functions deploy create-payment-intent --no-verify-jwt
```

Set your Stripe secret key:
```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY
```

### Option 2: Netlify/Vercel Serverless Functions

Create a serverless function to create payment intents and handle Stripe webhooks.

### Option 3: Traditional Backend

Set up an Express/Node.js server with endpoints for:
- Creating payment intents
- Handling Stripe webhooks
- Processing refunds

## Step 4: Update the Checkout Component

Once you have a backend endpoint, update `src/components/Checkout.jsx`:

Replace the TODO section around line 90 with your actual payment processing:

```javascript
// Create payment intent on your backend
const response = await fetch('YOUR_BACKEND_URL/create-payment-intent', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${supabaseSession.access_token}`
  },
  body: JSON.stringify({
    amount: getCartTotal(),
    currency: 'usd'
  })
});

const { clientSecret } = await response.json();

// Confirm the payment with Stripe
const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
  clientSecret,
  {
    payment_method: paymentMethod.id
  }
);

if (confirmError) {
  setError(confirmError.message);
  setProcessing(false);
  return;
}

// Create order in your database
const order = addOrder({
  items: items.map(item => ({
    product: item.product,
    quantity: item.quantity
  })),
  total: getCartTotal(),
  status: 'paid',
  paymentIntentId: paymentIntent.id
});
```

## Step 5: Testing

Use Stripe's test card numbers:

**Successful payment:**
- Card: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

**Payment requires authentication:**
- Card: `4000 0025 0000 3155`

**Card declined:**
- Card: `4000 0000 0000 9995`

More test cards: https://stripe.com/docs/testing

## Step 6: Webhook Setup (Important for Production)

Set up Stripe webhooks to handle:
- `payment_intent.succeeded` - Confirm order
- `payment_intent.payment_failed` - Handle failed payments
- `charge.refunded` - Process refunds

1. Go to **Developers** > **Webhooks** in Stripe Dashboard
2. Add endpoint pointing to your backend
3. Select events to listen for
4. Copy webhook signing secret and add to environment variables

## Security Considerations

1. **Never expose your secret key** - only use it on the backend
2. **Always verify payments on the backend** - don't trust client-side data
3. **Use webhook signatures** to verify requests from Stripe
4. **Implement rate limiting** on your payment endpoints
5. **Store sensitive data securely** in Supabase with RLS policies

## Additional Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe React Integration](https://stripe.com/docs/stripe-js/react)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Stripe Testing](https://stripe.com/docs/testing)
- [PCI Compliance](https://stripe.com/docs/security/guide)

## Current Limitation

⚠️ **Important:** The current implementation creates orders locally without actual payment processing. This is suitable for development and testing the UI, but you **must** implement backend payment processing before going to production.

The checkout flow currently:
1. Collects payment information via Stripe Elements
2. Creates a payment method
3. Simulates a successful payment
4. Creates an order in the local UserContext

For production, replace this with actual Stripe payment intent confirmation and server-side order creation.
