import { Router, type IRouter } from "express";
import { db, conversations as conversationsTable, messages as messagesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { openai } from "@workspace/integrations-openai-ai-server";
import {
  CreateOpenaiConversationBody,
  SendOpenaiMessageBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/openai/conversations", async (req, res) => {
  try {
    const conversations = await db.select().from(conversationsTable).orderBy(conversationsTable.createdAt);
    res.json(conversations);
  } catch (err) {
    req.log.error({ err }, "Error listing conversations");
    res.status(500).json({ error: "Erro interno" });
  }
});

router.post("/openai/conversations", async (req, res) => {
  try {
    const body = CreateOpenaiConversationBody.parse(req.body);
    const [conversation] = await db.insert(conversationsTable).values({ title: body.title }).returning();
    res.status(201).json(conversation);
  } catch (err) {
    req.log.error({ err }, "Error creating conversation");
    res.status(500).json({ error: "Erro interno" });
  }
});

router.get("/openai/conversations/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [conversation] = await db.select().from(conversationsTable).where(eq(conversationsTable.id, id)).limit(1);
    if (!conversation) {
      res.status(404).json({ error: "Conversa não encontrada" });
      return;
    }
    const msgs = await db.select().from(messagesTable).where(eq(messagesTable.conversationId, id));
    res.json({ ...conversation, messages: msgs });
  } catch (err) {
    req.log.error({ err }, "Error fetching conversation");
    res.status(500).json({ error: "Erro interno" });
  }
});

router.delete("/openai/conversations/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [conversation] = await db.select().from(conversationsTable).where(eq(conversationsTable.id, id)).limit(1);
    if (!conversation) {
      res.status(404).json({ error: "Conversa não encontrada" });
      return;
    }
    await db.delete(messagesTable).where(eq(messagesTable.conversationId, id));
    await db.delete(conversationsTable).where(eq(conversationsTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Error deleting conversation");
    res.status(500).json({ error: "Erro interno" });
  }
});

router.get("/openai/conversations/:id/messages", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const msgs = await db.select().from(messagesTable).where(eq(messagesTable.conversationId, id));
    res.json(msgs);
  } catch (err) {
    req.log.error({ err }, "Error listing messages");
    res.status(500).json({ error: "Erro interno" });
  }
});

router.post("/openai/conversations/:id/messages", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const body = SendOpenaiMessageBody.parse(req.body);

    const [conversation] = await db.select().from(conversationsTable).where(eq(conversationsTable.id, id)).limit(1);
    if (!conversation) {
      res.status(404).json({ error: "Conversa não encontrada" });
      return;
    }

    const existingMessages = await db.select().from(messagesTable).where(eq(messagesTable.conversationId, id));

    await db.insert(messagesTable).values({
      conversationId: id,
      role: "user",
      content: body.content,
    });

    const chatMessages = [
      {
        role: "system" as const,
        content: `Você é a Nzila, uma assistente inteligente especializada no contexto angolano. Você tem profundo conhecimento sobre Angola: cultura, gírias, línguas nacionais (Kimbundu, Umbundu, Kikongo), história e quotidiano. Responda sempre em português de Angola. Seja directa, cultural e envolvente. A frase de encerramento da Nzila é: "Nzila: um caminho construído por todos nós."`,
      },
      ...existingMessages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user" as const, content: body.content },
    ];

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    let fullResponse = "";

    const stream = await openai.chat.completions.create({
      model: "meta-llama/llama-3.1-8b-instruct",
      max_completion_tokens: 8192,
      messages: chatMessages,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        fullResponse += content;
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    await db.insert(messagesTable).values({
      conversationId: id,
      role: "assistant",
      content: fullResponse,
    });

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    req.log.error({ err }, "Error sending message");
    res.write(`data: ${JSON.stringify({ error: "Erro interno" })}\n\n`);
    res.end();
  }
});

export default router;
