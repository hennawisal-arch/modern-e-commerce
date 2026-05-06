import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assert, assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL") ?? Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/create-order`;

const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function fetchAuditRows(since: string, reason: string) {
  const { data, error } = await admin
    .from("order_audit_log")
    .select("status, reason, user_id, total, item_count, product_ids, quantities, order_id, created_at")
    .gte("created_at", since)
    .eq("reason", reason)
    .order("created_at", { ascending: false });
  assert(!error, error?.message);
  return data ?? [];
}

const ALLOWED_STATUSES = new Set(["success", "rejected", "error"]);

function assertSatisfiesCheckConstraints(row: {
  status: string;
  user_id: string | null;
  total: number | null;
  item_count: number;
  product_ids: number[];
  quantities: number[];
  order_id: string | null;
}) {
  // status whitelist (order_audit_log_status_valid)
  assert(ALLOWED_STATUSES.has(row.status), `status must be one of success/rejected/error, got ${row.status}`);

  // arrays + item_count consistency (order_audit_log_arrays_match)
  assert(Array.isArray(row.product_ids), "product_ids must be an array");
  assert(Array.isArray(row.quantities), "quantities must be an array");
  assertEquals(row.product_ids.length, row.quantities.length, "product_ids and quantities must have equal length");
  assertEquals(row.product_ids.length, row.item_count, "array length must equal item_count");

  // non-negative totals (order_audit_log_nonnegative)
  assert(row.item_count >= 0, "item_count must be non-negative");
  assert(row.total === null || Number(row.total) >= 0, "total must be null or non-negative");

  // null user_id shape (order_audit_log_null_user_shape)
  if (row.user_id === null) {
    assertEquals(row.status, "rejected", "null user_id rows must be status=rejected");
    assertEquals(row.total, null, "null user_id rows must have null total");
    assertEquals(row.item_count, 0, "null user_id rows must have item_count=0");
    assertEquals(row.product_ids, [], "null user_id rows must have empty product_ids");
    assertEquals(row.quantities, [], "null user_id rows must have empty quantities");
    assertEquals(row.order_id, null, "null user_id rows must have null order_id");
  }
}

Deno.test("missing Authorization header writes a rejected audit row with null user_id", async () => {
  const before = new Date().toISOString();

  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY },
    body: JSON.stringify({ items: [{ product_id: 1, quantity: 1 }] }),
  });
  await response.text();
  assertEquals(response.status, 401);

  const rows = await fetchAuditRows(before, "missing_auth_header");
  assert(rows.length >= 1, "Expected at least one audit row for missing_auth_header");
  const row = rows[0];
  assertEquals(row.status, "rejected");
  assertEquals(row.reason, "missing_auth_header");
  assertEquals(row.user_id, null);
  assertEquals(row.item_count, 0);
  assertEquals(row.total, null);
  assertEquals(row.product_ids, []);
  assertEquals(row.quantities, []);
  assertEquals(row.order_id, null);
  assertSatisfiesCheckConstraints(row);
});

Deno.test("invalid Authorization token writes a rejected audit row with null user_id", async () => {
  const before = new Date().toISOString();

  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
      Authorization: "Bearer not-a-real-jwt-token",
    },
    body: JSON.stringify({ items: [{ product_id: 1, quantity: 1 }] }),
  });
  await response.text();
  assertEquals(response.status, 401);

  const rows = await fetchAuditRows(before, "invalid_auth_token");
  assert(rows.length >= 1, "Expected at least one audit row for invalid_auth_token");
  const row = rows[0];
  assertEquals(row.status, "rejected");
  assertEquals(row.reason, "invalid_auth_token");
  assertEquals(row.user_id, null);
  assertEquals(row.item_count, 0);
  assertEquals(row.total, null);
  assertEquals(row.product_ids, []);
  assertEquals(row.quantities, []);
  assertEquals(row.order_id, null);
  assertSatisfiesCheckConstraints(row);
});
