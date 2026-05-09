
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS shipping_address jsonb;

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_address jsonb;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method text NOT NULL DEFAULT 'cod';

-- Allow owners to update only their own pending orders (used for cancellation)
CREATE POLICY "Orders owner cancel pending"
ON public.orders
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND status = 'pending')
WITH CHECK (auth.uid() = user_id AND status IN ('cancelled', 'pending'));
