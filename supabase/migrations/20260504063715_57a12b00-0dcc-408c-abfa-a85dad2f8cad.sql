-- Authoritative product price source
CREATE TABLE public.products (
  id integer PRIMARY KEY,
  name text NOT NULL,
  price numeric NOT NULL CHECK (price >= 0)
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products readable by all"
ON public.products FOR SELECT
USING (true);

INSERT INTO public.products (id, name, price) VALUES
  (1, 'Tailored Wool Blazer', 289),
  (2, 'Silk Midi Dress', 195),
  (3, 'Cashmere Crew Sweater', 165),
  (4, 'Gold Chain Necklace', 89),
  (5, 'Kids Denim Jacket', 65),
  (6, 'Linen Wide-Leg Pants', 120),
  (7, 'Diamond Stud Earrings', 245),
  (8, 'Cotton Oxford Shirt', 85),
  (9, 'Floral Maxi Skirt', 110),
  (10, 'Kids Graphic Tee', 28),
  (11, 'Leather Chelsea Boots', 220),
  (12, 'Pearl Drop Earrings', 135);

-- Block direct client inserts on orders / order_items.
-- The create-order edge function uses the service role key which bypasses RLS.
DROP POLICY IF EXISTS "Orders owner insert" ON public.orders;
DROP POLICY IF EXISTS "Order items owner insert" ON public.order_items;
