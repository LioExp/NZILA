import { useAuth } from "@workspace/replit-auth-web";
import { useProfile } from "@/contexts/profile-context";
import { useGetUserRanking, useCreateContribution } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Award, ShieldAlert, Send, Info, CheckCircle2, Lock, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";

const formSchema = z.object({
  term: z.string().min(2, "O termo deve ter pelo menos 2 caracteres"),
  definition: z.string().min(5, "A definição deve ter pelo menos 5 caracteres"),
  example: z.string().min(10, "Dá um exemplo prático com pelo menos 10 caracteres"),
});

type FormValues = z.infer<typeof formSchema>;

function AccessDenied() {
  return (
    <div className="h-full overflow-y-auto p-6 md:p-10 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-md text-center space-y-5"
      >
        <div className="w-14 h-14 rounded-2xl bg-muted/50 border border-border/60 flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6 text-muted-foreground" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground" style={{ letterSpacing: "-0.02em" }}>
            Funcionalidade exclusiva
          </h2>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            Contribuir para o dicionário de gírias é um privilégio reservado
            à comunidade angolana. Estrangeiros podem explorar e aprender com
            o nosso dicionário, mas a produção de conhecimento pertence a Angola.
          </p>
        </div>
        <div className="bg-card border border-border/60 rounded-xl p-4 text-sm text-left space-y-2.5">
          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-foreground text-[13px]">Para angolanos</p>
              <p className="text-muted-foreground text-xs mt-0.5">
                Contribui, revê e enriquece o benchmark de gírias angolanas.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Info className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-foreground text-[13px]">Para todos</p>
              <p className="text-muted-foreground text-xs mt-0.5">
                Acesso ao dicionário, ao chat e ao benchmark comparativo.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function Contribuir() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const userId = user?.id ?? "anonymous";
  const { data: ranking, isLoading: rankingLoading } = useGetUserRanking(userId);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { term: "", definition: "", example: "" },
  });

  const createMutation = useCreateContribution({
    mutation: {
      onSuccess: () => {
        toast({ title: "Contribuição enviada", description: "Obrigado por enriquecer o Nzila." });
        form.reset();
        queryClient.invalidateQueries({ queryKey: [`/api/ranking/${userId}`] });
        queryClient.invalidateQueries({ queryKey: [`/api/contributions`] });
      },
      onError: (err) => {
        toast({
          title: "Erro ao enviar",
          description: err.error?.error ?? "Ocorreu um erro inesperado.",
          variant: "destructive",
        });
      },
    },
  });

  const onSubmit = (data: FormValues) => {
    createMutation.mutate({ data: { userId, ...data } });
  };

  if (profile && profile.isAngolan === false) {
    return <AccessDenied />;
  }

  const isBlocked = ranking?.isBlocked || ranking?.level === "Horrível";

  const levelStyle = (level?: string) => {
    switch (level) {
      case "Confiável": return "text-emerald-400 bg-emerald-400/8 border-emerald-400/20";
      case "Moderado": return "text-amber-400 bg-amber-400/8 border-amber-400/20";
      case "Horrível": return "text-red-400 bg-red-400/8 border-red-400/20";
      default: return "text-muted-foreground bg-muted/50 border-border/60";
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-semibold text-foreground" style={{ letterSpacing: "-0.03em" }}>
            Contribuir para o Dicionário
          </h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-xl">
            Ajuda o Nzila a crescer adicionando expressões da nossa cultura.
            As tuas contribuições enriquecem o dataset para toda a comunidade.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stats */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-card border border-border/60 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <Award className="w-4 h-4 text-primary" />
                O Teu Perfil
              </h3>

              {rankingLoading ? (
                <div className="space-y-3 animate-pulse">
                  <div className="h-7 bg-muted/50 rounded-lg" />
                  <div className="h-4 bg-muted/30 rounded w-1/2" />
                </div>
              ) : ranking ? (
                <div className="space-y-5">
                  <div>
                    <p className="text-[11px] text-muted-foreground mb-1.5">Nível de Confiança</p>
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold ${levelStyle(ranking.level)}`}>
                      {ranking.level === "Confiável" && <CheckCircle2 className="w-3 h-3" />}
                      {ranking.level === "Horrível" && <ShieldAlert className="w-3 h-3" />}
                      {ranking.level}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-muted/30 rounded-lg p-3 border border-border/40">
                      <p className="text-xl font-bold text-foreground">{ranking.approvedContributions}</p>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">Aprovadas</p>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-3 border border-border/40">
                      <p className="text-xl font-bold text-foreground">{ranking.totalContributions}</p>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">Total</p>
                    </div>
                  </div>
                  {isBlocked && (
                    <div className="bg-destructive/8 border border-destructive/20 text-destructive p-3 rounded-lg text-xs flex items-start gap-2">
                      <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <p>A tua conta está temporariamente bloqueada por submissões inválidas frequentes.</p>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            <div className="bg-muted/20 border border-border/40 rounded-xl p-4 text-xs text-muted-foreground space-y-2">
              <p className="font-semibold text-foreground text-[13px] flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" /> Dicas
              </p>
              <ul className="list-disc pl-4 space-y-1.5 leading-relaxed">
                <li>Certifica-te que a gíria é de uso real.</li>
                <li>Explica de forma clara e objectiva.</li>
                <li>Dá um exemplo de conversa real.</li>
              </ul>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border/60 rounded-xl p-6 relative overflow-hidden"
            >
              {isBlocked && (
                <div className="absolute inset-0 bg-background/60 backdrop-blur-sm z-10 flex items-center justify-center p-6">
                  <div className="bg-card border border-destructive/30 p-6 rounded-xl text-center max-w-xs">
                    <ShieldAlert className="w-10 h-10 text-destructive mx-auto mb-3" />
                    <h3 className="text-base font-semibold mb-1">Envio Bloqueado</h3>
                    <p className="text-xs text-muted-foreground">O teu nível actual não permite novas contribuições.</p>
                  </div>
                </div>
              )}

              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Termo / Gíria</label>
                  <input
                    {...form.register("term")}
                    placeholder="Ex: Cassule, Mambo, Kuia..."
                    className="w-full bg-background border border-border focus:border-primary/50 focus:ring-4 focus:ring-primary/8 rounded-lg px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all"
                  />
                  {form.formState.errors.term && (
                    <p className="text-destructive text-xs">{form.formState.errors.term.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Significado</label>
                  <textarea
                    {...form.register("definition")}
                    placeholder="O que significa esta expressão?"
                    rows={3}
                    className="w-full bg-background border border-border focus:border-primary/50 focus:ring-4 focus:ring-primary/8 rounded-lg px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 resize-none transition-all"
                  />
                  {form.formState.errors.definition && (
                    <p className="text-destructive text-xs">{form.formState.errors.definition.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Exemplo de Uso</label>
                  <textarea
                    {...form.register("example")}
                    placeholder="Numa frase: O meu cassule foi à loja."
                    rows={2}
                    className="w-full bg-background border border-border focus:border-primary/50 focus:ring-4 focus:ring-primary/8 rounded-lg px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 resize-none transition-all"
                  />
                  {form.formState.errors.example && (
                    <p className="text-destructive text-xs">{form.formState.errors.example.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={createMutation.isPending || isBlocked}
                  className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white text-sm font-semibold py-3 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {createMutation.isPending ? (
                    "A enviar..."
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Enviar para Revisão
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
