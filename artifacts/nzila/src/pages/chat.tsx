import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, User, CornerDownLeft, Menu } from "lucide-react";
import { useSendChatMessage } from "@workspace/api-client-react";
import { useUserId } from "@/hooks/use-user";
import { useChatStore, type ChatMessage } from "@/hooks/use-chat-history";
import { useSidebar } from "@/components/ui/sidebar";
import { v4 as uuidv4 } from "uuid";

const SUGGESTIONS = [
  "Kamba, bora ali?",
  "Tá fixe o mambo",
  "Bue fixe",
  "O kota bazou",
  "Isso tem muita pinta"
];

export default function Chat() {
  const userId = useUserId();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toggleSidebar } = useSidebar();
  
  const { messages, addMessage, activeConversationId, setConversationId } = useChatStore();
  
  const chatMutation = useSendChatMessage({
    mutation: {
      onSuccess: (data) => {
        if (data.conversationId && !activeConversationId) {
          setConversationId(data.conversationId);
        }
        
        const assistantMsg: ChatMessage = {
          id: uuidv4(),
          role: 'assistant',
          content: data.response,
          source: data.source,
          matchedGiria: data.matchedGiria,
          createdAt: new Date(),
        };
        addMessage(assistantMsg);
      },
      onError: (err) => {
        console.error("Chat error:", err);
        addMessage({
          id: uuidv4(),
          role: 'assistant',
          content: "Desculpa kamba, houve um erro na rede. Tenta de novo!",
          source: 'error',
          createdAt: new Date(),
        });
      }
    }
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, chatMutation.isPending]);

  const handleSend = (text: string) => {
    if (!text.trim() || !userId) return;

    const userMsg: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: text,
      createdAt: new Date(),
    };
    
    addMessage(userMsg);
    setInput("");
    
    chatMutation.mutate({
      data: {
        message: text,
        userId,
        conversationId: activeConversationId
      }
    });
  };

  const isInitial = messages.length === 0;

  return (
    <div className="flex flex-col h-full bg-background/50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/5 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Header */}
      <header className="px-4 py-3 border-b border-border/40 bg-background/80 backdrop-blur-md z-10 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Mobile menu button */}
          <button
            onClick={toggleSidebar}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground shrink-0"
            aria-label="Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="font-display text-lg font-bold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-secondary shrink-0" />
            <span>Nzila Chat</span>
          </h1>
        </div>
        <div className="text-[10px] font-medium px-2 py-1 bg-white/5 border border-white/10 rounded-full text-muted-foreground whitespace-nowrap">
          Nzila v1
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-5 md:p-8 custom-scrollbar scroll-smooth">
        <div className="max-w-3xl mx-auto flex flex-col gap-4 sm:gap-6">
          
          {isInitial ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center min-h-[45vh] text-center space-y-4 px-2"
            >
              <div className="w-28 h-28 sm:w-40 sm:h-40 mb-2">
                <img src="/nzila-logo.png" alt="Nzila" className="w-full h-full object-contain drop-shadow-2xl" />
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                Olá kamba!<br/>Como posso ajudar?
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground max-w-sm sm:max-w-lg">
                Sou o Nzila, teu assistente virtual com alma angolana. Podes falar comigo usando as nossas gírias.
              </p>
            </motion.div>
          ) : (
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className={`flex gap-2 sm:gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 shadow-md overflow-hidden ${
                    msg.role === 'user' 
                      ? 'bg-secondary text-secondary-foreground' 
                      : ''
                  }`}>
                    {msg.role === 'user' 
                      ? <User className="w-4 h-4 sm:w-5 sm:h-5" /> 
                      : <img src="/nzila-logo.png" alt="Nzila" className="w-full h-full object-contain p-0.5" />
                    }
                  </div>

                  {/* Message Bubble */}
                  <div className={`flex flex-col gap-1.5 max-w-[85%] sm:max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`px-4 py-3 sm:px-5 sm:py-4 rounded-2xl text-sm sm:text-[15px] leading-relaxed shadow-sm ${
                      msg.role === 'user'
                        ? 'bg-white/10 text-white border border-white/5 rounded-tr-sm'
                        : 'bg-card border border-border/50 text-foreground rounded-tl-sm'
                    }`}>
                      {msg.content}
                    </div>
                    
                    {/* Meta Info (Source Badges) */}
                    {msg.role === 'assistant' && msg.source && (
                      <div className="flex flex-wrap items-center gap-2 px-1">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1 ${
                          msg.source === 'dataset' || msg.source === 'dataset | ai'
                            ? 'bg-secondary/20 text-secondary border border-secondary/20'
                            : 'bg-muted text-muted-foreground border border-border'
                        }`}>
                          {msg.source.includes('dataset') ? 'Dataset Nzila' : 'IA'}
                        </span>
                        {msg.matchedGiria && (
                          <span className="text-[11px] text-muted-foreground/80 flex items-center gap-1">
                            <CornerDownLeft className="w-3 h-3 shrink-0" />
                            Gíria: <strong className="text-foreground/80">{msg.matchedGiria}</strong>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          {/* Loading State */}
          {chatMutation.isPending && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-2 sm:gap-4 flex-row"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl shrink-0 shadow-md flex items-center justify-center">
                <img src="/nzila-logo.png" alt="Nzila" className="w-full h-full object-contain p-0.5" />
              </div>
              <div className="bg-card border border-border/50 rounded-2xl rounded-tl-sm px-5 py-4 flex items-center gap-2 h-[52px]">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} className="h-2" />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-3 sm:p-4 bg-background/80 backdrop-blur-md border-t border-border/40 relative z-20">
        <div className="max-w-3xl mx-auto">
          
          {/* Suggestions — only shown before first message */}
          <AnimatePresence>
            {isInitial && (
              <motion.div
                initial={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-wrap gap-2 mb-3 overflow-hidden"
              >
                {SUGGESTIONS.map((sug) => (
                  <button
                    key={sug}
                    onClick={() => handleSend(sug)}
                    className="text-xs px-3 py-2 bg-card hover:bg-white/10 border border-border hover:border-white/20 text-muted-foreground hover:text-foreground rounded-full transition-all duration-200 shadow-sm active:scale-95"
                  >
                    {sug}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input Box */}
          <div className="relative group">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(input);
                }
              }}
              placeholder="Escreve a tua mensagem kamba..."
              className="w-full bg-card border-2 border-border/80 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 rounded-2xl px-4 py-3 pr-14 text-sm sm:text-base text-foreground placeholder:text-muted-foreground resize-none min-h-[52px] max-h-[160px] transition-all custom-scrollbar"
              rows={1}
            />
            <button
              onClick={() => handleSend(input)}
              disabled={!input.trim() || chatMutation.isPending}
              className="absolute right-2.5 bottom-2.5 w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </div>
          <div className="text-center mt-2">
            <p className="text-[10px] text-muted-foreground/50">A IA pode cometer erros. Confirma as informações importantes.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
