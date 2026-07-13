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
  // Saudações e formas de tratamento
  { term: "Kamba", definition: "Amigo, camarada, parceiro de confiança.", example: "Esse é o meu kamba de infância.", culturalContext: "Origem Kimbundu. Usado entre amigos próximos, não é forçado no início de conversa.", category: "gíria" },
  { term: "Kota", definition: "Pessoa mais velha que merece respeito. Também pode ser um padrinho ou figura de autoridade.", example: "Vou falar com o kota lá do bairro para resolver isso.", culturalContext: "Palavra de origem Kimbundu. Expressa respeito hierárquico na cultura angolana.", category: "gíria" },
  { term: "Mano", definition: "Irmão, amigo próximo. Forma de tratamento afectuosa.", example: "Mano, não acreditas no que aconteceu hoje.", culturalContext: "Muito usado em Luanda entre jovens, semelhante ao 'cara' no Brasil.", category: "gíria" },
  { term: "Diê", definition: "Interjeição de surpresa, admiração ou concordância. Equivalente a 'uau' ou 'nossa'.", example: "Diê, essa notícia é mesmo séria?", culturalContext: "Uma das interjeições mais características do calão angolano.", category: "expressão" },
  { term: "Xiça", definition: "Interjeição de surpresa, susto ou espanto. Mais enfático que 'diê'.", example: "Xiça! Quase que o carro me atropelou.", culturalContext: "Expressão muito comum no quotidiano de Luanda.", category: "expressão" },

  // Ações e movimentos
  { term: "Bora", definition: "Vamos, vem. Convite ou incitamento a ir a algum lugar.", example: "Bora ali tomar um suco antes de voltarmos.", culturalContext: "Contração de 'vamos embora'. Central no falar dos jovens angolanos.", category: "expressão" },
  { term: "Cuia", definition: "Andar, mover-se, partir. Às vezes tem conotação de fugir ou ir embora rapidamente.", example: "Cuia daqui antes que ele chegue.", culturalContext: "Muito usado para indicar movimento ou saída rápida de um local.", category: "gíria" },
  { term: "Bazar", definition: "Ir embora, sair de um lugar, muitas vezes de forma abrupta.", example: "Ele bazou sem dizer nada a ninguém.", culturalContext: "Utilizado quando alguém sai de forma inesperada ou sem avisar.", category: "gíria" },
  { term: "Marchar", definition: "Ir embora, caminhar, partir. Similar a 'andar' ou 'avançar'.", example: "Já está tarde, vou marchar.", culturalContext: "Influência do português angolano, muito comum no dia a dia.", category: "gíria" },
  { term: "Curtir", definition: "Gostar, aproveitar, divertir-se. Expressa satisfação ou apreciação.", example: "Curto muito esse tipo de música.", culturalContext: "Uso muito próximo do português brasileiro, amplamente adoptado em Angola.", category: "gíria" },

  // Avaliações e qualidades
  { term: "Fixe", definition: "Bom, óptimo, agradável. Usado para expressar aprovação.", example: "O concerto foi mesmo fixe ontem.", culturalContext: "Empréstimo do português europeu, completamente integrado no calão angolano.", category: "gíria" },
  { term: "Bue", definition: "Muito, bastante. Intensificador universal.", example: "Tá bue quente hoje, não?", culturalContext: "Talvez a gíria mais usada de Angola. Pode intensificar qualquer adjectivo.", category: "gíria" },
  { term: "Muita pinta", definition: "Muito bom, excelente, impressionante.", example: "Esse outfit dela é muita pinta.", culturalContext: "Expressão de elogio forte, usada para coisas ou pessoas que se destacam.", category: "expressão" },
  { term: "Tá na moda", definition: "Está na tendência, é popular, está em voga.", example: "Esse corte de cabelo tá na moda agora.", culturalContext: "Usado para descrever tendências culturais ou de estilo.", category: "expressão" },
  { term: "Porreiro", definition: "Bom, agradável, simpático. Caracteriza pessoas ou situações positivas.", example: "É um miúdo porreiro, sempre a ajudar.", culturalContext: "Empréstimo do português europeu comum em Angola.", category: "gíria" },

  // Situações e contextos
  { term: "Makas", definition: "Problemas, confusão, encrenca. Situação difícil ou complicada.", example: "Não me venhas com makas hoje, já tou cansado.", culturalContext: "Palavra essencial para descrever problemas do quotidiano angolano.", category: "gíria" },
  { term: "Mambo", definition: "Assunto, situação, coisa. Substituto genérico para qualquer substantivo.", example: "Esse mambo dos impostos tá me a chatear.", culturalContext: "Versatile de origem Kimbundu. Pode significar qualquer coisa dependendo do contexto.", category: "gíria" },
  { term: "Esquema", definition: "Plano, estratégia, arranjo informal. Também pode ser um negócio ou acordo.", example: "Tenho um esquema para arranjar bilhetes.", culturalContext: "Muito usado para descrever planos informais ou formas de resolver problemas.", category: "gíria" },
  { term: "Gasosa", definition: "Suborno, propina. Dinheiro pago ilegalmente para facilitar algo.", example: "Pediram-me gasosa para me deixar passar.", culturalContext: "Palavra que reflecte a realidade da corrupção informal muito presente em Angola.", category: "gíria" },
  { term: "Buscafé", definition: "Pessoa que procura sempre tirar vantagem dos outros, vive à custa de terceiros.", example: "Não o convides, ele é um buscafé.", culturalContext: "Expressão social importante para identificar comportamentos parasitas.", category: "gíria" },

  // Comércio e economia informal
  { term: "Kandonga", definition: "Comércio informal, mercado paralelo. Venda de produtos fora dos canais oficiais.", example: "Comprei o telemóvel na kandonga mais barato.", culturalContext: "Realidade económica central em Angola, vital para a sobrevivência de muitas famílias.", category: "expressão" },
  { term: "Zungueiro", definition: "Vendedor ambulante que percorre as ruas com mercadoria, muitas vezes na cabeça.", example: "A zungueira passou a vender quizaca fresca.", culturalContext: "Figura icónica de Luanda. As zungueiras são maioritariamente mulheres.", category: "expressão" },
  { term: "Funje", definition: "Papa de farinha de mandioca ou milho. Acompanhamento base da gastronomia angolana.", example: "Sem funje não é refeição completa para um angolano.", culturalContext: "Alimento central na cultura angolana. Comido com os dedos em ambiente familiar.", category: "gastronomia" },
  { term: "Quizaca", definition: "Folhas de mandioca cozidas e temperadas. Prato típico angolano.", example: "Hoje tem quizaca com peixe, vais gostar.", culturalContext: "Prato fundamental da cozinha angolana, especialmente popular no norte do país.", category: "gastronomia" },
  { term: "Muamba", definition: "Guisado de frango ou galinha com palma, óleo de palma, alho e especiarias. Prato nacional.", example: "A muamba de galinha da minha mãe é a melhor.", culturalContext: "Considerado um dos pratos nacionais de Angola. Símbolo da identidade culinária angolana.", category: "gastronomia" },
  { term: "Cacuso", definition: "Dinheiro, especialmente dinheiro vivo (cash).", example: "Não aceito cartão, só cacuso.", culturalContext: "Gíria financeira muito comum, reflecte a preferência pelo dinheiro físico em Angola.", category: "gíria" },

  // Vida social e relações
  { term: "Camarada", definition: "Companheiro, colega. Herdado da época socialista, mas ainda em uso quotidiano.", example: "O camarada director chegou atrasado à reunião.", culturalContext: "Resquício da era MPLA socialista. Ainda muito usado em contextos formais e informais.", category: "expressão" },
  { term: "Farra", definition: "Festa, celebração, diversão em grupo.", example: "Vai ter uma farra grande lá em casa no sábado.", culturalContext: "Os angolanos são conhecidos pela sua cultura de festas e convívio social.", category: "gíria" },
  { term: "Gamar", definition: "Roubar, furtar. Também pode significar conquistar alguém romanticamente.", example: "Gamaram-me o telemóvel na paragem.", culturalContext: "Gíria de duplo sentido muito usada no calão jovem angolano.", category: "gíria" },
  { term: "Bichar", definition: "Estar na bicha (fila). Esperar em fila.", example: "Tive de bichar duas horas no banco.", culturalContext: "Derivado de 'bicha' (fila em português europeu). Completamente naturalizado em Angola.", category: "gíria" },
  { term: "Cabrocha", definition: "Rapariga bonita, mulher atraente. Usado com conotação positiva.", example: "A cabrocha nova do bairro é bue simpática.", culturalContext: "Expressão de origem crioula usada em Angola e em alguns PALOP.", category: "gíria" },

  // Expressões de estado e sentimento
  { term: "Tô na boa", definition: "Estou bem, estou óptimo, tudo certo comigo.", example: "— Como estás? — Tô na boa, obrigado.", culturalContext: "Forma relaxada de dizer que está bem. Muito comum como resposta a cumprimentos.", category: "expressão" },
  { term: "Tá osso", definition: "Está difícil, está complicado. Situação difícil de resolver.", example: "Arranjar emprego agora tá osso mesmo.", culturalContext: "Expressa dificuldade ou dureza de uma situação de vida.", category: "expressão" },
  { term: "Suka", definition: "Vai embora, sai daqui. Forma directa de mandar alguém embora.", example: "Suka daqui, não tou para brincadeiras hoje.", culturalContext: "Expressão directa e assertiva. Pode ser agressiva dependendo do tom.", category: "gíria" },
  { term: "Caxinde", definition: "Homem atrevido, sem vergonha, que age sem pudor.", example: "Que caxinde, chegou sem ser convidado.", culturalContext: "Descreve comportamentos socialmente inadequados ou ousados.", category: "gíria" },
  { term: "Muqueca", definition: "Avarento, mão fechada, que não gosta de gastar dinheiro.", example: "Não peças nada a ele, é um muqueca.", culturalContext: "Característica social vista muito negativamente na cultura angolana, onde a generosidade é valorizada.", category: "gíria" },

  // Lugares e contextos urbanos
  { term: "Musseque", definition: "Bairro periférico, subúrbio pobre de Luanda. Área de habitação informal.", example: "Cresci no musseque, mas hoje vivo na cidade.", culturalContext: "Os musseques são parte essencial da identidade de Luanda. Há uma cultura rica e única neles.", category: "expressão" },
  { term: "Marginal", definition: "A avenida principal à beira-mar de Luanda. Também pode referir-se a uma pessoa marginalizada.", example: "Fomos passear no Marginal ao fim da tarde.", culturalContext: "A Marginal é um dos pontos de encontro mais icónicos de Luanda.", category: "expressão" },
  { term: "Paragem", definition: "Ponto de paragem de autocarro ou táxi. Local de espera para transportes.", example: "Encontrei-o na paragem da Maianga.", culturalContext: "Central na mobilidade urbana de Luanda, onde os transportes informais dominam.", category: "expressão" },
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
        response: `**${match.term}**\n\n${match.definition}\n\n**Exemplo:** *"${match.example}"*\n\n**Contexto:** ${match.culturalContext}`,
        source: "dataset",
        matchedGiria: match.term,
        conversationId: 1,
      });
      return;
    }

    const girias = await db.select().from(giriasTable);
    const giriaContext = girias.map((g) => `- "${g.term}": ${g.definition}`).join("\n");

    let personalization = "";
    if (userName) personalization += `O utilizador chama-se ${userName}. `;
    if (isAngolan === true) {
      personalization += `É angolano(a). Podes usar gírias e expressões locais quando surgir naturalmente na conversa, não forçar.`;
    } else if (isAngolan === false && country) {
      personalization += `É de ${country}. Fala em português padrão, mas podes mencionar expressões angolanas quando fizer sentido explicá-las.`;
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 8192,
      messages: [
        {
          role: "system",
          content: `És o Nzila, um assistente de IA com profundo conhecimento sobre Angola: história, cultura, línguas nacionais (Kimbundu, Umbundu, Kikongo), gastronomia, música (kuduro, semba, kizomba), política e quotidiano.

${personalization}

Tens acesso a este dicionário de gírias angolanas para referência:
${giriaContext}

Regras de comportamento:
- Responde sempre em português. Usa gírias angolanas apenas quando surge organicamente na conversa, nunca as forces.
- Sê natural e directo. Não repitas saudações em cada mensagem.
- Quando explicas gírias ou cultura angolana, sê preciso e contextualiza bem.
- Usa formatação Markdown quando a resposta beneficia disso (listas, negrito para termos, etc.).
- Nunca inventes factos sobre Angola — se não tens certeza, diz isso claramente.`,
        },
        { role: "user", content: message },
      ],
    });

    res.json({
      response: completion.choices[0]?.message?.content ?? "Não consegui processar a tua mensagem.",
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
    if (user.level === "Confiável") status = "auto_approved";
    else if (user.level === "Horrível") {
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
        ? "A tua gíria foi integrada automaticamente (nível Confiável)."
        : "Obrigado pela contribuição! Está em fila de moderação.",
      status,
      contributionId: contribution.id,
    });
  } catch (err) {
    req.log.error({ err }, "Error creating contribution");
    res.status(500).json({ error: "Erro interno" });
  }
});

export default router;
