import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CheckCircle2, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface OrderItem {
  id: string;
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  size: string | null;
  color: string | null;
}

interface Order {
  id: string;
  total: number;
  status: string;
  created_at: string;
}

const OrderConfirmation = () => {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!id) {
      setError("Missing order id");
      setLoading(false);
      return;
    }
    if (!user) {
      setError("Please sign in to view this order.");
      setLoading(false);
      return;
    }

    (async () => {
      setLoading(true);
      const { data: orderData, error: orderErr } = await supabase
        .from("orders")
        .select("id, total, status, created_at")
        .eq("id", id)
        .maybeSingle();

      if (orderErr || !orderData) {
        setError("Order not found.");
        setLoading(false);
        return;
      }

      const { data: itemsData, error: itemsErr } = await supabase
        .from("order_items")
        .select("id, product_id, name, price, quantity, size, color")
        .eq("order_id", id);

      if (itemsErr) {
        setError(itemsErr.message);
        setLoading(false);
        return;
      }

      setOrder({ ...orderData, total: Number(orderData.total) });
      setItems((itemsData ?? []).map(i => ({ ...i, price: Number(i.price) })));
      setLoading(false);
    })();
  }, [id, user, authLoading]);

  if (loading) {
    return (
      <div className="container py-10 max-w-3xl space-y-4">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container py-20 text-center">
        <Package className="w-16 h-16 mx-auto text-muted-foreground/30 mb-6" />
        <h1 className="font-heading text-3xl font-bold text-foreground mb-3">
          {error ?? "Order not found"}
        </h1>
        <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground font-heading rounded-sm h-12 px-8 mt-6">
          <Link to="/products">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = Math.max(0, order.total - subtotal);

  return (
    <div className="container py-10 max-w-3xl">
      <div className="text-center mb-10">
        <CheckCircle2 className="w-16 h-16 mx-auto text-accent mb-4" />
        <h1 className="font-heading text-4xl font-bold text-foreground mb-2">Thank you for your order!</h1>
        <p className="text-muted-foreground">
          Order <span className="font-mono text-foreground">#{order.id.slice(0, 8)}</span> ·{" "}
          {new Date(order.created_at).toLocaleString()}
        </p>
      </div>

      <div className="bg-card rounded-lg p-6 space-y-4 mb-6">
        <h2 className="font-heading font-bold text-lg text-foreground">Order Summary</h2>
        <div className="divide-y divide-border">
          {items.map(item => (
            <div key={item.id} className="flex justify-between py-3 text-sm">
              <div>
                <p className="font-medium text-foreground">{item.name}</p>
                <p className="text-xs text-muted-foreground">
                  Qty {item.quantity}
                  {(item.size || item.color) && ` · ${[item.size, item.color].filter(Boolean).join(" / ")}`}
                </p>
              </div>
              <span className="font-medium text-foreground">${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium text-foreground">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Shipping</span>
            <span className="font-medium text-foreground">{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-border">
            <span className="font-heading font-bold text-foreground">Total</span>
            <span className="font-heading font-bold text-foreground text-lg">${order.total.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex justify-between text-sm pt-2">
          <span className="text-muted-foreground">Status</span>
          <span className="font-medium text-foreground capitalize">{order.status}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground font-heading rounded-sm h-12 px-8">
          <Link to="/products">Continue Shopping</Link>
        </Button>
        <Button asChild variant="outline" className="font-heading rounded-sm h-12 px-8">
          <Link to="/account">View My Orders</Link>
        </Button>
      </div>
    </div>
  );
};

export default OrderConfirmation;
