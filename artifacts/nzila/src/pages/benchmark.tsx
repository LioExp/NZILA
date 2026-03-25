import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { ShieldCheck, Zap, Brain } from "lucide-react";
import { motion } from "framer-motion";

const data = [
  { name: 'Gírias Angolanas', Nzila: 95, ChatGPT: 35, Gemini: 40 },
  { name: 'Contexto Cultural', Nzila: 92, ChatGPT: 45, Gemini: 50 },
  { name: 'Expressões Locais', Nzila: 88, ChatGPT: 30, Gemini: 35 },
  { name: 'Calão Juvenil', Nzila: 85, ChatGPT: 20, Gemini: 25 },
];

const features = [
  {
    icon: ShieldCheck,
    title: "Precisão Cultural",
    desc: "Treinado especificamente com dados locais para evitar alucinações sobre cultura angolana."
  },
  {
    icon: Zap,
    title: "Atualização Constante",
    desc: "A comunidade contribui diariamente com novas expressões em tempo real."
  },
  {
    icon: Brain,
    title: "IA Especializada",
    desc: "Não apenas traduz, mas entende o duplo sentido e o peso cultural das palavras."
  }
];

export default function Benchmark() {
  return (
    <div className="h-full overflow-y-auto p-6 md:p-10 relative">
      {/* Background glow */}
      <div className="absolute top-[20%] left-[50%] -translate-x-1/2 w-[80%] h-[50%] bg-primary/5 rounded-[100%] blur-[120px] -z-10" />

      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-16 space-y-4">
          <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground">
            O Padrão <span className="text-primary">Ouro</span> Local
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Descobre porquê o Nzila supera os modelos globais no entendimento da nossa cultura e linguagem.
          </p>
        </header>

        {/* Chart Section */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-2xl mb-16"
        >
          <div className="mb-8">
            <h2 className="text-2xl font-display font-bold">Compreensão de Linguagem Local (%)</h2>
            <p className="text-muted-foreground">Teste realizado com 500 prompts baseados em dialectos e gírias de Angola.</p>
          </div>
          
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#888888" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#888888" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(value) => `${value}%`} 
                />
                <RechartsTooltip 
                  cursor={{fill: '#ffffff05'}}
                  contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="Nzila" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} barSize={40} />
                <Bar dataKey="ChatGPT" fill="#4B5563" radius={[6, 6, 0, 0]} barSize={40} />
                <Bar dataKey="Gemini" fill="#6B7280" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {features.map((feat, idx) => (
            <motion.div 
              key={feat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-card/50 border border-border/50 p-6 rounded-2xl text-center"
            >
              <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-secondary glow-yellow">
                <feat.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">{feat.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="text-center pb-20">
          <h2 className="text-2xl font-display font-bold italic text-foreground/80">
            "Nzila: um caminho construído por todos nós."
          </h2>
        </div>
      </div>
    </div>
  );
}
