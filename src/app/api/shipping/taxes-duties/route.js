import { NextResponse } from 'next/server';

const EASYSHIP_API_URL = process.env.EASYSHIP_API_BASE_URL;
const EASYSHIP_API_TOKEN = process.env.EASYSHIP_API_TOKEN;

export async function POST(request) {
  try {
    const body = await request.json();
    const { items, destination, shippingCost } = body;

    // Only calculate for international shipments
    if (destination.country === process.env.SHIPPING_ORIGIN_COUNTRY) {
      return NextResponse.json({
        taxes: 0,
        duties: 0,
        total: 0,
      });
    }

    const easyshipItems = items.map(item => ({
      description: item.name,
      sku: item.id,
      actual_weight: item.weight || 0.1,
      height: item.dimensions?.height || 5,
      width: item.dimensions?.width || 5,
      length: item.dimensions?.length || 5,
      category: 'electronics',
      declared_currency: item.currency || 'USD',
      declared_customs_value: item.price * item.quantity,
      quantity: item.quantity,
      hs_code: item.hsCode || '9031.80.80',
      origin_country_alpha2: item.originCountry || process.env.SHIPPING_ORIGIN_COUNTRY,
    }));

    const response = await fetch(`${EASYSHIP_API_URL}/taxes_duties`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${EASYSHIP_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        destination_country_alpha2: destination.country,
        destination_postal_code: destination.postalCode,
        items: easyshipItems,
        shipping_cost: shippingCost,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('EasyShip taxes/duties error:', error);
      return NextResponse.json(
        { error: 'Failed to calculate taxes and duties', details: error },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      taxes: data.taxes || 0,
      duties: data.duties || 0,
      total: (data.taxes || 0) + (data.duties || 0),
    });

  } catch (error) {
    console.error('Taxes/duties calculation error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
