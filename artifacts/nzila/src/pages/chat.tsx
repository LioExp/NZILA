import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, User, CornerDownLeft, Menu, Plus,
  Map, Paperclip, X, FileText, Image as ImageIcon,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useSendChatMessage } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/contexts/profile-context";
import { useChatStore, type ChatMessage } from "@/hooks/use-chat-history";
import { useSidebar } from "@/components/ui/sidebar";
import { TravelCard } from "@/components/travel-card";
import { v4 as uuidv4 } from "uuid";

const SUGGESTIONS = [
  "O que significa Kamba?",
  "Explica a palavra Bue",
  "Onde visitar em Angola?",
  "O que é um Zungueiro?",
  "Melhores praias de Angola",
];

function MessageContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
        strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
        em: ({ children }) => <em className="italic text-foreground/90">{children}</em>,
        ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-0.5">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-0.5">{children}</ol>,
        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
        h1: ({ children }) => <h1 className="text-base font-semibold mb-1 mt-2">{children}</h1>,
        h2: ({ children }) => <h2 className="text-sm font-semibold mb-1 mt-2">{children}</h2>,
        h3: ({ children }) => <h3 className="text-sm font-semibold mb-1 mt-1">{children}</h3>,
        code: ({ children, className }) => {
          const isBlock = className?.includes("language-");
          return isBlock ? (
            <code className="block bg-muted/60 rounded-lg px-3 py-2 text-xs font-mono my-2 overflow-x-auto">{children}</code>
          ) : (
            <code className="bg-muted/60 rounded px-1.5 py-0.5 text-xs font-mono">{children}</code>
          );
        },
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 border-primary/40 pl-3 my-2 text-muted-foreground">{children}</blockquote>
        ),
        hr: () => <hr className="border-border/40 my-2" />,
        a: ({ href, children }) => (
          <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 hover:text-primary/80">
            {children}
          </a>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

function FileAttachmentPreview({ attachment }: { attachment: ChatMessage["fileAttachment"] }) {
  if (!attachment) return null;
  const isImage = attachment.type.startsWith("image/");
  return (
    <div className="mb-2 flex items-center gap-2 px-3 py-2 bg-muted/50 border border-border/50 rounded-xl text-xs text-muted-foreground max-w-xs">
      {isImage && attachment.dataUrl ? (
        <img src={attachment.dataUrl} alt={attachment.name} className="w-8 h-8 rounded object-cover shrink-0" />
      ) : (
        <div className="w-8 h-8 rounded bg-muted flex items-center justify-center shrink-0">
          <FileText className="w-4 h-4 text-muted-foreground/60" />
        </div>
      )}
      <span className="truncate">{attachment.name}</span>
    </div>
  );
}

export default function Chat() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [input, setInput] = useState("");
  const [travelMode, setTravelMode] = useState(false);
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [pendingFile, setPendingFile] = useState<ChatMessage["fileAttachment"] | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const plusMenuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toggleSidebar } = useSidebar();
  const { messages, addMessage, activeConversationId, setConversationId } = useChatStore();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (plusMenuRef.current && !plusMenuRef.current.contains(e.target as Node)) {
        setShowPlusMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const chatMutation = useSendChatMessage({
    mutation: {
      onSuccess: (data) => {
        if (data.conversationId && !activeConversationId) {
          setConversationId(data.conversationId);
        }
        addMessage({
          id: uuidv4(),
          role: "assistant",
          content: data.response,
          source: data.source,
          matchedGiria: data.matchedGiria,
          travelData: data.travelData ?? null,
          createdAt: new Date(),
        });
      },
      onError: () => {
        addMessage({
          id: uuidv4(),
          role: "assistant",
          content: "Erro de ligação. Por favor tenta novamente.",
          source: "error",
          createdAt: new Date(),
        });
      },
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, chatMutation.isPending]);

  const handleSend = useCallback((text: string) => {
    if (!text.trim() || !user) return;
    addMessage({
      id: uuidv4(),
      role: "user",
      content: text,
      fileAttachment: pendingFile ?? undefined,
      createdAt: new Date(),
    });
    const fileNote = pendingFile ? ` [Ficheiro anexado: ${pendingFile.name}]` : "";
    setInput("");
    setPendingFile(null);
    chatMutation.mutate({
      data: {
        message: text + fileNote,
        userId: user.id,
        conversationId: activeConversationId,
        userName: user.firstName ?? null,
        country: profile?.country ?? null,
        isAngolan: profile?.isAngolan ?? null,
        travelMode: travelMode || undefined,
      },
    });
  }, [user, pendingFile, travelMode, activeConversationId, profile, addMessage, chatMutation]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isImage = file.type.startsWith("image/");
    if (isImage) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPendingFile({ name: file.name, type: file.type, dataUrl: ev.target?.result as string });
      };
      reader.readAsDataURL(file);
    } else {
      setPendingFile({ name: file.name, type: file.type });
    }
    setShowPlusMenu(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const isInitial = messages.length === 0;

  return (
    <div className="flex flex-col h-full bg-background relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[280px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <header className="px-4 py-3 border-b border-border/40 bg-background/90 backdrop-blur-md z-10 flex items-center justify-between">
        <button
          onClick={toggleSidebar}
          className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Menu"
        >
          <Menu className="w-4 h-4" />
        </button>
        <div className="hidden md:block" />
        <span className="text-[10px] font-medium px-2 py-1 bg-muted/50 border border-border/50 rounded-full text-muted-foreground">
          v1.0
        </span>
      </header>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
        <div className="max-w-2xl mx-auto flex flex-col gap-6">
          {isInitial ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4"
            >
              <div className="w-16 h-16">
                <img src="/nzila-logo.png" alt="Nzila" className="w-full h-full object-contain drop-shadow-xl" />
              </div>
              <div>
                <h2 className="text-3xl font-semibold text-foreground" style={{ letterSpacing: "-0.03em" }}>
                  {user?.firstName ? `Olá, ${user.firstName}` : "Olá"}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">Como posso ajudar hoje?</p>
              </div>
            </motion.div>
          ) : (
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-1 overflow-hidden ${
                      msg.role === "user" ? "bg-muted" : ""
                    }`}
                  >
                    {msg.role === "user" ? (
                      <User className="w-3.5 h-3.5 text-muted-foreground" />
                    ) : (
                      <img src="/nzila-logo.png" alt="" className="w-full h-full object-contain p-0.5" />
                    )}
                  </div>

                  <div className={`flex flex-col gap-1.5 max-w-[84%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                    {msg.role === "user" && msg.fileAttachment && (
                      <FileAttachmentPreview attachment={msg.fileAttachment} />
                    )}
                    <div
                      className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-card border border-border/60 text-foreground rounded-tr-sm"
                          : "text-foreground/90"
                      }`}
                    >
                      {msg.role === "assistant" ? (
                        <MessageContent content={msg.content} />
                      ) : (
                        msg.content
                      )}
                    </div>

                    {msg.role === "assistant" && msg.travelData && (
                      <div className="w-full">
                        <TravelCard travelData={msg.travelData} />
                      </div>
                    )}

                    {msg.role === "assistant" && msg.source && (
                      <div className="flex items-center gap-2 px-1">
                        <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border ${
                          msg.source.includes("dataset")
                            ? "bg-secondary/10 text-secondary border-secondary/20"
                            : msg.travelData
                            ? "bg-primary/10 text-primary border-primary/20"
                            : "bg-muted/50 text-muted-foreground border-border/50"
                        }`}>
                          {msg.source.includes("dataset") ? "Dataset" : msg.travelData ? "Viagem" : "IA"}
                        </span>
                        {msg.matchedGiria && (
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <CornerDownLeft className="w-2.5 h-2.5" />
                            {msg.matchedGiria}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          {chatMutation.isPending && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
              <div className="w-7 h-7 shrink-0 mt-1">
                <img src="/nzila-logo.png" alt="" className="w-full h-full object-contain p-0.5" />
              </div>
              <div className="flex items-center gap-1.5 h-10">
                {[0, 150, 300].map((delay) => (
                  <span
                    key={delay}
                    className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce"
                    style={{ animationDelay: `${delay}ms` }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="p-4 bg-background/90 backdrop-blur-md border-t border-border/40 z-20">
        <div className="max-w-2xl mx-auto">
          <AnimatePresence>
            {isInitial && (
              <motion.div
                initial={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.15 }}
                className="flex flex-wrap gap-2 mb-3 overflow-hidden"
              >
                {SUGGESTIONS.map((sug) => (
                  <button
                    key={sug}
                    onClick={() => handleSend(sug)}
                    className="text-xs px-3 py-1.5 bg-muted/50 hover:bg-muted border border-border/50 hover:border-border text-muted-foreground hover:text-foreground rounded-full transition-all"
                  >
                    {sug}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active mode indicators */}
          <AnimatePresence>
            {(travelMode || pendingFile) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-wrap gap-2 mb-2 overflow-hidden"
              >
                {travelMode && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 border border-primary/20 rounded-full text-[11px] font-medium text-primary">
                    <Map className="w-3 h-3" />
                    Modo Viagem activo
                    <button onClick={() => setTravelMode(false)} className="ml-0.5 hover:text-primary/60 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                {pendingFile && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-muted/60 border border-border/50 rounded-full text-[11px] text-muted-foreground">
                    {pendingFile.type.startsWith("image/") ? <ImageIcon className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                    <span className="max-w-[160px] truncate">{pendingFile.name}</span>
                    <button onClick={() => setPendingFile(null)} className="ml-0.5 hover:text-foreground transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative flex items-end gap-2">
            {/* + Button */}
            <div className="relative shrink-0" ref={plusMenuRef}>
              <button
                onClick={() => setShowPlusMenu((v) => !v)}
                className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all ${
                  showPlusMenu
                    ? "bg-muted border-border text-foreground"
                    : "bg-card border-border/60 text-muted-foreground hover:text-foreground hover:border-border hover:bg-muted"
                }`}
                aria-label="Adicionar"
              >
                <motion.div animate={{ rotate: showPlusMenu ? 45 : 0 }} transition={{ duration: 0.15 }}>
                  <Plus className="w-4 h-4" />
                </motion.div>
              </button>

              <AnimatePresence>
                {showPlusMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.92, y: 6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.92, y: 6 }}
                    transition={{ duration: 0.12 }}
                    className="absolute bottom-11 left-0 w-52 bg-card border border-border/70 rounded-2xl shadow-xl overflow-hidden z-30"
                  >
                    <div className="p-1.5 space-y-0.5">
                      <button
                        onClick={() => {
                          setTravelMode((v) => !v);
                          setShowPlusMenu(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                          travelMode
                            ? "bg-primary/10 text-primary"
                            : "text-foreground hover:bg-muted"
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${travelMode ? "bg-primary/20" : "bg-muted"}`}>
                          <Map className="w-3.5 h-3.5" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-[13px] leading-none">Viagem por Angola</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {travelMode ? "Activo — clica para desligar" : "Mapa + lugares + fotos"}
                          </p>
                        </div>
                      </button>

                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-foreground hover:bg-muted transition-colors"
                      >
                        <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center">
                          <Paperclip className="w-3.5 h-3.5" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-[13px] leading-none">Anexar ficheiro</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">Imagem ou documento</p>
                        </div>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf,.txt,.doc,.docx"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>

            {/* Textarea */}
            <div className="relative flex-1">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(input);
                  }
                }}
                placeholder={travelMode ? "Pergunta sobre lugares, cidades, praias em Angola..." : "Escreve a tua mensagem..."}
                className="w-full bg-card border border-border/70 focus:border-primary/40 focus:ring-4 focus:ring-primary/8 rounded-xl px-4 py-3 pr-12 text-sm text-foreground placeholder:text-muted-foreground/50 resize-none min-h-[48px] max-h-[140px] transition-all custom-scrollbar"
                rows={1}
              />
              <button
                onClick={() => handleSend(input)}
                disabled={(!input.trim() && !pendingFile) || chatMutation.isPending}
                className="absolute right-2 bottom-2 w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center hover:bg-primary/90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <Send className="w-3.5 h-3.5 ml-0.5" />
              </button>
            </div>
          </div>

          <p className="text-center mt-2 text-[10px] text-muted-foreground/40">
            A IA pode cometer erros. Verifica sempre informações importantes.
          </p>
        </div>
      </div>
    </div>
  );
}
