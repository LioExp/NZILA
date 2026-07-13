import { motion } from "framer-motion";
import { useAuth } from "@workspace/replit-auth-web";
import { MessageCircle, Globe, Users, ArrowRight } from "lucide-react";

const features = [
  { icon: MessageCircle, label: "Gírias Angolanas" },
  { icon: Globe, label: "Cultura Local" },
  { icon: Users, label: "Comunidade" },
];

export default function Login() {
  const { login } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden px-4">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-secondary/8 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center text-center max-w-sm w-full z-10 gap-7"
      >
        <div className="w-24 h-24">
          <img src="/nzila-logo.png" alt="Nzila" className="w-full h-full object-contain drop-shadow-2xl" />
        </div>

        <div className="space-y-1.5">
          <h1 className="text-4xl font-semibold text-white tracking-tight" style={{ letterSpacing: "-0.03em" }}>
            Nzila
          </h1>
          <p className="text-sm font-medium text-primary tracking-wide uppercase">
            Assistente Angolano com IA
          </p>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">
          O primeiro assistente de IA com alma angolana. Fala as nossas
          gírias, conhece a nossa cultura e está aqui para ajudar.
        </p>

        <div className="grid grid-cols-3 gap-2.5 w-full">
          {features.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="bg-card border border-border/60 rounded-xl p-3.5 flex flex-col items-center gap-2"
            >
              <Icon className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
              <span className="text-[11px] text-muted-foreground font-medium leading-tight text-center">
                {label}
              </span>
            </div>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={login}
          className="w-full py-3.5 rounded-xl bg-primary text-white font-semibold text-sm shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-200 flex items-center justify-center gap-2"
        >
          Entrar no Nzila
          <ArrowRight className="w-4 h-4" />
        </motion.button>

        <p className="text-[11px] text-muted-foreground/50">
          Ao entrar, concordas com os nossos termos de uso.
        </p>
      </motion.div>
    </div>
  );
}
