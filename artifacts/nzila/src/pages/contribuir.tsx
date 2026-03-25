import { useUserId } from "@/hooks/use-user";
import { useGetUserRanking, useCreateContribution } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Award, ShieldAlert, Send, Info, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";

const formSchema = z.object({
  term: z.string().min(2, "O termo deve ter pelo menos 2 caracteres"),
  definition: z.string().min(5, "A definição deve ter pelo menos 5 caracteres"),
  example: z.string().min(10, "Dá um exemplo prático (mínimo 10 caracteres)"),
});

type FormValues = z.infer<typeof formSchema>;

export default function Contribuir() {
  const userId = useUserId();
  const { data: ranking, isLoading: rankingLoading } = useGetUserRanking(userId);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      term: "",
      definition: "",
      example: "",
    },
  });

  const createMutation = useCreateContribution({
    mutation: {
      onSuccess: () => {
        toast({
          title: "Contribuição enviada!",
          description: "Obrigado por ajudares a enriquecer o Nzila.",
        });
        form.reset();
        // Invalidate ranking to maybe update stats
        queryClient.invalidateQueries({ queryKey: [`/api/ranking/${userId}`] });
        queryClient.invalidateQueries({ queryKey: [`/api/contributions`] });
      },
      onError: (err) => {
        toast({
          title: "Erro ao enviar",
          description: err.error?.error || "Ocorreu um erro inesperado.",
          variant: "destructive",
        });
      }
    }
  });

  const onSubmit = (data: FormValues) => {
    createMutation.mutate({
      data: {
        userId,
        ...data,
      }
    });
  };

  const isBlocked = ranking?.isBlocked || ranking?.level === 'Horrível';

  const getRankingColor = (level?: string) => {
    switch(level) {
      case 'Confiável': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'Moderado': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'Horrível': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-muted-foreground bg-muted border-border';
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
            Contribuir <span className="text-secondary">Conhecimento</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Ajuda o Nzila a ficar mais inteligente adicionando expressões da nossa banda.
            As tuas contribuições melhoram o dataset para todos.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Stats Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                O Teu Perfil
              </h3>
              
              {rankingLoading ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-8 bg-white/5 rounded-md" />
                  <div className="h-4 bg-white/5 rounded-md w-1/2" />
                </div>
              ) : ranking ? (
                <div className="space-y-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Nível de Confiança</p>
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-bold text-sm ${getRankingColor(ranking.level)}`}>
                      {ranking.level === 'Confiável' && <CheckCircle2 className="w-4 h-4" />}
                      {ranking.level === 'Horrível' && <ShieldAlert className="w-4 h-4" />}
                      {ranking.level}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-background rounded-xl p-3 border border-border/50">
                      <p className="text-2xl font-bold text-foreground">{ranking.approvedContributions}</p>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Aprovadas</p>
                    </div>
                    <div className="bg-background rounded-xl p-3 border border-border/50">
                      <p className="text-2xl font-bold text-foreground">{ranking.totalContributions}</p>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Total</p>
                    </div>
                  </div>

                  {isBlocked && (
                    <div className="bg-destructive/10 border border-destructive/20 text-destructive p-3 rounded-xl text-sm flex items-start gap-2">
                      <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                      <p>A tua conta está temporariamente bloqueada para novas contribuições devido a submissões inválidas frequentes.</p>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 text-sm text-muted-foreground space-y-3">
              <h4 className="font-bold text-foreground flex items-center gap-2">
                <Info className="w-4 h-4" /> Dicas
              </h4>
              <ul className="list-disc pl-4 space-y-2">
                <li>Certifica-te que a gíria existe mesmo e é usada.</li>
                <li>Explica de forma clara e objetiva.</li>
                <li>Dá um exemplo prático de uma conversa real.</li>
              </ul>
            </div>
          </div>

          {/* Form Panel */}
          <div className="lg:col-span-2">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-lg relative overflow-hidden"
            >
              {isBlocked && (
                <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center p-6 text-center">
                  <div className="bg-card border border-destructive p-6 rounded-2xl shadow-xl max-w-sm">
                    <ShieldAlert className="w-12 h-12 text-destructive mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">Envio Bloqueado</h3>
                    <p className="text-muted-foreground">O teu nível atual não permite novas contribuições.</p>
                  </div>
                </div>
              )}

              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">Termo / Gíria</label>
                  <input
                    {...form.register("term")}
                    placeholder="Ex: Cassule, Mambo, Kuia..."
                    className="w-full bg-background border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl px-4 py-3 text-foreground transition-all"
                  />
                  {form.formState.errors.term && (
                    <p className="text-destructive text-xs font-medium">{form.formState.errors.term.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">Significado / Definição</label>
                  <textarea
                    {...form.register("definition")}
                    placeholder="Explica o que significa..."
                    rows={3}
                    className="w-full bg-background border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl px-4 py-3 text-foreground resize-none transition-all"
                  />
                  {form.formState.errors.definition && (
                    <p className="text-destructive text-xs font-medium">{form.formState.errors.definition.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">Exemplo de Uso</label>
                  <textarea
                    {...form.register("example")}
                    placeholder="Numa frase: O meu cassule foi à loja."
                    rows={2}
                    className="w-full bg-background border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl px-4 py-3 text-foreground resize-none transition-all"
                  />
                  {form.formState.errors.example && (
                    <p className="text-destructive text-xs font-medium">{form.formState.errors.example.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={createMutation.isPending || isBlocked}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary hover:to-primary text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createMutation.isPending ? (
                    "A enviar..."
                  ) : (
                    <>
                      <Send className="w-5 h-5" /> Enviar para Revisão
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
