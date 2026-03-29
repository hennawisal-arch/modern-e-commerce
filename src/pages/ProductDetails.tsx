import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Minus, Plus, ShoppingBag, ArrowLeft } from "lucide-react";
import { products } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import StarRating from "@/components/StarRating";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";

const ProductDetails = () => {
  const { id } = useParams();
  const product = products.find(p => p.id === Number(id));
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | undefined>();
  const [selectedColor, setSelectedColor] = useState<string | undefined>();

  if (!product) {
    return (
      <div className="container py-20 text-center">
        <p className="text-muted-foreground text-lg">Product not found.</p>
        <Button asChild variant="link" className="text-accent mt-4">
          <Link to="/products">Back to Shop</Link>
        </Button>
      </div>
    );
  }

  const wishlisted = isInWishlist(product.id);
  const related = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

  return (
    <div className="container py-8">
      <Link to="/products" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Shop
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Images */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="aspect-[3/4] rounded-lg overflow-hidden bg-card">
            <img src={product.images[selectedImage]} alt={product.name} className="w-full h-full object-cover" />
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-3">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-20 h-24 rounded-md overflow-hidden border-2 transition-colors ${i === selectedImage ? "border-accent" : "border-transparent"}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Info */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="space-y-6">
          <div>
            <p className="text-sm text-muted-foreground font-heading tracking-wide uppercase mb-1">{product.category}</p>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground">{product.name}</h1>
          </div>

          <div className="flex items-center gap-4">
            <span className="font-heading text-2xl font-bold text-foreground">${product.price}</span>
            {product.originalPrice && (
              <span className="text-lg text-muted-foreground line-through">${product.originalPrice}</span>
            )}
          </div>

          <StarRating rating={product.rating} reviews={product.reviews} />

          <p className="text-muted-foreground leading-relaxed">{product.description}</p>

          {product.sizes && (
            <div>
              <p className="font-heading font-semibold text-sm mb-2 text-foreground">Size</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
                      selectedSize === size ? "border-accent bg-accent text-accent-foreground" : "border-border text-foreground hover:border-foreground"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.colors && (
            <div>
              <p className="font-heading font-semibold text-sm mb-2 text-foreground">Color</p>
              <div className="flex flex-wrap gap-2">
                {product.colors.map(color => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
                      selectedColor === color ? "border-accent bg-accent text-accent-foreground" : "border-border text-foreground hover:border-foreground"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <p className="font-heading font-semibold text-sm mb-2 text-foreground">Quantity</p>
            <div className="flex items-center gap-3">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 border border-border rounded-md flex items-center justify-center hover:bg-muted transition-colors">
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-heading font-semibold w-10 text-center">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 border border-border rounded-md flex items-center justify-center hover:bg-muted transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              onClick={() => addToCart(product, quantity, selectedSize, selectedColor)}
              className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground font-heading font-semibold h-12 rounded-sm"
            >
              <ShoppingBag className="w-4 h-4 mr-2" /> Add to Cart
            </Button>
            <Button
              variant="outline"
              onClick={() => wishlisted ? removeFromWishlist(product.id) : addToWishlist(product)}
              className={`h-12 w-12 rounded-sm ${wishlisted ? "border-accent text-accent" : ""}`}
            >
              <Heart className={`w-5 h-5 ${wishlisted ? "fill-current" : ""}`} />
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="font-heading text-2xl font-bold text-foreground mb-8">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetails;
