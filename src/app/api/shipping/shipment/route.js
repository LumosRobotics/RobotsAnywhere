import { NextResponse } from 'next/server';

const EASYSHIP_API_URL = process.env.EASYSHIP_API_BASE_URL;
const EASYSHIP_API_TOKEN = process.env.EASYSHIP_API_TOKEN;

export async function POST(request) {
  try {
    const body = await request.json();
    const { orderId, items, destination, selectedRate } = body;

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

    const response = await fetch(`${EASYSHIP_API_URL}/shipments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${EASYSHIP_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        platform_name: 'RobotsAnywhere',
        platform_order_number: orderId,
        origin_country_alpha2: process.env.SHIPPING_ORIGIN_COUNTRY,
        origin_postal_code: process.env.SHIPPING_ORIGIN_POSTAL_CODE,
        origin_city: process.env.SHIPPING_ORIGIN_CITY,
        origin_state: process.env.SHIPPING_ORIGIN_STATE,
        destination_country_alpha2: destination.country,
        destination_postal_code: destination.postalCode,
        destination_city: destination.city,
        destination_state: destination.state,
        destination_name: destination.name,
        destination_address_line_1: destination.street,
        destination_email: destination.email,
        destination_phone_number: destination.phone,
        courier_id: selectedRate.id,
        items: easyshipItems,
        buyer_regulatory_identifiers: {
          eori: destination.eori || null,
          vat_no: destination.vat || null,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('EasyShip shipment creation error:', error);
      return NextResponse.json(
        { error: 'Failed to create shipment', details: error },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      shipmentId: data.shipment.easyship_shipment_id,
      trackingNumber: data.shipment.tracking_number,
      trackingUrl: data.shipment.tracking_page_url,
      labelUrl: data.shipment.label_url,
      courierName: data.shipment.courier.name,
      estimatedDeliveryDate: data.shipment.delivery_date,
    });

  } catch (error) {
    console.error('Shipment creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
