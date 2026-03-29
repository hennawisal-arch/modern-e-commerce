import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }
    toast({ title: "Welcome back!", description: "Login functionality coming soon." });
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md p-8">
        <h1 className="font-heading text-3xl font-bold text-foreground text-center mb-2">Welcome Back</h1>
        <p className="text-muted-foreground text-center mb-8">Sign in to your account</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="bg-card h-12" />
          <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="bg-card h-12" />
          <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-heading font-semibold h-12 rounded-sm">
            Sign In
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Don't have an account?{" "}
          <Link to="/signup" className="text-accent hover:underline font-medium">Sign up</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
