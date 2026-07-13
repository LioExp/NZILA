export interface AngolaPlace {
  id: string;
  name: string;
  description: string;
  lat: number;
  lng: number;
  imageUrl: string;
  category: "cidade" | "natureza" | "praia" | "cultura" | "parque";
  province: string;
  tags: string[];
}

export const ANGOLA_PLACES: AngolaPlace[] = [
  {
    id: "luanda",
    name: "Luanda",
    description: "Capital e maior cidade de Angola, com uma das baías mais belas de África. Centro económico, cultural e histórico do país.",
    lat: -8.8368,
    lng: 13.2344,
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Luanda_from_above_2.jpg/640px-Luanda_from_above_2.jpg",
    category: "cidade",
    province: "Luanda",
    tags: ["capital", "urbano", "baía", "marginal"],
  },
  {
    id: "kalandula",
    name: "Quedas do Kalandula",
    description: "Uma das maiores e mais imponentes quedas de água de África, com 105 metros de altura e 400 metros de largura. Um espetáculo natural incrível no Malanje.",
    lat: -9.0786,
    lng: 16.0183,
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Quedas_do_Kalandula.jpg/640px-Quedas_do_Kalandula.jpg",
    category: "natureza",
    province: "Malanje",
    tags: ["cascata", "natureza", "maravilha", "malanje"],
  },
  {
    id: "quicama",
    name: "Parque Nacional do Quiçama",
    description: "O maior parque nacional de Angola, com savanas, florestas e vida selvagem diversa. Lar de elefantes, hipopótamos, búfalos e centenas de espécies de aves.",
    lat: -9.9000,
    lng: 13.5000,
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/African_Bush_Elephant.jpg/640px-African_Bush_Elephant.jpg",
    category: "parque",
    province: "Bengo",
    tags: ["safari", "wildlife", "elefantes", "natureza"],
  },
  {
    id: "benguela",
    name: "Benguela",
    description: "Cidade histórica costeira com arquitetura colonial portuguesa bem preservada. Conhecida pelas praias, pelo clima ameno e pela sua gastronomia de frutos do mar.",
    lat: -12.5751,
    lng: 13.4055,
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Benguela_City_Center.jpg/640px-Benguela_City_Center.jpg",
    category: "cidade",
    province: "Benguela",
    tags: ["colonial", "praia", "histórico", "cultura"],
  },
  {
    id: "huambo",
    name: "Huambo",
    description: "Segunda maior cidade de Angola, no planalto central, com clima fresco e temperaturas agradáveis. Conhecida como a 'Cidade das Acácias'.",
    lat: -12.7761,
    lng: 15.7396,
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Huambo_Aerial.jpg/640px-Huambo_Aerial.jpg",
    category: "cidade",
    province: "Huambo",
    tags: ["planalto", "acácias", "fresco", "central"],
  },
  {
    id: "namibe",
    name: "Namibe",
    description: "Cidade onde o deserto do Namib encontra o Oceano Atlântico. Paisagens de dunas de areia vermelha junto ao mar criam um cenário único e surreal.",
    lat: -15.1939,
    lng: 12.1522,
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Namib_desert_SPOT_1189.jpg/640px-Namib_desert_SPOT_1189.jpg",
    category: "natureza",
    province: "Namibe",
    tags: ["deserto", "namib", "dunas", "oceano"],
  },
  {
    id: "ilha-luanda",
    name: "Ilha de Luanda",
    description: "Estreita península de areia com praias de água morna, restaurantes de peixe fresco e a melhor vida noturna de Luanda. O destino de fim de semana favorito dos luandenses.",
    lat: -8.8167,
    lng: 13.2333,
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Ilha_de_Luanda.jpg/640px-Ilha_de_Luanda.jpg",
    category: "praia",
    province: "Luanda",
    tags: ["praia", "peixe", "festa", "luanda"],
  },
  {
    id: "cabo-ledo",
    name: "Cabo Ledo",
    description: "Destino de surf de renome internacional, com ondas poderosas e selvagens. Praias desertas de areia dourada a poucos quilómetros de Luanda.",
    lat: -9.3333,
    lng: 13.0833,
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Cabo_Ledo_surf.jpg/640px-Cabo_Ledo_surf.jpg",
    category: "praia",
    province: "Bengo",
    tags: ["surf", "praia", "ondas", "selvagem"],
  },
  {
    id: "lobito",
    name: "Lobito",
    description: "Porto de águas profundas com uma restinga única — a Restinga de Lobito — com 5 km de praias tranquilas entre o oceano e a lagoa. Ponto de partida do Caminho de Ferro de Benguela.",
    lat: -12.3600,
    lng: 13.5450,
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Lobito_Port.jpg/640px-Lobito_Port.jpg",
    category: "cidade",
    province: "Benguela",
    tags: ["restinga", "porto", "praia", "caminho-de-ferro"],
  },
  {
    id: "pungo-andongo",
    name: "Pedras do Pungo Andongo",
    description: "Formações rochosas gigantescas e misteriosas no Malanje, com lendas históricas ligadas à rainha Nzinga. Um sítio arqueológico e cultural de enorme importância para Angola.",
    lat: -9.6667,
    lng: 15.5833,
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Pungo_Andongo.jpg/640px-Pungo_Andongo.jpg",
    category: "cultura",
    province: "Malanje",
    tags: ["pedras", "nzinga", "história", "arqueologia"],
  },
  {
    id: "cuando",
    name: "Rio Cuando",
    description: "Rio de fronteira com a Zâmbia, conhecido pela pesca de tilápia e por safaris fluviais. A área do Cuando-Cubango é um dos ecossistemas mais intocados de África.",
    lat: -14.0000,
    lng: 21.0000,
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Okavango_delta.jpg/640px-Okavango_delta.jpg",
    category: "natureza",
    province: "Cuando Cubango",
    tags: ["rio", "pesca", "safari", "fronteira"],
  },
  {
    id: "barra-cuanza",
    name: "Barra do Cuanza",
    description: "Onde o maior rio de Angola desagua no Atlântico. Praias extensas, pesca desportiva, pássaros flamingos e crocodilos partilham este delta espetacular.",
    lat: -9.3167,
    lng: 13.1500,
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Greater_flamingo_Portugal.jpg/640px-Greater_flamingo_Portugal.jpg",
    category: "natureza",
    province: "Bengo",
    tags: ["delta", "flamingos", "pesca", "natureza"],
  },
];

export function findPlacesByNames(names: string[]): AngolaPlace[] {
  const lower = names.map((n) => n.toLowerCase());
  return ANGOLA_PLACES.filter((p) =>
    lower.some((n) => p.name.toLowerCase().includes(n) || p.id.includes(n) || p.tags.some((t) => n.includes(t)))
  );
}

export function findPlaceById(id: string): AngolaPlace | undefined {
  return ANGOLA_PLACES.find((p) => p.id === id);
}
