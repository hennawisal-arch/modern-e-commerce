import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Product, products } from "@/data/products";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStrict } from "@/context/AuthContext";

export interface CartItem {
  product: Product;
  quantity: number;
  size?: string;
  color?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number, size?: string, color?: string) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuthStrict("CartProvider");
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart from DB when user logs in
  useEffect(() => {
    if (!user) { setItems([]); return; }
    (async () => {
      const { data } = await supabase.from("cart_items").select("*").eq("user_id", user.id);
      if (data) {
        const loaded = data
          .map((row) => {
            const product = products.find(p => p.id === row.product_id);
            if (!product) return null;
            return { product, quantity: row.quantity, size: row.size ?? undefined, color: row.color ?? undefined } as CartItem;
          })
          .filter(Boolean) as CartItem[];
        setItems(loaded);
      }
    })();
  }, [user]);

  const addToCart = async (product: Product, quantity = 1, size?: string, color?: string) => {
    setItems(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i);
      return [...prev, { product, quantity, size, color }];
    });
    toast({ title: "Added to cart", description: `${product.name} has been added to your cart.` });
    if (user) {
      const { data: existing } = await supabase
        .from("cart_items").select("id, quantity")
        .eq("user_id", user.id).eq("product_id", product.id).maybeSingle();
      if (existing) {
        await supabase.from("cart_items").update({ quantity: existing.quantity + quantity }).eq("id", existing.id);
      } else {
        await supabase.from("cart_items").insert({ user_id: user.id, product_id: product.id, quantity, size, color });
      }
    }
  };

  const removeFromCart = async (productId: number) => {
    setItems(prev => prev.filter(i => i.product.id !== productId));
    toast({ title: "Removed from cart" });
    if (user) await supabase.from("cart_items").delete().eq("user_id", user.id).eq("product_id", productId);
  };

  const updateQuantity = async (productId: number, quantity: number) => {
    if (quantity <= 0) { removeFromCart(productId); return; }
    setItems(prev => prev.map(i => i.product.id === productId ? { ...i, quantity } : i));
    if (user) await supabase.from("cart_items").update({ quantity }).eq("user_id", user.id).eq("product_id", productId);
  };

  const clearCart = async () => {
    setItems([]);
    if (user) await supabase.from("cart_items").delete().eq("user_id", user.id);
  };

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};
