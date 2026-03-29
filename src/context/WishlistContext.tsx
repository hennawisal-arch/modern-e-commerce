import React, { createContext, useContext, useState, ReactNode } from "react";
import { Product } from "@/data/products";
import { toast } from "@/hooks/use-toast";

interface WishlistContextType {
  items: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: number) => void;
  isInWishlist: (productId: number) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<Product[]>([]);

  const addToWishlist = (product: Product) => {
    setItems(prev => {
      if (prev.find(i => i.id === product.id)) return prev;
      return [...prev, product];
    });
    toast({ title: "Added to wishlist", description: `${product.name} saved.` });
  };

  const removeFromWishlist = (productId: number) => {
    setItems(prev => prev.filter(i => i.id !== productId));
    toast({ title: "Removed from wishlist" });
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
