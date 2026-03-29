import { Heart, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import StarRating from "./StarRating";

const ProductCard = ({ product, index = 0 }: { product: Product; index?: number }) => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const wishlisted = isInWishlist(product.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group"
    >
      <div className="relative overflow-hidden rounded-lg bg-card">
        <Link to={`/products/${product.id}`}>
          <div className="aspect-[3/4] overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          </div>
        </Link>
        {product.isNew && (
          <span className="absolute top-3 left-3 bg-accent text-accent-foreground text-xs font-heading font-semibold px-2.5 py-1 rounded-sm tracking-wide">
            NEW
          </span>
        )}
        {product.originalPrice && (
          <span className="absolute top-3 left-3 bg-destructive text-destructive-foreground text-xs font-heading font-semibold px-2.5 py-1 rounded-sm">
            SALE
          </span>
        )}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={() => wishlisted ? removeFromWishlist(product.id) : addToWishlist(product)}
            className="w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
          >
            <Heart className={`w-4 h-4 ${wishlisted ? "fill-accent text-accent" : "text-foreground"}`} />
          </button>
          <button
            onClick={() => addToCart(product)}
            className="w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
          >
            <ShoppingBag className="w-4 h-4 text-foreground" />
          </button>
        </div>
      </div>
      <div className="pt-3 space-y-1">
        <Link to={`/products/${product.id}`} className="block">
          <h3 className="font-heading font-medium text-sm tracking-wide text-foreground hover:text-accent transition-colors">
            {product.name}
          </h3>
        </Link>
        <StarRating rating={product.rating} />
        <div className="flex items-center gap-2">
          <span className="font-heading font-semibold text-foreground">${product.price}</span>
          {product.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">${product.originalPrice}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
