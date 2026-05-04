import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const Cart = () => {
  const { items, removeFromCart, updateQuantity, clearCart, totalPrice } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [placing, setPlacing] = useState(false);

  const shipping = totalPrice >= 150 ? 0 : 9.99;
  const grandTotal = totalPrice + shipping;

  const handleCheckout = async () => {
    if (!user) {
      toast({ title: "Please sign in to checkout" });
      navigate("/login");
      return;
    }
    setPlacing(true);
    const { data, error } = await supabase.functions.invoke("create-order", {
      body: {
        items: items.map(i => ({
          product_id: i.product.id,
          quantity: i.quantity,
          size: i.size ?? null,
          color: i.color ?? null,
        })),
      },
    });
    setPlacing(false);
    if (error || (data as any)?.error) {
      toast({
        title: "Checkout failed",
        description: error?.message ?? (data as any)?.error,
        variant: "destructive",
      });
      return;
    }
    await clearCart();
    toast({ title: "Order placed!", description: `Total $${Number((data as any).total).toFixed(2)}` });
    navigate("/account");
  };

  if (items.length === 0) {
    return (
      <div className="container py-20 text-center">
        <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground/30 mb-6" />
        <h1 className="font-heading text-3xl font-bold text-foreground mb-3">Your cart is empty</h1>
        <p className="text-muted-foreground mb-8">Discover our collection and add your favorites.</p>
        <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground font-heading rounded-sm h-12 px-8">
          <Link to="/products">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-heading text-4xl font-bold text-foreground">Cart</h1>
        <Button variant="ghost" onClick={clearCart} className="text-destructive hover:text-destructive">
          Clear Cart
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-4">
          {items.map(({ product, quantity, size, color }) => (
            <motion.div
              key={product.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex gap-4 p-4 bg-card rounded-lg"
            >
              <Link to={`/products/${product.id}`} className="w-24 h-28 rounded-md overflow-hidden shrink-0">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              </Link>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <Link to={`/products/${product.id}`} className="font-heading font-semibold text-foreground hover:text-accent transition-colors">{product.name}</Link>
                  {(size || color) && <p className="text-xs text-muted-foreground mt-1">{[size, color].filter(Boolean).join(" / ")}</p>}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQuantity(product.id, quantity - 1)} className="w-8 h-8 border border-border rounded flex items-center justify-center hover:bg-muted">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                    <button onClick={() => updateQuantity(product.id, quantity + 1)} className="w-8 h-8 border border-border rounded flex items-center justify-center hover:bg-muted">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <span className="font-heading font-semibold text-foreground">${product.price * quantity}</span>
                </div>
              </div>
              <button onClick={() => removeFromCart(product.id)} className="self-start text-muted-foreground hover:text-destructive transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>

        <div className="bg-card rounded-lg p-6 h-fit space-y-4">
          <h2 className="font-heading font-bold text-lg text-foreground">Order Summary</h2>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium text-foreground">${totalPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Shipping</span>
            <span className="font-medium text-foreground">{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
          </div>
          <div className="border-t border-border pt-4 flex justify-between">
            <span className="font-heading font-bold text-foreground">Total</span>
            <span className="font-heading font-bold text-foreground text-lg">${grandTotal.toFixed(2)}</span>
          </div>
          <Button onClick={handleCheckout} disabled={placing} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-heading font-semibold h-12 rounded-sm">
            {placing ? "Placing order…" : "Checkout"}
          </Button>
          <Button asChild variant="ghost" className="w-full text-muted-foreground">
            <Link to="/products">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
