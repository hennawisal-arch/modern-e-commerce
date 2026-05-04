import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assert, assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL") ?? Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/create-order`;

const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const anon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

Deno.test("empty cart writes rejected audit row with total 0", async () => {
  const runId = crypto.randomUUID();
  const email = `create-order-empty-${runId}@example.com`;
  const password = `Test-${runId}!pass`;

  const { data: createdUser, error: createUserError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  assert(!createUserError, createUserError?.message);
  assert(createdUser.user, "Expected test user to be created");

  try {
    const { data: sessionData, error: signInError } = await anon.auth.signInWithPassword({
      email,
      password,
    });
    assert(!signInError, signInError?.message);
    assert(sessionData.session?.access_token, "Expected access token for test user");

    const before = new Date().toISOString();

    const response = await fetch(FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${sessionData.session.access_token}`,
      },
      body: JSON.stringify({ items: [] }),
    });

    const responseBody = await response.json();
    assertEquals(response.status, 400);
    assertEquals(responseBody.error, "Cart is empty");

    const { data: auditRows, error: auditError } = await admin
      .from("order_audit_log")
      .select("status, reason, total, item_count, user_id, created_at")
      .eq("user_id", createdUser.user.id)
      .eq("reason", "empty_cart")
      .gte("created_at", before)
      .order("created_at", { ascending: false })
      .limit(1);

    assert(!auditError, auditError?.message);
    assert(auditRows && auditRows.length === 1, "Expected one audit row for empty cart attempt");

    const audit = auditRows[0];
    assert(["rejected", "error"].includes(audit.status), `Unexpected audit status: ${audit.status}`);
    assertEquals(Number(audit.total ?? 0), 0);
    assertEquals(audit.item_count, 0);
    assertEquals(audit.user_id, createdUser.user.id);
  } finally {
    await admin.auth.admin.deleteUser(createdUser.user.id);
  }
});
