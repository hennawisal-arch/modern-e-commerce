import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Package, LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface Order {
  id: string;
  total: number;
  status: string;
  created_at: string;
  order_items: { name: string; quantity: number; price: number }[];
}

const Account = () => {
  const { user, loading, signOut } = useAuth();
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
        supabase.from("orders").select("id, total, status, created_at, order_items(name, quantity, price)").eq("user_id", user.id).order("created_at", { ascending: false }),
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
                      <span className="text-xs uppercase tracking-wider text-accent">{o.status}</span>
                    </div>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-0.5">
                    {o.order_items?.map((it, i) => <li key={i}>{it.quantity}× {it.name}</li>)}
                  </ul>
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
