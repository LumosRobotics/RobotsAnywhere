import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(request) {
  try {
    // Initialize Stripe only when the route is called
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.' },
        { status: 503 }
      );
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const body = await request.json();
    const { amount, currency = 'usd', metadata = {} } = body;

    // Validate amount
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        orderId: metadata.orderId || '',
        userId: metadata.userId || '',
        ...metadata,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });

  } catch (error) {
    console.error('Payment intent creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent', message: error.message },
      { status: 500 }
    );
  }
}
