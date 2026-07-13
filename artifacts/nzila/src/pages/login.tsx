import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, User, Mail, Lock, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

function getAccounts(): Record<string, unknown> {
  try {
    const raw = localStorage.getItem("nzila_accounts");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export default function Login() {
  const { login } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const emailNormalized = email.trim().toLowerCase();
  const isReturningUser = emailNormalized.length > 3 && emailNormalized.includes("@") && !!getAccounts()[emailNormalized];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isReturningUser && !firstName.trim()) {
      setError("Introduz o teu nome.");
      return;
    }
    if (!emailNormalized || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalized)) {
      setError("Introduz um endereço de email válido.");
      return;
    }
    if (!password || password.length < 4) {
      setError("A senha deve ter pelo menos 4 caracteres.");
      return;
    }

    const err = login(firstName, emailNormalized, password);
    if (err) setError(err);
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
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 mb-5">
            <img src="/nzila-logo.png" alt="Nzila" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground" style={{ letterSpacing: "-0.03em" }}>
            {isReturningUser ? "Bem-vindo de volta" : "Entrar no Nzila"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5 text-center">
            {isReturningUser ? "Introduz a tua senha para continuar." : "O assistente de IA com alma angolana"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 pointer-events-none" />
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              placeholder="O teu email"
              autoComplete="email"
              className="w-full bg-card border border-border/70 focus:border-primary/50 focus:ring-4 focus:ring-primary/8 rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all"
            />
          </div>

          <AnimatePresence>
            {!isReturningUser && (
              <motion.div
                key="name"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
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
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 pointer-events-none" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              placeholder="Senha"
              autoComplete={isReturningUser ? "current-password" : "new-password"}
              className="w-full bg-card border border-border/70 focus:border-primary/50 focus:ring-4 focus:ring-primary/8 rounded-xl pl-10 pr-11 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 text-destructive text-xs px-1"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            className="w-full py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 mt-1"
          >
            {isReturningUser ? "Entrar" : "Criar conta"}
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </form>

        <p className="text-center text-[11px] text-muted-foreground/40 mt-5">
          {isReturningUser
            ? "Não és tu? Usa um email diferente."
            : "Ao criar conta, concordas com os nossos termos de uso."}
        </p>
      </motion.div>
    </div>
  );
}
