import { Router, type IRouter } from "express";
import { db, giriasTable, usersTable, contributionsTable } from "@workspace/db";
import { eq, ilike } from "drizzle-orm";
import { openai } from "@workspace/integrations-openai-ai-server";
import { SendChatMessageBody, CreateContributionBody } from "@workspace/api-zod";

const router: IRouter = Router();

const GIRIAS_DATASET = [
  { term: "Kamba", definition: "Amigo, camarada, parceiro de confiança.", example: "Esse é o meu kamba de infância.", culturalContext: "Origem Kimbundu. Usado entre amigos próximos, não forçado no início de conversa.", category: "gíria" },
  { term: "Kota", definition: "Pessoa mais velha que merece respeito. Também pode ser um padrinho ou figura de autoridade.", example: "Vou falar com o kota lá do bairro para resolver isso.", culturalContext: "Palavra de origem Kimbundu. Expressa respeito hierárquico na cultura angolana.", category: "gíria" },
  { term: "Mano", definition: "Irmão, amigo próximo. Forma de tratamento afectuosa.", example: "Mano, não acreditas no que aconteceu hoje.", culturalContext: "Muito usado em Luanda entre jovens, semelhante ao 'cara' no Brasil.", category: "gíria" },
  { term: "Diê", definition: "Interjeição de surpresa, admiração ou concordância. Equivalente a 'uau' ou 'nossa'.", example: "Diê, essa notícia é mesmo séria?", culturalContext: "Uma das interjeições mais características do calão angolano.", category: "expressão" },
  { term: "Xiça", definition: "Interjeição de surpresa, susto ou espanto. Mais enfático que 'diê'.", example: "Xiça! Quase que o carro me atropelou.", culturalContext: "Expressão muito comum no quotidiano de Luanda.", category: "expressão" },
  { term: "Bora", definition: "Vamos, vem. Convite ou incitamento a ir a algum lugar.", example: "Bora ali tomar um suco antes de voltarmos.", culturalContext: "Contração de 'vamos embora'. Central no falar dos jovens angolanos.", category: "expressão" },
  { term: "Cuia", definition: "Andar, mover-se, partir. Às vezes tem conotação de fugir ou ir embora rapidamente.", example: "Cuia daqui antes que ele chegue.", culturalContext: "Muito usado para indicar movimento ou saída rápida de um local.", category: "gíria" },
  { term: "Bazar", definition: "Ir embora, sair de um lugar, muitas vezes de forma abrupta.", example: "Ele bazou sem dizer nada a ninguém.", culturalContext: "Utilizado quando alguém sai de forma inesperada ou sem avisar.", category: "gíria" },
  { term: "Fixe", definition: "Bom, óptimo, agradável.", example: "O concerto foi mesmo fixe ontem.", culturalContext: "Empréstimo do português europeu, integrado no calão angolano.", category: "gíria" },
  { term: "Bue", definition: "Muito, bastante. Intensificador universal.", example: "Tá bue quente hoje, não?", culturalContext: "A gíria mais usada de Angola. Pode intensificar qualquer adjectivo.", category: "gíria" },
  { term: "Muita pinta", definition: "Muito bom, excelente, impressionante.", example: "Esse outfit dela é muita pinta.", culturalContext: "Expressão de elogio forte.", category: "expressão" },
  { term: "Makas", definition: "Problemas, confusão, encrenca.", example: "Não me venhas com makas hoje.", culturalContext: "Palavra essencial para descrever problemas do quotidiano angolano.", category: "gíria" },
  { term: "Mambo", definition: "Assunto, situação, coisa. Substituto genérico para qualquer substantivo.", example: "Esse mambo dos impostos tá me a chatear.", culturalContext: "Versátil de origem Kimbundu.", category: "gíria" },
  { term: "Gasosa", definition: "Suborno, propina.", example: "Pediram-me gasosa para me deixar passar.", culturalContext: "Reflecte a realidade da corrupção informal em Angola.", category: "gíria" },
  { term: "Kandonga", definition: "Comércio informal, mercado paralelo.", example: "Comprei o telemóvel na kandonga mais barato.", culturalContext: "Realidade económica central em Angola.", category: "expressão" },
  { term: "Zungueiro", definition: "Vendedor ambulante que percorre as ruas com mercadoria na cabeça.", example: "A zungueira passou a vender quizaca fresca.", culturalContext: "Figura icónica de Luanda.", category: "expressão" },
  { term: "Funje", definition: "Papa de farinha de mandioca ou milho. Acompanhamento base da gastronomia angolana.", example: "Sem funje não é refeição completa.", culturalContext: "Comido com os dedos em ambiente familiar.", category: "gastronomia" },
  { term: "Quizaca", definition: "Folhas de mandioca cozidas e temperadas.", example: "Hoje tem quizaca com peixe, vais gostar.", culturalContext: "Prato fundamental da cozinha angolana.", category: "gastronomia" },
  { term: "Muamba", definition: "Guisado de frango com palma, óleo de palma, alho e especiarias. Prato nacional.", example: "A muamba de galinha da minha mãe é a melhor.", culturalContext: "Considerado um dos pratos nacionais de Angola.", category: "gastronomia" },
  { term: "Cacuso", definition: "Dinheiro, especialmente dinheiro vivo.", example: "Não aceito cartão, só cacuso.", culturalContext: "Gíria financeira muito comum.", category: "gíria" },
  { term: "Farra", definition: "Festa, celebração, diversão em grupo.", example: "Vai ter uma farra grande lá em casa no sábado.", culturalContext: "Os angolanos são conhecidos pela cultura de festas.", category: "gíria" },
  { term: "Musseque", definition: "Bairro periférico, subúrbio pobre de Luanda.", example: "Cresci no musseque, mas hoje vivo na cidade.", culturalContext: "Os musseques são parte essencial da identidade de Luanda.", category: "expressão" },
  { term: "Tô na boa", definition: "Estou bem, estou óptimo, tudo certo.", example: "— Como estás? — Tô na boa, obrigado.", culturalContext: "Forma relaxada de dizer que está bem.", category: "expressão" },
  { term: "Tá osso", definition: "Está difícil, está complicado.", example: "Arranjar emprego agora tá osso mesmo.", culturalContext: "Expressa dificuldade de uma situação de vida.", category: "expressão" },
  { term: "Muqueca", definition: "Avarento, mão fechada.", example: "Não peças nada a ele, é um muqueca.", culturalContext: "Característica social vista muito negativamente — a generosidade é muito valorizada.", category: "gíria" },
];

const ANGOLA_PLACE_IDS = ["luanda","kalandula","quicama","benguela","huambo","namibe","ilha-luanda","cabo-ledo","lobito","pungo-andongo","cuando","barra-cuanza"];

async function ensureGiriasSeeded() {
  const existing = await db.select().from(giriasTable).limit(1);
  if (existing.length === 0) await db.insert(giriasTable).values(GIRIAS_DATASET);
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

const TRAVEL_KEYWORDS = ["luanda","benguela","huambo","namibe","malanje","lobito","kalandula","quiçama","kissama","cabo ledo","ilha","musseque","musseques","angola","viagem","viajar","visitar","turismo","morar","cidade","praias","natureza","parque nacional","quedas","waterfall","safari","tecnologia angola","tech angola","bairro","musseque","zango","talatona","miramar","maianga","rangel","cazenga"];

function detectTravelIntent(message: string): boolean {
  const lower = message.toLowerCase();
  return TRAVEL_KEYWORDS.some((kw) => lower.includes(kw));
}

router.post("/chat", async (req, res) => {
  try {
    const body = SendChatMessageBody.parse(req.body);
    const { message, userId, userName, country, isAngolan, travelMode } = body;

    const match = await findGiriaMatch(message);
    if (match) {
      res.json({
        response: `**${match.term}**\n\n${match.definition}\n\n**Exemplo:** *"${match.example}"*\n\n**Contexto:** ${match.culturalContext}`,
        source: "dataset",
        matchedGiria: match.term,
        conversationId: 1,
        travelData: null,
      });
      return;
    }

    const girias = await db.select().from(giriasTable);
    const giriaContext = girias.map((g) => `- "${g.term}": ${g.definition}`).join("\n");

    let personalization = "";
    if (userName) personalization += `O utilizador chama-se ${userName}. `;
    if (isAngolan === true) personalization += `É angolano(a). Usa gírias quando surgir naturalmente.`;
    else if (isAngolan === false && country) personalization += `É de ${country}. Fala português padrão.`;

    const shouldReturnTravel = travelMode || detectTravelIntent(message);

    const systemPrompt = shouldReturnTravel
      ? `És o Nzila, assistente de IA especializado em Angola. ${personalization}

Tens acesso a este dicionário de gírias: ${giriaContext}

Lista de lugares em Angola disponíveis no sistema: ${ANGOLA_PLACE_IDS.join(", ")}.

Quando o utilizador perguntar sobre locais, viagens ou lugares em Angola, deves SEMPRE responder com JSON no formato EXATO abaixo (sem mais nada além do JSON):
{
  "message": "resposta natural em português sobre os lugares",
  "placeNames": ["id1", "id2"],
  "focusName": "nome do lugar principal em português",
  "focusLat": -8.8368,
  "focusLng": 13.2344,
  "focusZoom": 12
}

Usa os IDs da lista fornecida. Se não souber o lugar exacto, usa "luanda" como foco.
Regras: sê natural, informativo e directo. Não forces gírias.`
      : `És o Nzila, assistente de IA especializado em Angola. ${personalization}

Gírias disponíveis: ${giriaContext}

Sê natural, directo e informativo. Usa formatação Markdown quando adequado. Nunca inventes factos.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 8192,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
    });

    const rawResponse = completion.choices[0]?.message?.content ?? "";

    if (shouldReturnTravel) {
      try {
        const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          res.json({
            response: parsed.message ?? rawResponse,
            source: "ai",
            matchedGiria: null,
            conversationId: 1,
            travelData: {
              placeNames: parsed.placeNames ?? [],
              focus: {
                name: parsed.focusName ?? "Angola",
                mapLat: parsed.focusLat ?? -11.2027,
                mapLng: parsed.focusLng ?? 17.8739,
                mapZoom: parsed.focusZoom ?? 6,
              },
            },
          });
          return;
        }
      } catch {}
    }

    res.json({
      response: rawResponse,
      source: "ai",
      matchedGiria: null,
      conversationId: 1,
      travelData: null,
    });
  } catch (err) {
    req.log.error({ err }, "Chat error");
    res.status(500).json({ error: "Erro interno" });
  }
});

router.get("/girias", async (req, res) => {
  try {
    await ensureGiriasSeeded();
    res.json(await db.select().from(giriasTable));
  } catch (err) {
    req.log.error({ err }, "Error fetching girias");
    res.status(500).json({ error: "Erro interno" });
  }
});

router.get("/ranking/:userId", async (req, res) => {
  try {
    const user = await ensureUser(req.params.userId);
    res.json({ userId: user.id, level: user.level, approvedContributions: user.approvedContributions, totalContributions: user.totalContributions, isBlocked: user.isBlocked });
  } catch (err) {
    req.log.error({ err }, "Error fetching ranking");
    res.status(500).json({ error: "Erro interno" });
  }
});

router.get("/contributions", async (req, res) => {
  try {
    res.json(await db.select().from(contributionsTable));
  } catch (err) {
    res.status(500).json({ error: "Erro interno" });
  }
});

router.post("/contributions", async (req, res) => {
  try {
    const body = CreateContributionBody.parse(req.body);
    const { userId, term, definition, example } = body;
    const user = await ensureUser(userId);

    if (user.isBlocked) { res.status(403).json({ error: "A tua conta está bloqueada." }); return; }

    let status = "pending";
    if (user.level === "Confiável") status = "auto_approved";
    else if (user.level === "Horrível") { res.status(403).json({ error: "O teu nível não permite contribuições." }); return; }

    const duplicates = await db.select().from(giriasTable).where(ilike(giriasTable.term, term));
    if (duplicates.length > 0) { res.status(409).json({ error: "Esta gíria já existe!" }); return; }

    const [contribution] = await db.insert(contributionsTable).values({ userId, term, definition, example, status }).returning();
    await db.update(usersTable).set({ totalContributions: user.totalContributions + 1 }).where(eq(usersTable.id, userId));

    res.status(201).json({
      message: status === "auto_approved" ? "Gíria integrada automaticamente (nível Confiável)." : "Obrigado! Em fila de moderação.",
      status,
      contributionId: contribution.id,
    });
  } catch (err) {
    req.log.error({ err }, "Error creating contribution");
    res.status(500).json({ error: "Erro interno" });
  }
});

export default router;
