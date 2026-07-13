import { Router, type IRouter } from "express";
import { db, giriasTable, usersTable, contributionsTable } from "@workspace/db";
import { eq, ilike } from "drizzle-orm";
import { openai } from "@workspace/integrations-openai-ai-server";
import {
  SendChatMessageBody,
  CreateContributionBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

const GIRIAS_DATASET = [
  { term: "Kamba", definition: "Amigo, camarada, parceiro. Palavra muito usada entre jovens angolanos.", example: "Kamba, bora ali tomar um sumo!", culturalContext: "Termo de origem Kimbundu amplamente adoptado no calão angolano urbano.", category: "gíria" },
  { term: "Bora", definition: "Vamos (contração de 'vamos embora'). Convite para ir a algum lugar.", example: "Bora ali ao mercado?", culturalContext: "Expressão muito comum no Luanda urbano, especialmente entre a juventude.", category: "expressão" },
  { term: "Fixe", definition: "Bom, óptimo, agradável. Usado para expressar aprovação.", example: "Esse concerto foi tá fixe demais!", culturalContext: "Empréstimo do português europeu, adaptado ao contexto angolano.", category: "gíria" },
  { term: "Bue", definition: "Muito, bastante. Intensificador usado antes de adjectivos.", example: "Esse miúdo é bue esperto!", culturalContext: "Termo central no calão angolano, semelhante ao 'muito' em português.", category: "gíria" },
  { term: "Kota", definition: "Pessoa mais velha, ancião, padrinho. Também pode significar respeito.", example: "Respeita o kota, ele sabe muito de vida.", culturalContext: "Palavra de origem Kimbundu que expressa respeito pelos mais velhos na cultura angolana.", category: "gíria" },
  { term: "Muita pinta", definition: "Muito bom, excelente, impressionante.", example: "Esse outfit dela é muita pinta!", culturalContext: "Expressão de elogio muito popular entre a juventude de Luanda.", category: "expressão" },
  { term: "Makas", definition: "Problemas, confusão, encrenca.", example: "Não me traga makas, eu não tô para isso hoje.", culturalContext: "Palavra muito usada para descrever situações problemáticas no quotidiano angolano.", category: "gíria" },
  { term: "Kandonga", definition: "Comércio informal, mercado negro, esquema não oficial.", example: "Ele vende tudo na kandonga lá do bairro.", culturalContext: "Realidade económica importante em Angola, o comércio paralelo ao formal.", category: "expressão" },
  { term: "Zungueiro", definition: "Vendedor ambulante que carrega mercadoria na cabeça.", example: "A zungueira passou cedo com quizaca fresca.", culturalContext: "Figura icónica das ruas de Luanda, vital para a economia informal angolana.", category: "expressão" },
  { term: "Quizaca", definition: "Folhas de mandioca cozidas, prato típico angolano.", example: "Hoje tem quizaca com peixe frito, bué delícia!", culturalContext: "Prato fundamental na gastronomia angolana, especialmente no norte do país.", category: "gastronomia" },
  { term: "Tá bué", definition: "Expressão de concordância ou confirmação entusiástica.", example: "— Vamos à praia? — Tá bué!", culturalContext: "Forma rápida e energética de expressar concordância total entre jovens.", category: "expressão" },
  { term: "Suka", definition: "Vai-te embora, sai daqui (imperativo informal).", example: "Suka daqui, não tou a brincar!", culturalContext: "Expressão directa e informal usada para dispensar alguém com firmeza.", category: "gíria" },
];

async function ensureGiriasSeeded() {
  const existing = await db.select().from(giriasTable).limit(1);
  if (existing.length === 0) {
    await db.insert(giriasTable).values(GIRIAS_DATASET);
  }
}

ensureGiriasSeeded().catch(() => {});

async function findGiriaMatch(message: string) {
  const lower = message.toLowerCase();
  const girias = await db.select().from(giriasTable);
  for (const giria of girias) {
    if (lower.includes(giria.term.toLowerCase())) return giria;
  }
  return null;
}

async function ensureUser(userId: string) {
  const existing = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (existing.length === 0) {
    await db.insert(usersTable).values({ id: userId });
    return { id: userId, level: "Nenhum", approvedContributions: 0, totalContributions: 0, isBlocked: false, createdAt: new Date(), updatedAt: new Date() };
  }
  return existing[0];
}

router.post("/chat", async (req, res) => {
  try {
    const body = SendChatMessageBody.parse(req.body);
    const { message, userId, userName, country, isAngolan } = body;

    const match = await findGiriaMatch(message);

    if (match) {
      res.json({
        response: `**${match.term}** — ${match.definition}\n\n**Exemplo:** "${match.example}"\n\n**Contexto cultural:** ${match.culturalContext}`,
        source: "dataset",
        matchedGiria: match.term,
        conversationId: 1,
      });
      return;
    }

    const girias = await db.select().from(giriasTable);
    const giriaContext = girias.map((g) => `- "${g.term}": ${g.definition} (ex: "${g.example}")`).join("\n");

    // Build personalized system prompt
    let userContext = "";
    if (userName) {
      userContext += `\nEstás a falar com ${userName}.`;
    }
    if (isAngolan === true) {
      userContext += ` É angolano(a), por isso podes usar gírias e expressões locais livremente.`;
    } else if (isAngolan === false && country) {
      userContext += ` É de ${country}, não de Angola. Adapta a tua linguagem para ser mais acessível, mas mantém o contexto angolano.`;
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 8192,
      messages: [
        {
          role: "system",
          content: `Você é a Nzila, uma assistente inteligente especializada no contexto angolano. 
Tem profundo conhecimento sobre Angola: cultura, gírias, línguas nacionais (Kimbundu, Umbundu, Kikongo), história e quotidiano.${userContext}

Dataset de gírias angolanas disponível:
${giriaContext}

Responda sempre em português de Angola, usando expressões locais quando apropriado. 
Priorize sempre o contexto e cultura angolana nas suas respostas.
Seja directa, cultural e envolvente. Trata o utilizador pelo primeiro nome quando disponível.`,
        },
        { role: "user", content: message },
      ],
    });

    res.json({
      response: completion.choices[0]?.message?.content ?? "Desculpa, não consegui processar a tua mensagem.",
      source: "ai",
      matchedGiria: null,
      conversationId: 1,
    });
  } catch (err) {
    req.log.error({ err }, "Chat error");
    res.status(500).json({ error: "Erro interno" });
  }
});

router.get("/girias", async (req, res) => {
  try {
    await ensureGiriasSeeded();
    const girias = await db.select().from(giriasTable);
    res.json(girias);
  } catch (err) {
    req.log.error({ err }, "Error fetching girias");
    res.status(500).json({ error: "Erro interno" });
  }
});

router.get("/ranking/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await ensureUser(userId);
    res.json({
      userId: user.id,
      level: user.level,
      approvedContributions: user.approvedContributions,
      totalContributions: user.totalContributions,
      isBlocked: user.isBlocked,
    });
  } catch (err) {
    req.log.error({ err }, "Error fetching ranking");
    res.status(500).json({ error: "Erro interno" });
  }
});

router.get("/contributions", async (req, res) => {
  try {
    const contributions = await db.select().from(contributionsTable);
    res.json(contributions);
  } catch (err) {
    req.log.error({ err }, "Error fetching contributions");
    res.status(500).json({ error: "Erro interno" });
  }
});

router.post("/contributions", async (req, res) => {
  try {
    const body = CreateContributionBody.parse(req.body);
    const { userId, term, definition, example } = body;

    const user = await ensureUser(userId);

    if (user.isBlocked) {
      res.status(403).json({ error: "A tua conta está bloqueada." });
      return;
    }

    let status = "pending";
    if (user.level === "Confiável") {
      status = "auto_approved";
    } else if (user.level === "Horrível") {
      res.status(403).json({ error: "O teu nível de ranking não permite contribuições." });
      return;
    }

    const duplicates = await db.select().from(giriasTable).where(ilike(giriasTable.term, term));
    if (duplicates.length > 0) {
      res.status(409).json({ error: "Esta gíria já existe no nosso dataset!" });
      return;
    }

    const [contribution] = await db.insert(contributionsTable).values({ userId, term, definition, example, status }).returning();

    await db.update(usersTable)
      .set({ totalContributions: user.totalContributions + 1 })
      .where(eq(usersTable.id, userId));

    res.status(201).json({
      message: status === "auto_approved"
        ? "Bue fixe! A tua gíria foi integrada automaticamente no dataset (nível Confiável)."
        : "Obrigado pela contribuição! A tua gíria entrou na fila de moderação.",
      status,
      contributionId: contribution.id,
    });
  } catch (err) {
    req.log.error({ err }, "Error creating contribution");
    res.status(500).json({ error: "Erro interno" });
  }
});

export default router;
