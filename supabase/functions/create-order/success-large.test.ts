import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assert, assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL") ?? Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/create-order`;

const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const anon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

Deno.test("larger cart (4 items) writes success audit row with correct item_count and total", async () => {
  const runId = crypto.randomUUID();
  const email = `create-order-large-${runId}@example.com`;
  const password = `Test-${runId}!pass`;

  const { data: createdUser, error: createUserError } = await admin.auth.admin.createUser({
    email, password, email_confirm: true,
  });
  assert(!createUserError, createUserError?.message);
  assert(createdUser.user);

  try {
    const { data: sessionData, error: signInError } = await anon.auth.signInWithPassword({ email, password });
    assert(!signInError, signInError?.message);
    const token = sessionData.session!.access_token;

    const { data: products, error: prodErr } = await admin
      .from("products").select("id, price").order("id", { ascending: true }).limit(4);
    assert(!prodErr && products && products.length === 4, "Need at least 4 products");

    const quantities = [2, 1, 3, 1];
    const items = products.map((p, i) => ({ product_id: p.id, quantity: quantities[i] }));
    const subtotal = products.reduce((s, p, i) => s + Number(p.price) * quantities[i], 0);
    const shipping = subtotal >= 150 ? 0 : 9.99;
    const expectedTotal = Math.round((subtotal + shipping) * 100) / 100;
    const expectedItemCount = items.length;

    const before = new Date().toISOString();

    const response = await fetch(FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ items }),
    });
    const responseBody = await response.json();
    assertEquals(response.status, 200);
    assert(responseBody.order_id);
    assertEquals(Number(responseBody.total), expectedTotal);

    const { data: auditRows, error: auditError } = await admin
      .from("order_audit_log")
      .select("status, total, item_count, user_id, order_id, product_ids, quantities, created_at")
      .eq("user_id", createdUser.user.id)
      .eq("status", "success")
      .gte("created_at", before)
      .order("created_at", { ascending: false })
      .limit(1);

    assert(!auditError, auditError?.message);
    assert(auditRows && auditRows.length === 1, "Expected one success audit row");

    const audit = auditRows[0];
    assertEquals(audit.status, "success");
    assertEquals(Number(audit.total), expectedTotal);
    assertEquals(audit.item_count, expectedItemCount);
    assertEquals(audit.order_id, responseBody.order_id);
    assertEquals(audit.product_ids, items.map((i) => i.product_id));
    assertEquals(audit.quantities, quantities);

    await admin.from("order_items").delete().eq("order_id", responseBody.order_id);
    await admin.from("orders").delete().eq("id", responseBody.order_id);
  } finally {
    await admin.auth.admin.deleteUser(createdUser.user.id);
  }
});
