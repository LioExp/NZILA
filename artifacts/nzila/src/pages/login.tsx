import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, User, Mail, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function Login() {
  const { login } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!firstName.trim()) {
      setError("Introduz o teu nome.");
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Introduz um endereço de email válido.");
      return;
    }

    login(firstName, email);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden px-4">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[350px] bg-primary/8 rounded-full blur-[140px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm z-10"
      >
        {/* Logo + Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 mb-5">
            <img src="/nzila-logo.png" alt="Nzila" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground" style={{ letterSpacing: "-0.03em" }}>
            Entrar no Nzila
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5 text-center">
            O assistente de IA com alma angolana
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 pointer-events-none" />
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="O teu nome"
              autoComplete="given-name"
              className="w-full bg-card border border-border/70 focus:border-primary/50 focus:ring-4 focus:ring-primary/8 rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all"
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 pointer-events-none" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="O teu email"
              autoComplete="email"
              className="w-full bg-card border border-border/70 focus:border-primary/50 focus:ring-4 focus:ring-primary/8 rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-destructive text-xs px-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {error}
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            className="w-full py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 mt-1"
          >
            Entrar
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </form>

        <p className="text-center text-[11px] text-muted-foreground/40 mt-5">
          Ao entrar, concordas com os nossos termos de uso.
        </p>
      </motion.div>
    </div>
  );
}
