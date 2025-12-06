-- EasyShip Integration Database Updates
-- Run these commands in your Supabase SQL Editor to add shipping/tracking fields

-- Add shipping and tracking columns to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS shipping_cost DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS taxes_duties DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS shipping_method JSONB,
ADD COLUMN IF NOT EXISTS shipment_id TEXT,
ADD COLUMN IF NOT EXISTS tracking_number TEXT,
ADD COLUMN IF NOT EXISTS tracking_url TEXT,
ADD COLUMN IF NOT EXISTS label_url TEXT,
ADD COLUMN IF NOT EXISTS courier_name TEXT,
ADD COLUMN IF NOT EXISTS estimated_delivery_date DATE,
ADD COLUMN IF NOT EXISTS shipment_status TEXT DEFAULT 'pending';

-- Add comment to explain the fields
COMMENT ON COLUMN orders.subtotal IS 'Order subtotal before shipping and taxes';
COMMENT ON COLUMN orders.shipping_cost IS 'Shipping cost from EasyShip';
COMMENT ON COLUMN orders.taxes_duties IS 'Combined taxes and duties for international orders';
COMMENT ON COLUMN orders.shipping_method IS 'Selected shipping method details (JSON)';
COMMENT ON COLUMN orders.shipment_id IS 'EasyShip shipment ID';
COMMENT ON COLUMN orders.tracking_number IS 'Carrier tracking number';
COMMENT ON COLUMN orders.tracking_url IS 'EasyShip tracking page URL';
COMMENT ON COLUMN orders.label_url IS 'Shipping label PDF URL';
COMMENT ON COLUMN orders.courier_name IS 'Courier service name (e.g., USPS, FedEx)';
COMMENT ON COLUMN orders.estimated_delivery_date IS 'Estimated delivery date';
COMMENT ON COLUMN orders.shipment_status IS 'Shipment status (pending, created, in_transit, delivered, etc.)';

-- Update existing orders to have subtotal equal to total if null
UPDATE orders
SET subtotal = total
WHERE subtotal IS NULL;

-- Create index on tracking number for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_tracking_number ON orders(tracking_number);
CREATE INDEX IF NOT EXISTS idx_orders_shipment_id ON orders(shipment_id);

-- Optional: Create a view for orders with shipping information
CREATE OR REPLACE VIEW orders_with_shipping AS
SELECT
  o.id,
  o.user_id,
  o.subtotal,
  o.shipping_cost,
  o.taxes_duties,
  o.total,
  o.status as order_status,
  o.shipment_status,
  o.shipping_method,
  o.shipping_address,
  o.shipment_id,
  o.tracking_number,
  o.tracking_url,
  o.label_url,
  o.courier_name,
  o.estimated_delivery_date,
  o.created_at,
  o.updated_at,
  (
    SELECT json_agg(
      json_build_object(
        'id', oi.id,
        'product_data', oi.product_data,
        'quantity', oi.quantity,
        'price', oi.price
      )
    )
    FROM order_items oi
    WHERE oi.order_id = o.id
  ) as items
FROM orders o;

-- Grant appropriate permissions to the view
GRANT SELECT ON orders_with_shipping TO authenticated;

-- Create RLS policy for the view
CREATE POLICY "Users can view own orders with shipping" ON orders_with_shipping
  FOR SELECT
  USING (auth.uid() = user_id);

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'EasyShip database updates applied successfully!';
  RAISE NOTICE 'New columns added to orders table:';
  RAISE NOTICE '  - subtotal, shipping_cost, taxes_duties';
  RAISE NOTICE '  - shipping_method (JSONB)';
  RAISE NOTICE '  - shipment_id, tracking_number, tracking_url';
  RAISE NOTICE '  - label_url, courier_name, estimated_delivery_date';
  RAISE NOTICE '  - shipment_status';
  RAISE NOTICE 'View created: orders_with_shipping';
END $$;
