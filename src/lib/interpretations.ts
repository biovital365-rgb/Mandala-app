export const baseInterpretations: Record<number, { subtitle: string, desc: string, essence: string, challenges: string[], gift: string }> = {
  // ... (keeping the existing numbers 1-33 as base)
  1: {
    subtitle: "El Pionero Independiente",
    desc: "El camino de la individualidad y el liderazgo original.",
    essence: "Fuerza iniciadora y voluntad inquebrantable.",
    challenges: ["Egoísmo", "Impaciencia", "Dificultad para delegar"],
    gift: "Liderazgo inspirador"
  },
  2: {
    subtitle: "El Pacificador Sensible",
    desc: "El camino de la cooperación y la armonía.",
    essence: "Empatía, diplomacia y equilibrio.",
    challenges: ["Codependencia", "Hipersensibilidad", "Miedo al conflicto"],
    gift: "Mediación sabia"
  },
  3: {
    subtitle: "El Comunicador Creativo",
    desc: "El camino de la expresión y la alegría.",
    essence: "Creatividad, brillo social y comunicación.",
    challenges: ["Dispersión", "Superficialidad", "Vanidad"],
    gift: "Inspiración optimista"
  },
  4: {
    subtitle: "El Constructor Disciplinado",
    desc: "El camino de la estabilidad y el trabajo.",
    essence: "Orden, raíces y manifestación concreta.",
    challenges: ["Rigidez", "Testarudez", "Miedo al cambio"],
    gift: "Manifestación física"
  },
  5: {
    subtitle: "El Explorador Libre",
    desc: "El camino del cambio y la aventura.",
    essence: "Libertad, adaptabilidad y curiosidad.",
    challenges: ["Inconstancia", "Excesos", "Evasión"],
    gift: "Catalizador de cambio"
  },
  6: {
    subtitle: "El Sanador Amoroso",
    desc: "El camino del servicio y la armonía.",
    essence: "Amor, responsabilidad y nutrición.",
    challenges: ["Sobreprotección", "Perfeccionismo", "Culpa"],
    gift: "Amor incondicional"
  },
  7: {
    subtitle: "El Buscador de la Verdad",
    desc: "El camino de la sabiduría y el análisis.",
    essence: "Introspección, mente analítica y fe.",
    challenges: ["Aislamiento", "Cinismo", "Fraldad"],
    gift: "Sabiduría interior"
  },
  8: {
    subtitle: "El Líder Ejecutivo",
    desc: "El camino del poder y la abundancia.",
    essence: "Autoridad, éxito material y equilibrio energético.",
    challenges: ["Ambición desmedida", "Dureza", "Materialismo"],
    gift: "Liderazgo justo"
  },
  9: {
    subtitle: "El Filántropo Universal",
    desc: "El camino de la compasión y el cierre.",
    essence: "Amor universal, sabiduría y entrega.",
    challenges: ["Víctima", "Dificultad para soltar", "Fanatismo"],
    gift: "Faro de luz"
  },
  11: {
    subtitle: "El Maestro Espiritual",
    desc: "El camino de la intuición y la iluminación.",
    essence: "Canalización, visión y alta sensibilidad.",
    challenges: ["Inestabilidad", "Miedo al poder", "Nerviosismo"],
    gift: "Iluminación colectiva"
  },
  22: {
    subtitle: "El Arquitecto del Destino",
    desc: "El camino de la gran construcción.",
    essence: "Visión global y capacidad de manifestación masiva.",
    challenges: ["Sentirse abrumado", "Dictadura", "Ego"],
    gift: "Legado duradero"
  },
  33: {
    subtitle: "El Guía Compasivo",
    desc: "El camino del amor crístico.",
    essence: "Sanación universal y sacrificio amoroso.",
    challenges: ["Martirio", "Carga excesiva", "Intervencionismo"],
    gift: "Gracia divina"
  }
};

const pillarNuances: Record<string, Record<number, string>> = {
  esencia: {
    1: "Tu alma pide a gritos libertad para crear algo único.",
    2: "Tu fuerza interna reside en tu capacidad de conectar con otros.",
    3: "Has venido a brillar y a comunicar la alegría divina.",
    4: "Tu paz interior se encuentra en el orden y la estructura.",
    5: "Tu espíritu necesita movimiento y experiencias variadas.",
    6: "Tu corazón late por el bienestar de tu familia y comunidad.",
    7: "Tu alma busca la soledad fértil para encontrar respuestas.",
    8: "Tu poder interno espera ser usado para crear abundancia.",
    9: "Tu esencia es la del sabio que ha recorrido mil vidas.",
    11: "Eres una antena receptora de verdades espirituales.",
    22: "Tienes la semilla de un constructor de mundos en tu alma.",
    33: "Tu vibración es una de las más puras de amor y sanación."
  },
  mision: {
    1: "Tu destino es abrir nuevos caminos donde otros no se atreven.",
    2: "Tu camino de vida implica aprender a colaborar sin perderte.",
    3: "Tu misión es inspirar a través del arte y el entusiasmo.",
    4: "Has venido a construir algo sólido y perdurable en el tiempo.",
    5: "Tu propósito es romper viejas estructuras y traer renovación.",
    6: "Tu misión es armonizar y sanar a través del amor y el servicio.",
    7: "Has venido a investigar, estudiar y revelar verdades profundas.",
    8: "Tu camino te lleva a la maestría sobre el mundo material.",
    9: "Tu propósito es servir a la humanidad y cerrar ciclos del alma.",
    11: "Tu misión es ser un faro de inspiración para las masas.",
    22: "Has venido a realizar proyectos de escala internacional.",
    33: "Tu propósito es la entrega absoluta al bienestar universal."
  },
  regalo: {
    1: "Recibes la bendición de la voluntad inquebrantable.",
    2: "Se te ha dado el don de la intuición y la diplomacia natural.",
    3: "Tu regalo es la elocuencia y la capacidad de alegrar a otros.",
    4: "Posees la bendición de la paciencia y la organización extrema.",
    5: "Tu don es la eterna juventud y la adaptabilidad infinita.",
    6: "Recibes el regalo de la sanación a través de tu presencia.",
    7: "Tu don es la mente prodigiosa y la conexión con lo arcano.",
    8: "Se te otorga la capacidad de manifestar riqueza con facilidad.",
    9: "Tu regalo es el desapego y la sabiduría de las edades.",
    11: "Posees el don de la clarividencia y la guía angélica.",
    22: "Tu regalo es el poder de convertir sueños en rascacielos reales.",
    33: "Recibes la gracia de la compasión infinita del creador."
  }
};

export function getDetailedInterpretation(pillar: string, number: number) {
  const base = baseInterpretations[number] || baseInterpretations[1];
  const nuance = pillarNuances[pillar]?.[number] || "Tu vibración en este pilar es potente y equilibrada.";

  let title = "Pilar Sagrado";
  switch (pillar) {
    case 'esencia': title = "Esencia (Alma)"; break;
    case 'mision': title = "Misión de Vida"; break;
    case 'nombre': title = "Vibración del Nombre"; break;
    case 'ano': title = "Año Personal"; break;
    case 'regalo': title = "Regalo Divino"; break;
  }

  return {
    ...base,
    title,
    essence: nuance // Sobrescribimos con el matiz del pilar
  };
}
