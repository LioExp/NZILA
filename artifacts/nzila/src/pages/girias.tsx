import { useState } from "react";
import { useListGirias } from "@workspace/api-client-react";
import { Search, Book, Quote, MapPin } from "lucide-react";
import { motion } from "framer-motion";

export default function Girias() {
  const { data: girias, isLoading } = useListGirias();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredGirias = girias?.filter(g => 
    (search === "" || 
      g.term.toLowerCase().includes(search.toLowerCase()) || 
      g.definition.toLowerCase().includes(search.toLowerCase())
    ) &&
    (activeCategory === null || g.category === activeCategory)
  ) || [];

  const categories = Array.from(new Set(girias?.map(g => g.category) || []));

  return (
    <div className="h-full overflow-y-auto p-6 md:p-10 relative">
      <div className="absolute top-0 right-0 w-1/2 h-96 bg-primary/5 rounded-full blur-[150px] -z-10" />

      <div className="max-w-6xl mx-auto">
        <header className="mb-10 space-y-4">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground">
            Dicionário <span className="text-primary">Nzila</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Explora a nossa base de dados de gírias e expressões angolanas. 
            O conhecimento cultural que alimenta a nossa IA.
          </p>
        </header>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Pesquisar gíria ou significado..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-card border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl pl-12 pr-4 py-3.5 text-foreground placeholder:text-muted-foreground transition-all"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-5 py-3 rounded-xl whitespace-nowrap font-medium transition-all duration-200 ${
                activeCategory === null 
                  ? 'bg-foreground text-background shadow-md' 
                  : 'bg-card border border-border hover:border-foreground/30 text-muted-foreground hover:text-foreground'
              }`}
            >
              Todos
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-3 rounded-xl whitespace-nowrap font-medium capitalize transition-all duration-200 ${
                  activeCategory === cat 
                    ? 'bg-secondary text-secondary-foreground shadow-md glow-yellow' 
                    : 'bg-card border border-border hover:border-foreground/30 text-muted-foreground hover:text-foreground'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="h-64 bg-card/50 border border-border/50 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGirias.length === 0 ? (
              <div className="col-span-full py-20 text-center flex flex-col items-center">
                <Book className="w-16 h-16 text-muted-foreground/30 mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-2">Nenhuma gíria encontrada</h3>
                <p className="text-muted-foreground">Tenta usar outros termos de pesquisa.</p>
              </div>
            ) : (
              filteredGirias.map((giria, idx) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={giria.id}
                  className="bg-card border border-border hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 rounded-2xl p-6 transition-all duration-300 group flex flex-col"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-display font-bold text-foreground group-hover:text-primary transition-colors">
                      {giria.term}
                    </h3>
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-white/5 rounded text-muted-foreground border border-white/10">
                      {giria.category}
                    </span>
                  </div>
                  
                  <p className="text-foreground/90 font-medium mb-4 flex-1">
                    {giria.definition}
                  </p>
                  
                  <div className="space-y-3 mt-auto pt-4 border-t border-border/50">
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Quote className="w-4 h-4 mt-0.5 shrink-0 text-secondary" />
                      <p className="italic">"{giria.example}"</p>
                    </div>
                    {giria.culturalContext && (
                      <div className="flex items-start gap-2 text-xs text-muted-foreground/80">
                        <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
                        <p>{giria.culturalContext}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
