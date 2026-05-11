import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, MapPin, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }
    toast({ title: "Message sent!", description: "We'll get back to you shortly." });
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div className="container py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
        <h1 className="font-heading text-4xl font-bold text-foreground mb-3">Get in Touch</h1>
        <p className="text-muted-foreground max-w-md mx-auto">We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
        <motion.form initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} onSubmit={handleSubmit} className="space-y-5">
          <Input placeholder="Your Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="bg-card h-12" />
          <Input type="email" placeholder="Email Address" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="bg-card h-12" />
          <Textarea placeholder="Your Message" rows={6} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} className="bg-card resize-none" />
          <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground font-heading font-semibold h-12 px-8 rounded-sm">
            Send Message
          </Button>
        </motion.form>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="space-y-8">
          <div className="space-y-6">
            {[
              { icon: MapPin, label: "Address", value: "123 Fashion Ave, Abbottabad, NY 10001" },
              { icon: Mail, label: "Email", value: "fairsto9@gmail.com" },
              { icon: Phone, label: "Phone", value: "+92 (555) 123-4567" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <p className="font-heading font-semibold text-sm text-foreground">{label}</p>
                  <p className="text-sm text-muted-foreground">{value}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-lg overflow-hidden h-48 bg-muted">
            {/* <iframe
              title="Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.2!2d-73.99!3d40.75!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDDCsDQ1JzAwLjAiTiA3M8KwNTknMjQuMCJX!5e0!3m2!1sen!2sus!4v1"
              width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy"
            /> */}
            <iframe
              title="Location"
              src="https://www.google.com/maps/place/Abbottabad,+Pakistan/@34.1750811,73.235939,13z/data=!3m1!4b1!4m6!3m5!1s0x38de3111557ac517:0x6e59a635b12e952c!8m2!3d34.1687502!4d73.2214982!16zL20vMDExaHMx?entry=ttu&g_ep=EgoyMDI2MDUwNi4wIKXMDSoASAFQAw%3D%3D"
            />
            
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;
