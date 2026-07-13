import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Globe } from "lucide-react";

interface OnboardingModalProps {
  userName: string | null;
  onComplete: (data: { isAngolan: boolean; country: string }) => void;
}

const AFRICAN_COUNTRIES = [
  "Angola", "Moçambique", "Cabo Verde", "São Tomé e Príncipe",
  "Guiné-Bissau", "Brasil", "Portugal", "África do Sul",
  "Congo (RDC)", "Namíbia", "Zâmbia", "Zimbabwe",
];

const OTHER_COUNTRIES = [
  "França", "Estados Unidos", "Reino Unido", "Alemanha",
  "Espanha", "Itália", "Canadá", "Austrália", "Outros",
];

export function OnboardingModal({ userName, onComplete }: OnboardingModalProps) {
  const [step, setStep] = useState<"question" | "country">("question");
  const [selectedCountry, setSelectedCountry] = useState("");

  const firstName = userName?.split(" ")[0] ?? "kamba";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-card border border-border/60 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 pt-8 pb-4 text-center">
          <div className="w-16 h-16 mx-auto mb-4">
            <img src="/nzila-logo.png" alt="Nzila" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-2xl font-display font-bold text-white mb-2">
            Olá, {firstName}! 👋
          </h2>
          <p className="text-muted-foreground text-sm">
            Para personalizar a tua experiência, precisamos de te conhecer melhor.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === "question" && (
            <motion.div
              key="question"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="px-6 pb-8"
            >
              <p className="text-center text-white font-semibold text-lg mb-6">
                És angolano(a)?
              </p>

              <div className="flex flex-col gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onComplete({ isAngolan: true, country: "Angola" })}
                  className="w-full py-4 rounded-2xl bg-primary text-white font-bold text-base flex items-center justify-center gap-3 shadow-lg shadow-primary/25"
                >
                  <span className="text-2xl">🇦🇴</span>
                  Sim, sou angolano(a)!
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setStep("country")}
                  className="w-full py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium text-base flex items-center justify-center gap-3 transition-colors"
                >
                  <Globe className="w-5 h-5 text-muted-foreground" />
                  Não, sou de outro país
                  <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
                </motion.button>
              </div>
            </motion.div>
          )}

          {step === "country" && (
            <motion.div
              key="country"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="px-6 pb-8"
            >
              <p className="text-center text-white font-semibold text-base mb-4">
                De onde és?
              </p>

              <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 mb-4 custom-scrollbar">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground/60 px-1 mb-2">África e PALOP</p>
                {AFRICAN_COUNTRIES.map((country) => (
                  <button
                    key={country}
                    onClick={() => setSelectedCountry(country)}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      selectedCountry === country
                        ? "bg-primary text-white"
                        : "bg-white/5 hover:bg-white/10 text-foreground border border-white/5"
                    }`}
                  >
                    {country}
                  </button>
                ))}
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground/60 px-1 mt-3 mb-2">Outros</p>
                {OTHER_COUNTRIES.map((country) => (
                  <button
                    key={country}
                    onClick={() => setSelectedCountry(country)}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      selectedCountry === country
                        ? "bg-primary text-white"
                        : "bg-white/5 hover:bg-white/10 text-foreground border border-white/5"
                    }`}
                  >
                    {country}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep("question")}
                  className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-muted-foreground text-sm font-medium hover:bg-white/10 transition-colors"
                >
                  Voltar
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (selectedCountry) {
                      onComplete({ isAngolan: false, country: selectedCountry });
                    }
                  }}
                  disabled={!selectedCountry}
                  className="flex-1 py-3 rounded-xl bg-primary text-white text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Confirmar
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
