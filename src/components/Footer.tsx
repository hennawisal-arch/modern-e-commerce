import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="bg-primary text-primary-foreground mt-20">
    <div className="container py-16">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <h3 className="font-heading text-lg font-bold tracking-tight mb-4">ÉLEVE</h3>
          <p className="text-sm opacity-70 leading-relaxed">Curated fashion for the modern individual. Timeless pieces, exceptional quality.</p>
        </div>
        <div>
          <h4 className="font-heading text-sm font-semibold mb-4 tracking-wide">Shop</h4>
          <div className="flex flex-col gap-2.5">
            {["Men", "Women", "Kids", "Jewelry"].map(cat => (
              <Link key={cat} to="/products" className="text-sm opacity-70 hover:opacity-100 transition-opacity">{cat}</Link>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-heading text-sm font-semibold mb-4 tracking-wide">Company</h4>
          <div className="flex flex-col gap-2.5">
            <Link to="/about" className="text-sm opacity-70 hover:opacity-100 transition-opacity">About</Link>
            <Link to="/contact" className="text-sm opacity-70 hover:opacity-100 transition-opacity">Contact</Link>
            <span className="text-sm opacity-70">Careers</span>
            <span className="text-sm opacity-70">Press</span>
          </div>
        </div>
        <div>
          <h4 className="font-heading text-sm font-semibold mb-4 tracking-wide">Support</h4>
          <div className="flex flex-col gap-2.5">
            <span className="text-sm opacity-70">Shipping & Returns</span>
            <span className="text-sm opacity-70">FAQ</span>
            <span className="text-sm opacity-70">Size Guide</span>
            <span className="text-sm opacity-70">Privacy Policy</span>
          </div>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10 mt-12 pt-8 text-center">
        <p className="text-xs opacity-50">© 2026 ÉLEVE. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
