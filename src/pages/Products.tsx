import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { products, categories } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "low-high", label: "Price: Low to High" },
  { value: "high-low", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCat = searchParams.get("category") || "";
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(initialCat);
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [sort, setSort] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let result = products.filter(p => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (category && p.category !== category) return false;
      if (p.price < priceRange[0] || p.price > priceRange[1]) return false;
      return true;
    });
    switch (sort) {
      case "low-high": result.sort((a, b) => a.price - b.price); break;
      case "high-low": result.sort((a, b) => b.price - a.price); break;
      case "rating": result.sort((a, b) => b.rating - a.rating); break;
      default: break;
    }
    return result;
  }, [search, category, priceRange, sort]);

  const clearFilters = () => {
    setSearch(""); setCategory(""); setPriceRange([0, 500]); setSort("newest");
    setSearchParams({});
  };

  return (
    <div className="container py-10">
      <h1 className="font-heading text-4xl font-bold text-foreground mb-8">Shop All</h1>

      {/* Search & Sort bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 bg-card border-border"
          />
        </div>
        <div className="flex gap-3">
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="h-10 px-4 rounded-md border border-border bg-card text-foreground text-sm font-body"
          >
            {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden"
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" /> Filters
          </Button>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar Filters */}
        <aside className={`${showFilters ? "block" : "hidden"} md:block w-full md:w-56 shrink-0 space-y-8`}>
          <div>
            <h3 className="font-heading font-semibold text-sm mb-3 text-foreground">Category</h3>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => { setCategory(""); setSearchParams({}); }}
                className={`text-left text-sm py-1.5 px-3 rounded-md transition-colors ${!category ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                All
              </button>
              {categories.map(cat => (
                <button
                  key={cat.slug}
                  onClick={() => { setCategory(cat.slug); setSearchParams({ category: cat.slug }); }}
                  className={`text-left text-sm py-1.5 px-3 rounded-md transition-colors ${category === cat.slug ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-heading font-semibold text-sm mb-3 text-foreground">Price Range</h3>
            <Slider
              min={0} max={500} step={10}
              value={priceRange}
              onValueChange={setPriceRange}
              className="mb-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>${priceRange[0]}</span>
              <span>${priceRange[1]}</span>
            </div>
          </div>
          {(search || category || priceRange[0] > 0 || priceRange[1] < 500) && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-accent">
              <X className="w-3 h-3 mr-1" /> Clear Filters
            </Button>
          )}
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground font-heading text-lg">No products found.</p>
              <Button variant="link" onClick={clearFilters} className="text-accent mt-2">Clear filters</Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filtered.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
