import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Globe, MapPin, Check, ArrowLeft } from "lucide-react";

interface OnboardingModalProps {
  userName: string | null;
  onComplete: (data: { isAngolan: boolean; country: string }) => void;
}

const COUNTRIES = [
  { group: "África e PALOP", items: ["Angola", "Moçambique", "Cabo Verde", "São Tomé e Príncipe", "Guiné-Bissau", "Brasil", "Portugal", "África do Sul", "Congo (RDC)", "Namíbia", "Zâmbia", "Zimbabwe"] },
  { group: "Europa e Américas", items: ["França", "Estados Unidos", "Reino Unido", "Alemanha", "Espanha", "Itália", "Canadá", "Austrália"] },
  { group: "Outro", items: ["Outro país"] },
];

export function OnboardingModal({ userName, onComplete }: OnboardingModalProps) {
  const [step, setStep] = useState<"question" | "country">("question");
  const [selectedCountry, setSelectedCountry] = useState("");

  const firstName = userName?.split(" ")[0] ?? "utilizador";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="bg-card border border-border/70 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 pt-7 pb-5 border-b border-border/50">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8">
              <img src="/nzila-logo.png" alt="Nzila" className="w-full h-full object-contain" />
            </div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nzila</span>
          </div>
          <h2 className="text-xl font-semibold text-white mt-3" style={{ letterSpacing: "-0.02em" }}>
            Bem-vindo, {firstName}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Uma pergunta rápida para personalizar a tua experiência.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === "question" && (
            <motion.div
              key="question"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2 }}
              className="p-6 space-y-3"
            >
              <p className="text-sm font-medium text-foreground mb-4">
                És angolano(a)?
              </p>

              <button
                onClick={() => onComplete({ isAngolan: true, country: "Angola" })}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-primary/10 hover:bg-primary/15 border border-primary/20 hover:border-primary/35 text-left transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">Sim, sou angolano(a)</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Acesso completo, incluindo contribuições</p>
                </div>
                <ChevronRight className="w-4 h-4 text-primary opacity-60 group-hover:opacity-100 transition-opacity" />
              </button>

              <button
                onClick={() => setStep("country")}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-white/4 hover:bg-white/7 border border-border hover:border-border/80 text-left transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">Não, sou de outro país</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Acesso de leitura e aprendizagem</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground opacity-60 group-hover:opacity-100 transition-opacity" />
              </button>
            </motion.div>
          )}

          {step === "country" && (
            <motion.div
              key="country"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2 }}
              className="p-6"
            >
              <p className="text-sm font-medium text-foreground mb-3">
                Seleciona o teu país
              </p>

              <div className="max-h-52 overflow-y-auto space-y-3 pr-1 mb-4 custom-scrollbar">
                {COUNTRIES.map(({ group, items }) => (
                  <div key={group}>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 px-1 mb-1.5">
                      {group}
                    </p>
                    <div className="space-y-1">
                      {items.map((country) => (
                        <button
                          key={country}
                          onClick={() => setSelectedCountry(country)}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                            selectedCountry === country
                              ? "bg-primary/12 text-white border border-primary/25"
                              : "text-muted-foreground hover:text-foreground hover:bg-white/5 border border-transparent"
                          }`}
                        >
                          {country}
                          {selectedCountry === country && (
                            <Check className="w-3.5 h-3.5 text-primary" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setStep("question")}
                  className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg bg-muted/50 text-muted-foreground text-sm font-medium hover:bg-muted transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Voltar
                </button>
                <button
                  onClick={() => selectedCountry && onComplete({ isAngolan: false, country: selectedCountry })}
                  disabled={!selectedCountry}
                  className="flex-1 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
                >
                  Confirmar
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
