import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assert, assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL") ?? Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/create-order`;

const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function countAuditRowsSince(since: string): Promise<number> {
  const { count, error } = await admin
    .from("order_audit_log")
    .select("id", { count: "exact", head: true })
    .gte("created_at", since);
  assert(!error, error?.message);
  return count ?? 0;
}

Deno.test("missing Authorization header is rejected with 401 and writes no audit row (no user_id known)", async () => {
  const before = new Date().toISOString();

  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY },
    body: JSON.stringify({ items: [{ product_id: 1, quantity: 1 }] }),
  });
  await response.text();
  assertEquals(response.status, 401);

  // No user_id can be derived from a missing token, so no audit row should be written.
  assertEquals(await countAuditRowsSince(before), 0, "No audit rows should be written for unauth requests");
});

Deno.test("invalid Authorization token is rejected with 401 and writes no audit row", async () => {
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
  const body = await response.json().catch(() => ({}));
  assertEquals(response.status, 401);
  assertEquals(body.error, "Unauthorized");

  // Token cannot be resolved to a user, so no audit row should be written.
  assertEquals(await countAuditRowsSince(before), 0, "No audit rows should be written for invalid tokens");
});
