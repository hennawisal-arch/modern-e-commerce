// Server-side checkout: prices are fetched from the database, never trusted from the client.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CartItemInput {
  product_id: number;
  quantity: number;
  size?: string | null;
  color?: string | null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const ANON = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(SUPABASE_URL, ANON, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = userData.user.id;

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    const audit = async (fields: {
      product_ids?: number[];
      quantities?: number[];
      item_count?: number;
      total?: number | null;
      status: "success" | "rejected" | "error";
      reason?: string | null;
      order_id?: string | null;
    }) => {
      try {
        await admin.from("order_audit_log").insert({
          user_id: userId,
          product_ids: fields.product_ids ?? [],
          quantities: fields.quantities ?? [],
          item_count: fields.item_count ?? 0,
          total: fields.total ?? null,
          status: fields.status,
          reason: fields.reason ?? null,
          order_id: fields.order_id ?? null,
        });
      } catch (_) {
        // Never let audit failures break checkout response.
      }
    };

    const body = await req.json().catch(() => ({}));
    const items: CartItemInput[] = Array.isArray(body?.items) ? body.items : [];
    if (items.length === 0) {
      await audit({ status: "rejected", reason: "empty_cart", total: 0, item_count: 0 });
      return new Response(JSON.stringify({ error: "Cart is empty" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const productIds = items.map((i) => i?.product_id).filter((n) => Number.isInteger(n)) as number[];
    const quantities = items.map((i) => i?.quantity).filter((n) => Number.isInteger(n)) as number[];

    // Validate input shape
    for (const it of items) {
      if (
        !Number.isInteger(it.product_id) ||
        !Number.isInteger(it.quantity) ||
        it.quantity <= 0 || it.quantity > 100
      ) {
        await audit({
          product_ids: productIds, quantities, item_count: items.length,
          status: "rejected", reason: "invalid_item",
        });
        return new Response(JSON.stringify({ error: "Invalid cart item" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const ids = [...new Set(productIds)];
    const { data: products, error: prodErr } = await admin
      .from("products").select("id, name, price").in("id", ids);
    if (prodErr || !products) {
      await audit({
        product_ids: productIds, quantities, item_count: items.length,
        status: "error", reason: "products_fetch_failed",
      });
      return new Response(JSON.stringify({ error: "Failed to load products" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const priceMap = new Map(products.map((p) => [p.id, p]));
    for (const it of items) {
      if (!priceMap.has(it.product_id)) {
        await audit({
          product_ids: productIds, quantities, item_count: items.length,
          status: "rejected", reason: "unknown_product",
        });
        return new Response(JSON.stringify({ error: `Unknown product ${it.product_id}` }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const subtotal = items.reduce((s, it) => s + Number(priceMap.get(it.product_id)!.price) * it.quantity, 0);
    const shipping = subtotal >= 150 ? 0 : 9.99;
    const total = Math.round((subtotal + shipping) * 100) / 100;

    const { data: order, error: orderErr } = await admin
      .from("orders")
      .insert({ user_id: userId, total, status: "pending" })
      .select().single();
    if (orderErr || !order) {
      await audit({
        product_ids: productIds, quantities, item_count: items.length,
        total, status: "error", reason: "order_insert_failed",
      });
      return new Response(JSON.stringify({ error: orderErr?.message ?? "Order failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const orderItems = items.map((it) => {
      const p = priceMap.get(it.product_id)!;
      return {
        order_id: order.id,
        product_id: it.product_id,
        name: p.name,
        price: p.price,
        quantity: it.quantity,
        size: it.size ?? null,
        color: it.color ?? null,
      };
    });
    const { error: itemsErr } = await admin.from("order_items").insert(orderItems);
    if (itemsErr) {
      await audit({
        product_ids: productIds, quantities, item_count: items.length,
        total, status: "error", reason: "items_insert_failed", order_id: order.id,
      });
      return new Response(JSON.stringify({ error: itemsErr.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await audit({
      product_ids: productIds, quantities, item_count: items.length,
      total, status: "success", order_id: order.id,
    });

    return new Response(JSON.stringify({ order_id: order.id, total }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
