import { useState, useRef, useEffect, useCallback, Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, User, Menu,
  Map, X, FileText, Image as ImageIcon,
  Globe, PlusCircle, Copy, Volume2, ThumbsUp, ThumbsDown, RefreshCw,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import { useSendChatMessage } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/contexts/profile-context";
import { useChatStore, type ChatMessage } from "@/hooks/use-chat-history";
import { useSidebar } from "@/components/ui/sidebar";
import { TravelCard } from "@/components/travel-card";
import { ErrorBoundary } from "@/components/error-boundary";
import { v4 as uuidv4 } from "uuid";

const SUGGESTIONS = [
  "O que significa Kamba?",
  "Explica a palavra Bue",
  "Onde visitar em Angola?",
  "O que é um Zungueiro?",
  "Melhores praias de Angola",
];

function InlineMarkdown({ text }: { text: string }) {
  const parts: (string | JSX.Element)[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    const boldMatch = remaining.match(/^(\*\*|__)(.+?)\1/);
    if (boldMatch) {
      parts.push(<strong key={key++} className="font-semibold text-white">{boldMatch[2]}</strong>);
      remaining = remaining.slice(boldMatch[0].length);
      continue;
    }
    const italicMatch = remaining.match(/^(\*|_)(.+?)\1/);
    if (italicMatch) {
      parts.push(<em key={key++} className="italic text-foreground/90">{italicMatch[2]}</em>);
      remaining = remaining.slice(italicMatch[0].length);
      continue;
    }
    const codeMatch = remaining.match(/^`([^`]+)`/);
    if (codeMatch) {
      parts.push(<code key={key++} className="bg-muted/60 rounded px-1.5 py-0.5 text-xs font-mono">{codeMatch[1]}</code>);
      remaining = remaining.slice(codeMatch[0].length);
      continue;
    }
    const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/);
    if (linkMatch) {
      parts.push(
        <a key={key++} href={linkMatch[2]} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 hover:text-primary/80">
          {linkMatch[1]}
        </a>
      );
      remaining = remaining.slice(linkMatch[0].length);
      continue;
    }
    parts.push(remaining[0]);
    remaining = remaining.slice(1);
  }

  return <>{...parts}</>;
}

function SimpleMarkdown({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: JSX.Element[] = [];
  let key = 0;
  let inList: "ul" | null = null;
  let listItems: JSX.Element[] = [];

  function flushList() {
    if (inList && listItems.length > 0) {
      const Tag = inList === "ul" ? "ul" : "ol";
      elements.push(
        <Tag key={key++} className="list-disc pl-4 mb-2 space-y-0.5">
          {listItems}
        </Tag>
      );
      listItems = [];
    }
    inList = null;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed === "") {
      flushList();
      continue;
    }

    const codeBlockMatch = trimmed.match(/^```(\w*)/);
    if (codeBlockMatch) {
      flushList();
      const lang = codeBlockMatch[1];
      let codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push(
        <code key={key++} className="block bg-muted/60 rounded-lg px-3 py-2 text-xs font-mono my-2 overflow-x-auto">
          {codeLines.join("\n")}
        </code>
      );
      continue;
    }

    const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)/);
    if (headingMatch) {
      flushList();
      const level = headingMatch[1].length;
      const Tag = level === 1 ? "h1" : level === 2 ? "h2" : "h3";
      const cls = level === 1 ? "text-base font-semibold mb-1 mt-2"
        : level === 2 ? "text-sm font-semibold mb-1 mt-2"
        : "text-sm font-semibold mb-1 mt-1";
      elements.push(
        <Tag key={key++} className={cls}><InlineMarkdown text={headingMatch[2]} /></Tag>
      );
      continue;
    }

    const hrMatch = trimmed.match(/^[-*_]{3,}$/);
    if (hrMatch) {
      flushList();
      elements.push(<hr key={key++} className="border-border/40 my-2" />);
      continue;
    }

    const blockquoteMatch = trimmed.match(/^>\s*(.*)/);
    if (blockquoteMatch) {
      flushList();
      elements.push(
        <blockquote key={key++} className="border-l-2 border-primary/40 pl-3 my-2 text-muted-foreground">
          <InlineMarkdown text={blockquoteMatch[1]} />
        </blockquote>
      );
      continue;
    }

    const liMatch = trimmed.match(/^[-*+]\s+(.*)/);
    if (liMatch) {
      inList = "ul";
      listItems.push(
        <li key={`li-${key++}`} className="leading-relaxed">
          <InlineMarkdown text={liMatch[1]} />
        </li>
      );
      continue;
    }

    flushList();

    const olMatch = trimmed.match(/^\d+[.)]\s+(.*)/);
    if (olMatch) {
      elements.push(
        <p key={key++} className="mb-2 last:mb-0">
          <InlineMarkdown text={olMatch[1]} />
        </p>
      );
      continue;
    }

    elements.push(
      <p key={key++} className="mb-2 last:mb-0">
        <InlineMarkdown text={line} />
      </p>
    );
  }

  flushList();

  return <>{elements}</>;
}

function MessageContent({ content }: { content: string }) {
  if (typeof content !== "string" || content.length === 0) {
    return <p className="text-muted-foreground italic">(mensagem vazia)</p>;
  }
  return <SimpleMarkdown content={content} />;
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
  const [pendingFile, setPendingFile] = useState<ChatMessage["fileAttachment"] | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toggleSidebar } = useSidebar();
  const { messages, addMessage, updateMessage, activeConversationId, setConversationId } = useChatStore();

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

  const handleRegenerate = useCallback((assistantMsgId: string) => {
    if (!user) return;
    const msgIndex = messages.findIndex((m) => m.id === assistantMsgId);
    if (msgIndex < 0) return;
    const prevUserMsg = messages.slice(0, msgIndex).reverse().find((m) => m.role === "user");
    if (!prevUserMsg) return;

    const currentMsg = messages[msgIndex];
    const existingVersions = currentMsg.versions ?? [currentMsg.content];
    const currentVersionIdx = currentMsg.currentVersion ?? 0;

    const newVersionIdx = existingVersions.length;

    chatMutation.mutate(
      {
        data: {
          message: prevUserMsg.content,
          userId: user.id,
          conversationId: activeConversationId,
          userName: user.firstName ?? null,
          country: profile?.country ?? null,
          isAngolan: profile?.isAngolan ?? null,
          travelMode: travelMode || undefined,
        },
      },
      {
        onSuccess: (data) => {
          const newVersions = [...existingVersions, data.response];
          updateMessage(assistantMsgId, {
            content: data.response,
            versions: newVersions,
            currentVersion: newVersionIdx,
            source: data.source,
            matchedGiria: data.matchedGiria,
            travelData: data.travelData ?? null,
          });
        },
      }
    );
  }, [user, messages, activeConversationId, profile, travelMode, chatMutation, updateMessage]);

  const handleVersionChange = useCallback((assistantMsgId: string, direction: "prev" | "next") => {
    const msg = messages.find((m) => m.id === assistantMsgId);
    if (!msg || !msg.versions || msg.versions.length === 0) return;
    const current = msg.currentVersion ?? 0;
    const next = direction === "next"
      ? Math.min(current + 1, msg.versions.length - 1)
      : Math.max(current - 1, 0);
    const content = msg.versions[next];
    if (content === undefined) return;
    updateMessage(assistantMsgId, {
      currentVersion: next,
      content,
    });
  }, [messages, updateMessage]);

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
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[280px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <header className="px-4 py-3 bg-background z-10 flex items-center justify-between">
        <button
          onClick={toggleSidebar}
          className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Menu"
        >
          <Menu className="w-4 h-4" />
        </button>
        <div className="hidden md:block" />
      </header>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
        <div className="max-w-3xl mx-auto flex flex-col gap-6">
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
                  className={`group flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
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
                        <ErrorBoundary fallback={<p className="text-muted-foreground italic">Erro ao renderizar mensagem</p>}>
                          <MessageContent content={msg.content} />
                        </ErrorBoundary>
                      ) : (
                        msg.content
                      )}
                    </div>

                    {msg.role === "assistant" && msg.travelData && (
                      <div className="w-full">
                        <TravelCard travelData={msg.travelData} />
                      </div>
                    )}

                    {msg.role === "assistant" && (
                      <div className="flex items-center gap-1 px-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => navigator.clipboard.writeText(msg.content)}
                          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          title="Copiar"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Ouvir">
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Gostei">
                          <ThumbsUp className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Não gostei">
                          <ThumbsDown className="w-3.5 h-3.5" />
                        </button>
                        {msg.versions && msg.versions.length > 1 && (
                          <div className="flex items-center gap-0.5 mx-0.5">
                            <button
                              onClick={() => handleVersionChange(msg.id, "prev")}
                              disabled={(msg.currentVersion ?? 0) === 0}
                              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30"
                            >
                              <ChevronLeft className="w-3 h-3" />
                            </button>
                            <span className="text-[10px] text-muted-foreground min-w-[24px] text-center">
                              {(msg.currentVersion ?? 0) + 1}/{msg.versions.length}
                            </span>
                            <button
                              onClick={() => handleVersionChange(msg.id, "next")}
                              disabled={(msg.currentVersion ?? 0) === msg.versions.length - 1}
                              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30"
                            >
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                        <button
                          onClick={() => handleRegenerate(msg.id)}
                          disabled={chatMutation.isPending}
                          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
                          title="Gerar nova resposta"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${chatMutation.isPending ? "animate-spin" : ""}`} />
                        </button>
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

      <div className="p-4 bg-background z-20">
        <div className="max-w-3xl mx-auto">
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
            {/* Input Box - Estilo IA Angolana */}
            <div className="flex-1 bg-muted/30 border border-border/50 rounded-2xl p-3 flex flex-col gap-2">
              <div className="flex gap-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend(input);
                    }
                  }}
                  placeholder={travelMode ? "Pergunta sobre lugares, cidades, praias em Angola..." : "Pergunta qualquer coisa..."}
                  className="flex-1 bg-transparent border-none outline-none resize-none text-sm text-foreground placeholder:text-muted-foreground/50 min-h-[36px] max-h-[120px]"
                  rows={1}
                  maxLength={1000}
                />
                <button className="shrink-0 px-3 py-1.5 bg-muted border border-border/50 rounded-full text-xs text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  Web
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    Adicionar
                  </button>
                  <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <ImageIcon className="w-3.5 h-3.5" />
                    Imagem
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground/50">{input.length}/1000</span>
                  <button
                    onClick={() => handleSend(input)}
                    disabled={(!input.trim() && !pendingFile) || chatMutation.isPending}
                    className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary/90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <Send className="w-3.5 h-3.5 ml-0.5" />
                  </button>
                </div>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf,.txt,.doc,.docx"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>

          <p className="text-center mt-2 text-[10px] text-muted-foreground/40">
            A IA pode cometer erros. Verifica sempre informações importantes.
          </p>
        </div>
      </div>
    </div>
  );
}
