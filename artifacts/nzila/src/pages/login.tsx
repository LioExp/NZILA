import { motion } from "framer-motion";
import { useAuth } from "@workspace/replit-auth-web";

export default function Login() {
  const { login } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden px-4">
      {/* Background glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col items-center text-center max-w-md w-full z-10 gap-6"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-28 h-28"
        >
          <img src="/nzila-logo.png" alt="Nzila" className="w-full h-full object-contain drop-shadow-2xl" />
        </motion.div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-5xl font-display font-bold text-white tracking-tight">
            Nzila
          </h1>
          <p className="text-lg text-primary font-medium">Assistente Angolano com IA</p>
        </div>

        {/* Description */}
        <p className="text-muted-foreground text-base leading-relaxed">
          O primeiro assistente de IA com alma angolana. Fala as nossas gírias, 
          conhece a nossa cultura e está aqui para ajudar.
        </p>

        {/* Features */}
        <div className="grid grid-cols-3 gap-3 w-full my-2">
          {[
            { emoji: "🗣️", label: "Gírias Angolanas" },
            { emoji: "🌍", label: "Cultura Local" },
            { emoji: "🤝", label: "Comunidade" },
          ].map((f) => (
            <div key={f.label} className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col items-center gap-1.5">
              <span className="text-2xl">{f.emoji}</span>
              <span className="text-[11px] text-muted-foreground font-medium text-center">{f.label}</span>
            </div>
          ))}
        </div>

        {/* Login Button */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={login}
          className="w-full py-4 rounded-2xl bg-primary text-white font-bold text-lg shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all duration-300 flex items-center justify-center gap-3"
        >
          <span>Entrar no Nzila</span>
          <span className="text-xl">🇦🇴</span>
        </motion.button>

        <p className="text-[11px] text-muted-foreground/60">
          Ao entrar, concordas com os nossos termos de uso.
        </p>
      </motion.div>
    </div>
  );
}
