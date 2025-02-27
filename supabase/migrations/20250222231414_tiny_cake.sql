/*
  # Add MercadoLibre product and sales tables

  1. New Tables
    - `mercadolibre_products`
      - Product information from MercadoLibre
      - Tracks item ID, title, price, stock, etc.
    - `mercadolibre_sales`
      - Sales information from MercadoLibre
      - Tracks order ID, buyer info, items sold, etc.
    - `mercadolibre_categories`
      - Category information from MercadoLibre
      - Used for product categorization
    - `mercadolibre_questions`
      - Questions from buyers on products
      - Tracks question text, status, answer, etc.

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
*/

-- Create products table
CREATE TABLE mercadolibre_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  item_id text NOT NULL,
  title text NOT NULL,
  category_id text NOT NULL,
  price decimal(10,2) NOT NULL,
  currency_id text NOT NULL,
  available_quantity integer NOT NULL,
  sold_quantity integer NOT NULL DEFAULT 0,
  listing_type_id text NOT NULL,
  status text NOT NULL,
  permalink text NOT NULL,
  thumbnail text,
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, item_id)
);

-- Create sales table
CREATE TABLE mercadolibre_sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  order_id text NOT NULL,
  item_id text NOT NULL,
  quantity integer NOT NULL,
  unit_price decimal(10,2) NOT NULL,
  currency_id text NOT NULL,
  buyer_id text NOT NULL,
  buyer_name text,
  buyer_email text,
  status text NOT NULL,
  date_created timestamptz NOT NULL,
  date_closed timestamptz,
  total_amount decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, order_id)
);

-- Create categories table
CREATE TABLE mercadolibre_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  category_id text NOT NULL,
  name text NOT NULL,
  path_from_root jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, category_id)
);

-- Create questions table
CREATE TABLE mercadolibre_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  question_id text NOT NULL,
  item_id text NOT NULL,
  status text NOT NULL,
  text text NOT NULL,
  answer text,
  date_created timestamptz NOT NULL,
  answer_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, question_id)
);

-- Enable RLS
ALTER TABLE mercadolibre_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE mercadolibre_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE mercadolibre_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE mercadolibre_questions ENABLE ROW LEVEL SECURITY;

-- Products policies
CREATE POLICY "Users can read own products"
  ON mercadolibre_products
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own products"
  ON mercadolibre_products
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own products"
  ON mercadolibre_products
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Sales policies
CREATE POLICY "Users can read own sales"
  ON mercadolibre_sales
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sales"
  ON mercadolibre_sales
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sales"
  ON mercadolibre_sales
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Categories policies
CREATE POLICY "Users can read own categories"
  ON mercadolibre_categories
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories"
  ON mercadolibre_categories
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories"
  ON mercadolibre_categories
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Questions policies
CREATE POLICY "Users can read own questions"
  ON mercadolibre_questions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own questions"
  ON mercadolibre_questions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own questions"
  ON mercadolibre_questions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add indexes for better performance
CREATE INDEX idx_mercadolibre_products_user_id ON mercadolibre_products(user_id);
CREATE INDEX idx_mercadolibre_products_item_id ON mercadolibre_products(item_id);
CREATE INDEX idx_mercadolibre_sales_user_id ON mercadolibre_sales(user_id);
CREATE INDEX idx_mercadolibre_sales_order_id ON mercadolibre_sales(order_id);
CREATE INDEX idx_mercadolibre_categories_user_id ON mercadolibre_categories(user_id);
CREATE INDEX idx_mercadolibre_categories_category_id ON mercadolibre_categories(category_id);
CREATE INDEX idx_mercadolibre_questions_user_id ON mercadolibre_questions(user_id);
CREATE INDEX idx_mercadolibre_questions_question_id ON mercadolibre_questions(question_id);
CREATE INDEX idx_mercadolibre_questions_item_id ON mercadolibre_questions(item_id);
