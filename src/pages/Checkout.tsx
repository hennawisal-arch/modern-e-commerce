import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/hooks/use-toast";
import { ShoppingBag, Banknote } from "lucide-react";

const shippingSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  phone: z.string().trim().min(5, "Phone is required").max(30),
  address: z.string().trim().min(1, "Address is required").max(200),
  city: z.string().trim().min(1, "City is required").max(100),
  state: z.string().trim().min(1, "State / region is required").max(100),
  postalCode: z.string().trim().min(1, "Postal code is required").max(20),
  country: z.string().trim().min(1, "Country is required").max(100),
});

type ShippingForm = z.infer<typeof shippingSchema>;
type FieldErrors = Partial<Record<keyof ShippingForm, string>>;

const initialForm: ShippingForm = {
  fullName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
};

const Checkout = () => {
  const { items, clearCart, totalPrice } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<ShippingForm>(initialForm);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [placing, setPlacing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cod">("cod");

  // Prefill from saved profile shipping address
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("shipping_address")
        .eq("id", user.id)
        .maybeSingle();
      const saved = (data as any)?.shipping_address as Partial<ShippingForm> | null;
      if (saved && typeof saved === "object") {
        setForm(prev => ({ ...prev, ...saved, email: saved.email ?? user.email ?? prev.email }));
      } else if (user.email) {
        setForm(prev => ({ ...prev, email: prev.email || user.email! }));
      }
    })();
  }, [user]);

  const shipping = totalPrice >= 150 ? 0 : 9.99;
  const grandTotal = totalPrice + shipping;

  if (items.length === 0) {
    return (
      <div className="container py-20 text-center">
        <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground/30 mb-6" />
        <h1 className="font-heading text-3xl font-bold text-foreground mb-3">Your cart is empty</h1>
        <p className="text-muted-foreground mb-8">Add items to your cart before checking out.</p>
        <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground font-heading rounded-sm h-12 px-8">
          <Link to="/products">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  const onChange = (key: keyof ShippingForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [key]: e.target.value }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = shippingSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof ShippingForm;
        if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      toast({ title: "Please fix the errors in the form", variant: "destructive" });
      return;
    }

    if (!user) {
      toast({ title: "Please sign in to checkout" });
      navigate("/login");
      return;
    }

    setPlacing(true);
    const { data, error } = await supabase.functions.invoke("create-order", {
      body: {
        items: items.map(i => ({
          product_id: i.product.id,
          quantity: i.quantity,
          size: i.size ?? null,
          color: i.color ?? null,
        })),
        shipping: parsed.data,
      },
    });
    setPlacing(false);

    if (error || (data as any)?.error) {
      toast({
        title: "Checkout failed",
        description: error?.message ?? (data as any)?.error,
        variant: "destructive",
      });
      return;
    }

    await clearCart();
    const orderId = (data as any)?.order_id;
    toast({ title: "Order placed!", description: `Total $${Number((data as any).total).toFixed(2)}` });
    navigate(orderId ? `/orders/${orderId}` : "/account");
  };

  const fields: Array<{ key: keyof ShippingForm; label: string; type?: string; full?: boolean; autoComplete?: string }> = [
    { key: "fullName", label: "Full Name", full: true, autoComplete: "name" },
    { key: "email", label: "Email", type: "email", autoComplete: "email" },
    { key: "phone", label: "Phone", type: "tel", autoComplete: "tel" },
    { key: "address", label: "Address", full: true, autoComplete: "street-address" },
    { key: "city", label: "City", autoComplete: "address-level2" },
    { key: "state", label: "State / Region", autoComplete: "address-level1" },
    { key: "postalCode", label: "Postal Code", autoComplete: "postal-code" },
    { key: "country", label: "Country", autoComplete: "country-name" },
  ];

  return (
    <div className="container py-10">
      <h1 className="font-heading text-4xl font-bold text-foreground mb-8">Checkout</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-card rounded-lg p-6 space-y-6">
          <h2 className="font-heading font-bold text-lg text-foreground">Shipping Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map(({ key, label, type, full, autoComplete }) => (
              <div key={key} className={full ? "sm:col-span-2" : ""}>
                <Label htmlFor={key} className="text-sm">{label}</Label>
                <Input
                  id={key}
                  type={type ?? "text"}
                  autoComplete={autoComplete}
                  value={form[key]}
                  onChange={onChange(key)}
                  aria-invalid={!!errors[key]}
                  className="mt-1"
                />
                {errors[key] && (
                  <p className="text-xs text-destructive mt-1">{errors[key]}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-lg p-6 h-fit space-y-4">
          <h2 className="font-heading font-bold text-lg text-foreground">Order Summary</h2>
          <div className="space-y-2 max-h-64 overflow-auto pr-1">
            {items.map(({ product, quantity, size, color }) => (
              <div key={product.id} className="flex justify-between text-sm">
                <span className="text-foreground">
                  {product.name} × {quantity}
                  {(size || color) && (
                    <span className="block text-xs text-muted-foreground">
                      {[size, color].filter(Boolean).join(" / ")}
                    </span>
                  )}
                </span>
                <span className="font-medium text-foreground">${(product.price * quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-border pt-4 flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium text-foreground">${totalPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Shipping</span>
            <span className="font-medium text-foreground">{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
          </div>
          <div className="border-t border-border pt-4 flex justify-between">
            <span className="font-heading font-bold text-foreground">Total</span>
            <span className="font-heading font-bold text-foreground text-lg">${grandTotal.toFixed(2)}</span>
          </div>
          <Button
            type="submit"
            disabled={placing}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-heading font-semibold h-12 rounded-sm"
          >
            {placing ? "Placing order…" : "Pay & Place Order"}
          </Button>
          <Button asChild variant="ghost" className="w-full text-muted-foreground">
            <Link to="/cart">Back to Cart</Link>
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
