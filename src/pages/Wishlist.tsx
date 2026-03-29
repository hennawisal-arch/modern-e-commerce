import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";

const Wishlist = () => {
  const { items, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="container py-20 text-center">
        <Heart className="w-16 h-16 mx-auto text-muted-foreground/30 mb-6" />
        <h1 className="font-heading text-3xl font-bold text-foreground mb-3">Your wishlist is empty</h1>
        <p className="text-muted-foreground mb-8">Save items you love to your wishlist.</p>
        <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground font-heading rounded-sm h-12 px-8">
          <Link to="/products">Explore Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <h1 className="font-heading text-4xl font-bold text-foreground mb-8">Wishlist</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {items.map((product, i) => (
          <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="group">
            <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-card">
              <Link to={`/products/${product.id}`}>
                <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </Link>
              <div className="absolute top-3 right-3 flex flex-col gap-2">
                <button onClick={() => removeFromWishlist(product.id)} className="w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
                <button onClick={() => { addToCart(product); removeFromWishlist(product.id); }} className="w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors">
                  <ShoppingBag className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="pt-3">
              <h3 className="font-heading font-medium text-sm text-foreground">{product.name}</h3>
              <span className="font-heading font-semibold text-foreground">${product.price}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
