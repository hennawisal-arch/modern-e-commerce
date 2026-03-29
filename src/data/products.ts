export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  images: string[];
  category: string;
  rating: number;
  reviews: number;
  description: string;
  sizes?: string[];
  colors?: string[];
  isNew?: boolean;
  isTrending?: boolean;
}

export const categories = [
  { name: "Men", slug: "men", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop" },
  { name: "Women", slug: "women", image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=500&fit=crop" },
  { name: "Kids", slug: "kids", image: "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=400&h=500&fit=crop" },
  { name: "Jewelry", slug: "jewelry", image: "https://images.unsplash.com/photo-1515562141589-67f0d937c7a7?w=400&h=500&fit=crop" },
];

export const products: Product[] = [
  {
    id: 1, name: "Tailored Wool Blazer", price: 289, originalPrice: 350, category: "men",
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=750&fit=crop",
    images: ["https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&h=1000&fit=crop", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1000&fit=crop"],
    rating: 4.8, reviews: 124, description: "A masterfully crafted wool blazer with a modern slim fit. Perfect for both business and evening occasions.", sizes: ["S", "M", "L", "XL"], colors: ["Charcoal", "Navy", "Black"], isNew: true,
  },
  {
    id: 2, name: "Silk Midi Dress", price: 195, category: "women",
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=750&fit=crop",
    images: ["https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&h=1000&fit=crop"],
    rating: 4.9, reviews: 89, description: "Elegant silk midi dress with a flattering drape. A timeless piece for any wardrobe.", sizes: ["XS", "S", "M", "L"], colors: ["Ivory", "Blush", "Black"], isTrending: true,
  },
  {
    id: 3, name: "Cashmere Crew Sweater", price: 165, originalPrice: 210, category: "men",
    image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&h=750&fit=crop",
    images: ["https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&h=1000&fit=crop"],
    rating: 4.7, reviews: 203, description: "Pure cashmere crew neck sweater. Unmatched softness and warmth for the discerning gentleman.", sizes: ["S", "M", "L", "XL", "XXL"], colors: ["Camel", "Grey", "Navy"],
  },
  {
    id: 4, name: "Gold Chain Necklace", price: 89, category: "jewelry",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=750&fit=crop",
    images: ["https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&h=1000&fit=crop"],
    rating: 4.6, reviews: 67, description: "Delicate gold-plated chain necklace. Minimalist design that pairs perfectly with any outfit.", isTrending: true,
  },
  {
    id: 5, name: "Kids Denim Jacket", price: 65, originalPrice: 85, category: "kids",
    image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=600&h=750&fit=crop",
    images: ["https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=800&h=1000&fit=crop"],
    rating: 4.5, reviews: 45, description: "Classic denim jacket sized for little adventurers. Durable and stylish.", sizes: ["3-4Y", "5-6Y", "7-8Y", "9-10Y"], colors: ["Classic Blue", "Light Wash"], isNew: true,
  },
  {
    id: 6, name: "Linen Wide-Leg Pants", price: 120, category: "women",
    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&h=750&fit=crop",
    images: ["https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&h=1000&fit=crop"],
    rating: 4.4, reviews: 156, description: "Breezy linen pants with a relaxed wide-leg silhouette. Effortlessly chic for warm days.", sizes: ["XS", "S", "M", "L", "XL"], colors: ["Sand", "White", "Olive"],
  },
  {
    id: 7, name: "Diamond Stud Earrings", price: 245, category: "jewelry",
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&h=750&fit=crop",
    images: ["https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&h=1000&fit=crop"],
    rating: 4.9, reviews: 312, description: "Classic diamond stud earrings set in sterling silver. Timeless elegance for every day.", isNew: true,
  },
  {
    id: 8, name: "Cotton Oxford Shirt", price: 85, category: "men",
    image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&h=750&fit=crop",
    images: ["https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&h=1000&fit=crop"],
    rating: 4.6, reviews: 278, description: "Premium cotton Oxford shirt with a refined button-down collar. A wardrobe essential.", sizes: ["S", "M", "L", "XL"], colors: ["White", "Light Blue", "Pink"],
  },
  {
    id: 9, name: "Floral Maxi Skirt", price: 110, originalPrice: 140, category: "women",
    image: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=600&h=750&fit=crop",
    images: ["https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800&h=1000&fit=crop"],
    rating: 4.3, reviews: 92, description: "Flowing floral maxi skirt in a beautiful print. Romantic and feminine for any occasion.", sizes: ["XS", "S", "M", "L"], colors: ["Floral Blue", "Floral Pink"], isTrending: true,
  },
  {
    id: 10, name: "Kids Graphic Tee", price: 28, category: "kids",
    image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=600&h=750&fit=crop",
    images: ["https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=800&h=1000&fit=crop"],
    rating: 4.7, reviews: 189, description: "Fun graphic tee made from 100% organic cotton. Soft, durable, and playful.", sizes: ["3-4Y", "5-6Y", "7-8Y", "9-10Y", "11-12Y"], colors: ["White", "Navy", "Red"],
  },
  {
    id: 11, name: "Leather Chelsea Boots", price: 220, category: "men",
    image: "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=600&h=750&fit=crop",
    images: ["https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=800&h=1000&fit=crop"],
    rating: 4.8, reviews: 167, description: "Handcrafted leather Chelsea boots with a sleek profile. Built for style and durability.", sizes: ["40", "41", "42", "43", "44", "45"], colors: ["Black", "Brown"], isTrending: true,
  },
  {
    id: 12, name: "Pearl Drop Earrings", price: 135, category: "jewelry",
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&h=750&fit=crop",
    images: ["https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&h=1000&fit=crop"],
    rating: 4.5, reviews: 78, description: "Elegant freshwater pearl drop earrings. Sophisticated and versatile.", isNew: true,
  },
];
