import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Truck, Shield, RotateCcw } from "lucide-react";
import { products, categories } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";

const Index = () => {
  const featured = products.slice(0, 4);
  const trending = products.filter(p => p.isTrending);
  const newArrivals = products.filter(p => p.isNew);

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center" style={{ background: "var(--hero-gradient)" }}>
        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <p className="text-accent font-heading text-sm tracking-[0.2em] font-semibold mb-4">NEW COLLECTION 2026</p>
            <h1 className="font-heading text-5xl md:text-7xl font-bold leading-[1.1] mb-6" style={{ color: "hsl(45 20% 97%)" }}>
              Redefine Your <span className="text-accent">Style</span>
            </h1>
            <p className="text-lg mb-8 max-w-md leading-relaxed" style={{ color: "hsl(45 20% 85%)" }}>
              Discover curated pieces that blend timeless elegance with contemporary design.
            </p>
            <div className="flex gap-4">
              <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground font-heading font-semibold px-8 h-12 rounded-sm">
                <Link to="/products">Shop Now <ArrowRight className="ml-2 w-4 h-4" /></Link>
              </Button>
              <Button asChild variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 font-heading px-8 h-12 rounded-sm bg-transparent">
                <Link to="/products">Explore</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Brand Highlights */}
      <section className="border-b border-border">
        <div className="container py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            {[
              { icon: Truck, title: "Free Shipping", desc: "On orders over $150" },
              { icon: Shield, title: "Secure Payment", desc: "100% encrypted checkout" },
              { icon: RotateCcw, title: "Easy Returns", desc: "30-day return policy" },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center justify-center gap-3 py-2">
                <Icon className="w-5 h-5 text-accent" />
                <div className="text-left">
                  <p className="font-heading font-semibold text-sm text-foreground">{title}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container py-20">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="font-heading text-3xl md:text-4xl font-bold text-center mb-12 text-foreground"
        >
          Shop by Category
        </motion.h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link to={`/products?category=${cat.slug}`} className="group relative block aspect-[3/4] rounded-lg overflow-hidden">
                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <h3 className="font-heading font-bold text-lg tracking-wide" style={{ color: "hsl(45 20% 97%)" }}>{cat.name}</h3>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="bg-card py-20">
        <div className="container">
          <div className="flex items-center justify-between mb-10">
            <h2 className="font-heading text-3xl font-bold text-foreground">Featured</h2>
            <Link to="/products" className="text-sm font-medium text-accent hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {featured.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        </div>
      </section>

      {/* Trending */}
      {trending.length > 0 && (
        <section className="container py-20">
          <h2 className="font-heading text-3xl font-bold text-foreground mb-10">Trending Now</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {trending.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        </section>
      )}

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="bg-card py-20">
          <div className="container">
            <h2 className="font-heading text-3xl font-bold text-foreground mb-10">New Arrivals</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {newArrivals.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </div>
        </section>
      )}

      {/* Testimonial */}
      <section className="container py-20 text-center">
        <motion.blockquote
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <p className="font-heading text-2xl md:text-3xl font-light italic text-foreground leading-relaxed mb-6">
            "ÉLEVE has completely transformed my wardrobe. Every piece feels like it was made just for me."
          </p>
          <cite className="text-sm text-muted-foreground not-italic font-heading tracking-wide">— Sarah M., New York</cite>
        </motion.blockquote>
      </section>
    </div>
  );
};

export default Index;
