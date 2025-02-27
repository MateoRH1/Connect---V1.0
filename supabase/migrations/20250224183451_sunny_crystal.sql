/*
  # Add MercadoLibre Sales Data Table

  1. New Tables
    - `mercadolibre_sales_data`: Stores detailed sales information from MercadoLibre
      - Primary and foreign keys
      - All relevant sales fields
      - Timestamps and audit fields
  
  2. Security
    - Enable RLS
    - Add policies for data access
    
  3. Indexes
    - Add performance optimization indexes
*/

-- Create the sales data table
CREATE TABLE IF NOT EXISTS mercadolibre_sales_data (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) NOT NULL,
    sale_id text NOT NULL,
    sale_date timestamptz NOT NULL,
    shipping_status text,
    is_cart boolean DEFAULT false,
    is_multi_item_package boolean DEFAULT false,
    quantity integer NOT NULL,
    product_revenue numeric(15,2),
    shipping_revenue numeric(15,2),
    sale_fees numeric(15,2),
    shipping_costs numeric(15,2),
    refunds numeric(15,2),
    total_amount numeric(15,2),
    is_advertising_sale boolean DEFAULT false,
    sku text,
    publication_id text,
    is_catalog boolean,
    publication_title text,
    variant text,
    full_title text,
    unit_price numeric(15,2),
    publication_type text,
    has_invoice boolean,
    buyer_nickname text,
    buyer_doc_type text,
    buyer_doc_number text,
    shipping_address text,
    shipping_city text,
    shipping_state text,
    shipping_zip text,
    shipping_country text,
    delivery_type text,
    shipping_date timestamptz,
    delivery_date timestamptz,
    carrier text,
    tracking_number text,
    tracking_url text,
    has_claim boolean DEFAULT false,
    claim_closed boolean DEFAULT false,
    has_mediation boolean DEFAULT false,
    category text,
    brand text,
    model text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(user_id, sale_id)
);

-- Enable RLS
ALTER TABLE mercadolibre_sales_data ENABLE ROW LEVEL SECURITY;

-- Create policies
DO $$ 
BEGIN
  -- Read policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'mercadolibre_sales_data' AND policyname = 'Users can read own sales data'
  ) THEN
    CREATE POLICY "Users can read own sales data"
      ON mercadolibre_sales_data
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  -- Insert policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'mercadolibre_sales_data' AND policyname = 'Users can insert own sales data'
  ) THEN
    CREATE POLICY "Users can insert own sales data"
      ON mercadolibre_sales_data
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Update policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'mercadolibre_sales_data' AND policyname = 'Users can update own sales data'
  ) THEN
    CREATE POLICY "Users can update own sales data"
      ON mercadolibre_sales_data
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_mercadolibre_sales_data_user_id ON mercadolibre_sales_data(user_id);
CREATE INDEX IF NOT EXISTS idx_mercadolibre_sales_data_sale_date ON mercadolibre_sales_data(sale_date);
CREATE INDEX IF NOT EXISTS idx_mercadolibre_sales_data_publication_id ON mercadolibre_sales_data(publication_id);
CREATE INDEX IF NOT EXISTS idx_mercadolibre_sales_data_sku ON mercadolibre_sales_data(sku);
