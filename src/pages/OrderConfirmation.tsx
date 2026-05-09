import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CheckCircle2, Package, Truck, XCircle, Download, RotateCcw, Ban, MapPin, Banknote } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { downloadInvoicePdf } from "@/lib/invoice";
import { products as productsCatalog } from "@/data/products";
import { cn } from "@/lib/utils";

interface OrderItem {
  id: string;
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  size: string | null;
  color: string | null;
}

interface ShippingAddress {
  fullName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

interface Order {
  id: string;
  total: number;
  status: string;
  created_at: string;
  payment_method: string | null;
  shipping_address: ShippingAddress | null;
}

const STATUS_STEPS = [
  { key: "pending", label: "Pending", icon: Package },
  { key: "processing", label: "Processing", icon: Package },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle2 },
] as const;

const OrderConfirmation = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { addToCart } = useCart();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const load = async () => {
    if (!id) return;
    const { data: orderData, error: orderErr } = await supabase
      .from("orders")
      .select("id, total, status, created_at, payment_method, shipping_address")
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

    setOrder({
      ...orderData,
      total: Number(orderData.total),
      shipping_address: (orderData.shipping_address as ShippingAddress | null) ?? null,
    });
    setItems((itemsData ?? []).map(i => ({ ...i, price: Number(i.price) })));
    setLoading(false);
  };

  useEffect(() => {
    if (authLoading) return;
    if (!id) { setError("Missing order id"); setLoading(false); return; }
    if (!user) { setError("Please sign in to view this order."); setLoading(false); return; }
    setLoading(true);
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user, authLoading]);

  const subtotal = useMemo(() => items.reduce((s, i) => s + i.price * i.quantity, 0), [items]);
  const shippingCost = order ? Math.max(0, order.total - subtotal) : 0;

  const handleCancel = async () => {
    if (!order) return;
    setCancelling(true);
    const { error: updErr } = await supabase
      .from("orders")
      .update({ status: "cancelled" })
      .eq("id", order.id);
    setCancelling(false);
    if (updErr) {
      toast({ title: "Could not cancel", description: updErr.message, variant: "destructive" });
      return;
    }
    toast({ title: "Order cancelled" });
    setOrder({ ...order, status: "cancelled" });
  };

  const handleReorder = async () => {
    let added = 0;
    for (const it of items) {
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

  const handleDownloadInvoice = () => {
    if (!order) return;
    downloadInvoicePdf({
      orderId: order.id,
      createdAt: order.created_at,
      status: order.status,
      paymentMethod: order.payment_method ?? "cod",
      items,
      subtotal,
      shipping: shippingCost,
      total: order.total,
      shippingAddress: order.shipping_address,
    });
  };

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
        <h1 className="font-heading text-3xl font-bold text-foreground mb-3">{error ?? "Order not found"}</h1>
        <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground font-heading rounded-sm h-12 px-8 mt-6">
          <Link to="/products">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  const isCancelled = order.status === "cancelled";
  const currentStepIdx = STATUS_STEPS.findIndex(s => s.key === order.status);
  const a = order.shipping_address;

  return (
    <div className="container py-10 max-w-3xl">
      <div className="text-center mb-10">
        {isCancelled ? (
          <XCircle className="w-16 h-16 mx-auto text-destructive mb-4" />
        ) : (
          <CheckCircle2 className="w-16 h-16 mx-auto text-accent mb-4" />
        )}
        <h1 className="font-heading text-4xl font-bold text-foreground mb-2">
          {isCancelled ? "Order cancelled" : "Thank you for your order!"}
        </h1>
        <p className="text-muted-foreground">
          Order <span className="font-mono text-foreground">#{order.id.slice(0, 8)}</span> ·{" "}
          {new Date(order.created_at).toLocaleString()}
        </p>
      </div>

      {/* Status tracker */}
      <div className="bg-card rounded-lg p-6 mb-6">
        <h2 className="font-heading font-bold text-lg text-foreground mb-5">Order Status</h2>
        {isCancelled ? (
          <div className="flex items-center gap-3 text-destructive">
            <XCircle className="w-5 h-5" />
            <span className="font-medium">This order was cancelled.</span>
          </div>
        ) : (
          <ol className="flex items-center justify-between gap-2">
            {STATUS_STEPS.map((step, idx) => {
              const Icon = step.icon;
              const reached = idx <= currentStepIdx;
              const active = idx === currentStepIdx;
              return (
                <li key={step.key} className="flex-1 flex flex-col items-center text-center relative">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors z-10 bg-card",
                      reached ? "border-accent text-accent" : "border-border text-muted-foreground",
                      active && "ring-4 ring-accent/20"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={cn("text-xs mt-2", reached ? "text-foreground font-medium" : "text-muted-foreground")}>
                    {step.label}
                  </span>
                  {idx < STATUS_STEPS.length - 1 && (
                    <span
                      className={cn(
                        "absolute top-5 left-1/2 w-full h-0.5",
                        idx < currentStepIdx ? "bg-accent" : "bg-border"
                      )}
                    />
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </div>

      {/* Shipping address & payment */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-card rounded-lg p-6">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4 text-accent" />
            <h3 className="font-heading font-semibold text-sm uppercase tracking-wide text-foreground">Shipping To</h3>
          </div>
          {a ? (
            <div className="text-sm text-muted-foreground space-y-0.5">
              {a.fullName && <p className="text-foreground font-medium">{a.fullName}</p>}
              {a.address && <p>{a.address}</p>}
              <p>{[a.city, a.state, a.postalCode].filter(Boolean).join(", ")}</p>
              {a.country && <p>{a.country}</p>}
              {a.phone && <p className="pt-1">{a.phone}</p>}
              {a.email && <p>{a.email}</p>}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No shipping address on file.</p>
          )}
        </div>

        <div className="bg-card rounded-lg p-6">
          <div className="flex items-center gap-2 mb-3">
            <Banknote className="w-4 h-4 text-accent" />
            <h3 className="font-heading font-semibold text-sm uppercase tracking-wide text-foreground">Payment</h3>
          </div>
          <p className="text-sm text-foreground font-medium">
            {order.payment_method === "cod" ? "Cash on Delivery" : (order.payment_method ?? "—")}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {order.payment_method === "cod" ? "You'll pay with cash when your order is delivered." : ""}
          </p>
        </div>
      </div>

      {/* Order summary */}
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
            <span className="font-medium text-foreground">{shippingCost === 0 ? "Free" : `$${shippingCost.toFixed(2)}`}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-border">
            <span className="font-heading font-bold text-foreground">Total</span>
            <span className="font-heading font-bold text-foreground text-lg">${order.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 justify-center">
        <Button onClick={handleDownloadInvoice} className="bg-accent hover:bg-accent/90 text-accent-foreground font-heading rounded-sm h-12 px-6">
          <Download className="w-4 h-4 mr-2" /> Download Invoice
        </Button>
        <Button onClick={handleReorder} variant="outline" className="font-heading rounded-sm h-12 px-6">
          <RotateCcw className="w-4 h-4 mr-2" /> Reorder
        </Button>
        {order.status === "pending" && (
          <Button
            onClick={handleCancel}
            disabled={cancelling}
            variant="outline"
            className="font-heading rounded-sm h-12 px-6 text-destructive hover:text-destructive border-destructive/40"
          >
            <Ban className="w-4 h-4 mr-2" /> {cancelling ? "Cancelling…" : "Cancel Order"}
          </Button>
        )}
        <Button asChild variant="ghost" className="font-heading h-12 px-6">
          <Link to="/account">My Orders</Link>
        </Button>
      </div>
    </div>
  );
};

export default OrderConfirmation;
