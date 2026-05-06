ALTER TABLE public.order_audit_log
  ADD CONSTRAINT order_audit_log_status_valid
    CHECK (status IN ('success', 'rejected', 'error'));

ALTER TABLE public.order_audit_log
  ADD CONSTRAINT order_audit_log_arrays_match
    CHECK (
      array_length(product_ids, 1) IS NOT DISTINCT FROM array_length(quantities, 1)
      AND COALESCE(array_length(product_ids, 1), 0) = item_count
    );

ALTER TABLE public.order_audit_log
  ADD CONSTRAINT order_audit_log_nonnegative
    CHECK (item_count >= 0 AND (total IS NULL OR total >= 0));

ALTER TABLE public.order_audit_log
  ADD CONSTRAINT order_audit_log_null_user_shape
    CHECK (
      user_id IS NOT NULL
      OR (
        status = 'rejected'
        AND total IS NULL
        AND item_count = 0
        AND COALESCE(array_length(product_ids, 1), 0) = 0
        AND COALESCE(array_length(quantities, 1), 0) = 0
        AND order_id IS NULL
      )
    );