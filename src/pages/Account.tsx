import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Package, LogOut, User as UserIcon, Download, RotateCcw, Eye } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { downloadInvoicePdf } from "@/lib/invoice";
import { products as productsCatalog } from "@/data/products";

interface Order {
  id: string;
  total: number;
  status: string;
  created_at: string;
  payment_method: string | null;
  shipping_address: any;
  order_items: { product_id: number; name: string; quantity: number; price: number; size: string | null; color: string | null }[];
}

const Account = () => {
  const { user, loading, signOut } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: profile }, { data: ords }] = await Promise.all([
        supabase.from("profiles").select("name").eq("id", user.id).maybeSingle(),
        supabase.from("orders").select("id, total, status, created_at, payment_method, shipping_address, order_items(product_id, name, quantity, price, size, color)").eq("user_id", user.id).order("created_at", { ascending: false }),
      ]);
      if (profile?.name) setName(profile.name);
      if (ords) setOrders(ords as Order[]);
    })();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ name }).eq("id", user.id);
    setSaving(false);
    if (error) toast({ title: "Failed to save", variant: "destructive" });
    else toast({ title: "Profile updated" });
  };

  const statusBadgeClass = (status: string) => {
    switch (status) {
      case "delivered": return "bg-accent/15 text-accent";
      case "shipped": return "bg-blue-500/15 text-blue-600 dark:text-blue-400";
      case "processing": return "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400";
      case "cancelled": return "bg-destructive/15 text-destructive";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const handleReorder = async (o: Order) => {
    let added = 0;
    for (const it of o.order_items ?? []) {
      const product = productsCatalog.find(p => p.id === it.product_id);
      if (!product) continue;
      await addToCart(product, it.quantity, it.size ?? undefined, it.color ?? undefined);
      added += 1;
    }
    if (added === 0) {
      toast({ title: "Nothing to reorder", description: "Items are no longer available.", variant: "destructive" });
      return;
    }
    navigate("/cart");
  };

  const handleDownload = (o: Order) => {
    const subtotal = (o.order_items ?? []).reduce((s, i) => s + Number(i.price) * i.quantity, 0);
    const shipping = Math.max(0, Number(o.total) - subtotal);
    downloadInvoicePdf({
      orderId: o.id,
      createdAt: o.created_at,
      status: o.status,
      paymentMethod: o.payment_method ?? "cod",
      items: (o.order_items ?? []).map(i => ({ ...i, price: Number(i.price) })),
      subtotal,
      shipping,
      total: Number(o.total),
      shippingAddress: o.shipping_address ?? null,
    });
  };

  if (loading || !user) return <div className="container py-20 text-center text-muted-foreground">Loading…</div>;

  return (
    <div className="container py-10 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-heading text-4xl font-bold text-foreground mb-2">My Account</h1>
        <p className="text-muted-foreground mb-8">{user.email}</p>

        <section className="bg-card rounded-lg p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <UserIcon className="w-4 h-4" />
            <h2 className="font-heading font-semibold text-lg">Profile</h2>
          </div>
          <div className="space-y-3">
            <Input placeholder="Name" value={name} onChange={e => setName(e.target.value)} className="h-12" />
            <Button onClick={handleSave} disabled={saving} className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-sm h-11">
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </section>

        <section className="bg-card rounded-lg p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-4 h-4" />
            <h2 className="font-heading font-semibold text-lg">Orders</h2>
          </div>
          {orders.length === 0 ? (
            <p className="text-muted-foreground text-sm">No orders yet. <Link to="/products" className="text-accent hover:underline">Start shopping</Link></p>
          ) : (
            <div className="space-y-3">
              {orders.map(o => (
                <div key={o.id} className="border border-border rounded-md p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-heading font-semibold text-sm">Order #{o.id.slice(0, 8)}</p>
                      <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-heading font-bold">${Number(o.total).toFixed(2)}</p>
                      <span className={`inline-block mt-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${statusBadgeClass(o.status)}`}>
                        {o.status}
                      </span>
                    </div>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-0.5 mb-3">
                    {o.order_items?.map((it, i) => <li key={i}>{it.quantity}× {it.name}</li>)}
                  </ul>
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                    <Button asChild size="sm" variant="outline" className="rounded-sm h-8 text-xs">
                      <Link to={`/orders/${o.id}`}><Eye className="w-3 h-3 mr-1" /> View</Link>
                    </Button>
                    <Button onClick={() => handleDownload(o)} size="sm" variant="outline" className="rounded-sm h-8 text-xs">
                      <Download className="w-3 h-3 mr-1" /> Invoice
                    </Button>
                    <Button onClick={() => handleReorder(o)} size="sm" variant="outline" className="rounded-sm h-8 text-xs">
                      <RotateCcw className="w-3 h-3 mr-1" /> Reorder
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <Button variant="outline" onClick={() => { signOut(); navigate("/"); }} className="rounded-sm">
          <LogOut className="w-4 h-4 mr-2" /> Sign Out
        </Button>
      </motion.div>
    </div>
  );
};

export default Account;
