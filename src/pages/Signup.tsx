import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const Signup = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }
    if (form.password !== form.confirm) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    toast({ title: "Account created!", description: "Signup functionality coming soon." });
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md p-8">
        <h1 className="font-heading text-3xl font-bold text-foreground text-center mb-2">Create Account</h1>
        <p className="text-muted-foreground text-center mb-8">Join ÉLEVE today</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input placeholder="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="bg-card h-12" />
          <Input type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="bg-card h-12" />
          <Input type="password" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="bg-card h-12" />
          <Input type="password" placeholder="Confirm Password" value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} className="bg-card h-12" />
          <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-heading font-semibold h-12 rounded-sm">
            Create Account
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-accent hover:underline font-medium">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;
