import { motion } from "framer-motion";

const About = () => (
  <div>
    <section className="relative py-24" style={{ background: "var(--hero-gradient)" }}>
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
          <h1 className="font-heading text-5xl font-bold mb-6" style={{ color: "hsl(45 20% 97%)" }}>Our Story</h1>
          <p className="text-lg leading-relaxed" style={{ color: "hsl(45 20% 85%)" }}>
            Founded in 2020, ÉLEVE was born from a simple belief: fashion should be timeless, sustainable, and accessible.
          </p>
        </motion.div>
      </div>
    </section>

    <section className="container py-20">
      <div className="grid md:grid-cols-2 gap-16 items-center">
        <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
          <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=700&fit=crop" alt="Our atelier" className="rounded-lg w-full" />
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-6">
          <h2 className="font-heading text-3xl font-bold text-foreground">Crafted with Purpose</h2>
          <p className="text-muted-foreground leading-relaxed">
            Every piece in our collection is designed with intention. We partner with skilled artisans and sustainable suppliers to bring you fashion that doesn't compromise on quality or ethics.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            From the finest Italian fabrics to ethically sourced gemstones, every material is carefully chosen to ensure lasting beauty and minimal environmental impact.
          </p>
        </motion.div>
      </div>
    </section>

    <section className="bg-card py-20">
      <div className="container text-center">
        <h2 className="font-heading text-3xl font-bold text-foreground mb-12">Our Values</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { title: "Sustainability", desc: "We use eco-friendly materials and ethical manufacturing practices." },
            { title: "Quality", desc: "Each piece undergoes rigorous quality checks to ensure lasting craftsmanship." },
            { title: "Inclusivity", desc: "Fashion for everyone. Our collections celebrate diversity in all its forms." },
          ].map((v, i) => (
            <motion.div key={v.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="p-8 rounded-lg bg-background">
              <h3 className="font-heading text-xl font-bold text-foreground mb-3">{v.title}</h3>
              <p className="text-muted-foreground">{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  </div>
);

export default About;
