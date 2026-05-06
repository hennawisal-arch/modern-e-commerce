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
});
