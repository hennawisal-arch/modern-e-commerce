CREATE TABLE public.order_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid NOT NULL,
  product_ids integer[] NOT NULL DEFAULT '{}',
  quantities integer[] NOT NULL DEFAULT '{}',
  item_count integer NOT NULL DEFAULT 0,
  total numeric,
  status text NOT NULL,
  reason text,
  order_id uuid
);

ALTER TABLE public.order_audit_log ENABLE ROW LEVEL SECURITY;

-- No client policies: only the service role (edge function) may read/write.
CREATE INDEX idx_order_audit_log_user_created ON public.order_audit_log (user_id, created_at DESC);
