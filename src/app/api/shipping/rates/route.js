import { NextResponse } from 'next/server';

const EASYSHIP_API_URL = process.env.EASYSHIP_API_BASE_URL;
const EASYSHIP_API_TOKEN = process.env.EASYSHIP_API_TOKEN;

export async function POST(request) {
  try {
    const body = await request.json();
    const { items, destination } = body;

    // Validate input
    if (!items || !destination) {
      return NextResponse.json(
        { error: 'Missing required fields: items, destination' },
        { status: 400 }
      );
    }

    // Transform items to EasyShip format
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
    }));

    // Call EasyShip API
    const response = await fetch(`${EASYSHIP_API_URL}/rates`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${EASYSHIP_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        origin_country_alpha2: process.env.SHIPPING_ORIGIN_COUNTRY,
        origin_postal_code: process.env.SHIPPING_ORIGIN_POSTAL_CODE,
        origin_city: process.env.SHIPPING_ORIGIN_CITY,
        origin_state: process.env.SHIPPING_ORIGIN_STATE,
        destination_country_alpha2: destination.country,
        destination_postal_code: destination.postalCode,
        destination_city: destination.city,
        destination_state: destination.state,
        items: easyshipItems,
        insurance: {
          is_insured: false,
        },
        courier_selection: {
          allow_courier_fallback: true,
          apply_shipping_rules: true,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('EasyShip API error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch shipping rates', details: error },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Transform rates for frontend
    const rates = data.rates?.map(rate => ({
      id: rate.courier_id,
      serviceName: rate.full_description,
      courierName: rate.courier_name,
      deliveryTime: rate.min_delivery_time && rate.max_delivery_time
        ? `${rate.min_delivery_time}-${rate.max_delivery_time} days`
        : 'Varies',
      price: rate.shipment_charge_total,
      currency: rate.currency,
      trackingRating: rate.tracking_rating,
    })) || [];

    return NextResponse.json({ rates });

  } catch (error) {
    console.error('Shipping rates error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
