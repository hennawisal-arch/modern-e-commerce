import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Product, products } from "@/data/products";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface WishlistContextType {
  items: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: number) => void;
  isInWishlist: (productId: number) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<Product[]>([]);

  useEffect(() => {
    if (!user) { setItems([]); return; }
    (async () => {
      const { data } = await supabase.from("wishlist_items").select("product_id").eq("user_id", user.id);
      if (data) {
        const loaded = data.map(r => products.find(p => p.id === r.product_id)).filter(Boolean) as Product[];
        setItems(loaded);
      }
    })();
  }, [user]);

  const addToWishlist = async (product: Product) => {
    setItems(prev => prev.find(i => i.id === product.id) ? prev : [...prev, product]);
    toast({ title: "Added to wishlist", description: `${product.name} saved.` });
    if (user) {
      await supabase.from("wishlist_items").insert({ user_id: user.id, product_id: product.id }).select();
    }
  };

  const removeFromWishlist = async (productId: number) => {
    setItems(prev => prev.filter(i => i.id !== productId));
    toast({ title: "Removed from wishlist" });
    if (user) await supabase.from("wishlist_items").delete().eq("user_id", user.id).eq("product_id", productId);
  };

  const isInWishlist = (productId: number) => items.some(i => i.id === productId);

  return (
    <WishlistContext.Provider value={{ items, addToWishlist, removeFromWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used within WishlistProvider");
  return context;
};
