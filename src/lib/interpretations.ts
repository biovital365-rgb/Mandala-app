export const baseInterpretations: Record<number, { subtitle: string, desc: string, essence: string, challenges: string[], gift: string }> = {
  1: {
    subtitle: "El Arquitecto de la Voluntad",
    desc: "Representa el impulso primordial, la semilla de la creación y la capacidad de manifestar una nueva realidad a través de la acción independiente.",
    essence: "Posees una fuerza iniciadora natural. Tu vibración resuena con la innovación y el coraje de caminar senderos no transitados.",
    challenges: ["Autoritarismo", "Impulsividad ciega", "Miedo al fracaso que paraliza la acción"],
    gift: "Capacidad de liderazgo pionero y originalidad absoluta."
  },
  2: {
    subtitle: "El Guardián de la Armonía",
    desc: "Simboliza la dualidad consciente, la diplomacia y el poder de la sutileza. Es el puente entre los opuestos.",
    essence: "Tu fortaleza no reside en la fuerza bruta, sino en la receptividad y la capacidad de unir voluntades dispersas en un propósito común.",
    challenges: ["Indecisión", "Dependencia emocional", "Supresión de las propias necesidades"],
    gift: "Intuición profunda y maestría en la resolución de conflictos."
  },
  3: {
    subtitle: "El Alquimista de la Expresión",
    desc: "Es la vibración de la expansión creativa, la comunicación inspirada y la alegría como herramienta de transformación.",
    essence: "Tienes el don de dar voz a las emociones. Tu presencia actúa como un catalizador de entusiasmo y brillo creativo.",
    challenges: ["Dispersión de energía", "Búsqueda de validación externa", "Superficialidad"],
    gift: "Comunicación que sana e inspira a otros."
  },
  4: {
    subtitle: "El Maestro de la Estructura",
    desc: "Representa la manifestación en el plano físico, la disciplina necesaria para convertir visiones etéreas en realidades tangibles y duraderas.",
    essence: "Eres el pilar de estabilidad. Tu vibración aporta orden al caos y construye los cimientos sobre los que otros caminan seguros.",
    challenges: ["Rigidez mental", "Resistencia al cambio necesario", "Exceso de pragmatismo"],
    gift: "Capacidad de construir legados sólidos y organización impecable."
  },
  5: {
    subtitle: "El Viajero de la Transformación",
    desc: "Simboliza la libertad responsable, el movimiento constante y la búsqueda de expansión a través de la experiencia directa.",
    essence: "Tu espíritu es indomable y curioso. Actúas como un puente entre tradiciones, trayendo renovación y frescura donde hay estancamiento.",
    challenges: ["Inestabilidad", "Propensión a los excesos", "Dificultad para enraizar"],
    gift: "Adaptabilidad extraordinaria y visión progresista."
  },
  6: {
    subtitle: "El Fiel Custodio del Equilibrio",
    desc: "Vibración del servicio amoroso, la responsabilidad familiar y la búsqueda de la belleza y la justicia en todas las formas.",
    essence: "Tu frecuencia es la del protector. Encuentras tu mayor realización al nutrir y sostener la armonía en tu entorno cercano.",
    challenges: ["Perfeccionismo asfixiante", "Sacrificio excesivo (martirio)", "Injerencia en vidas ajenas"],
    gift: "Amor incondicional y habilidad innata para el consejo y la sanación."
  },
  7: {
    subtitle: "El Sabio del Santuario Interior",
    desc: "Representa la búsqueda de la verdad última, la introspección sagrada y la conexión entre la lógica racional y la fe espiritual.",
    essence: "Tu mente es un laboratorio de profundidad. Necesitas periodos de retiro para decodificar los misterios de tu propia existencia y del universo.",
    challenges: ["Aislamiento melancólico", "Escepticismo paralizante", "Dificultad para comunicar sentimientos"],
    gift: "Sabiduría mística y una mente analítica excepcional."
  },
  8: {
    subtitle: "El Soberano de la Manifestación",
    desc: "Es la frecuencia del poder equilibrado, la autoridad ética y la maestría sobre las leyes del mundo material y espiritual.",
    essence: "Tu vibración atrae la abundancia a través de la disciplina. Sabes que el verdadero éxito es un reflejo de tu equilibrio interno.",
    challenges: ["Abuso de poder", "Obsesión por el estatus material", "Intolerancia ante la debilidad"],
    gift: "Habilidad para dirigir grandes proyectos y manifestar prosperidad."
  },
  9: {
    subtitle: "El Visionario del Cierre Sagrado",
    desc: "Simboliza la culminación de los ciclos, el amor universal sin fronteras y el desapego necesario para la transmutación.",
    essence: "Posees una sabiduría antigua. Tu camino es el del humanitario que ve más allá de lo personal para servir al bien colectivo.",
    challenges: ["Apegos dramáticos al pasado", "Sentimiento de carga mundial", "Inconsistencia emocional"],
    gift: "Compasión infinita y la capacidad de cerrar ciclos con gracia."
  },
  11: {
    subtitle: "El Mensajero de la Luz",
    desc: "Primer número maestro. Representa la iluminación, el canal abierto hacia planos superiores y la responsabilidad de inspirar a la humanidad.",
    essence: "Eres un puente viviente. Tu sensibilidad extrema te permite captar frecuencias que otros ignoran, actuando como un despertador espiritual.",
    challenges: ["Hipersensibilidad nerviosa", "Duda sobre la propia misión", "Dificultad para lidiar con el mundo material"],
    gift: "Intuición profética y una presencia carismática inspiradora."
  },
  22: {
    subtitle: "El Visionario del Nuevo Mundo",
    desc: "Segundo número maestro. Combina la intuición del 11 con la estructura del 4. Es el maestro constructor en una escala global.",
    essence: "Tienes la visión de un arquitecto y la fuerza de un gigante. Estás aquí para materializar ideales que mejoren la vida de miles de personas.",
    challenges: ["Agobio ante la magnitud de la visión", "Exigencia extrema", "Miedo a la responsabilidad masiva"],
    gift: "Poder de manifestación a gran escala y sentido práctico superior."
  },
  33: {
    subtitle: "El Corazón del Liderazgo Crístico",
    desc: "Tercer número maestro. Representa el amor universal llevado a su máxima expresión de servicio y sacrificio consciente por el bienestar ajeno.",
    essence: "Tu presencia es un bálsamo. Irradias una vibración de sanación y protección que guía a los demás hacia su versión más elevada.",
    challenges: ["Carga emocional abrumadora", "Tendencia al olvido de uno mismo", "Idealismo extremo"],
    gift: "Capacidad de transformar vidas a través del amor puro y la guía espiritual."
  }
};

const pillarNuances: Record<string, Record<number, string>> = {
  esencia: {
    1: "En tu núcleo más profundo buscas la auto-afirmación y el liderazgo original.",
    2: "Tu alma encuentra su paz en el acompañamiento y la unión sensible.",
    3: "Tu fuerza interna brota de la necesidad de expandir la alegría y la creatividad.",
    4: "Tu seguridad reside en la construcción de bases sólidas y valores permanentes.",
    5: "Tu espíritu demanda una evolución constante a través de la experiencia sensorial.",
    6: "Tu corazón se expande cuando puedes servir de pilar para tus seres amados.",
    7: "En el silencio de tu ser, habita un místico que busca la verdad absoluta.",
    8: "Tu energía central tiende naturalmente hacia la organización y el logro de objetivos.",
    9: "Tu alma es vieja y sabia, buscando siempre el sentido de unidad con el todo.",
    11: "Eres una antena receptora que siente y procesa el mundo desde lo espiritual.",
    22: "Guardas en tu interior el impulso de dejar una huella imperecedera en la tierra.",
    33: "Tu esencia es pura devoción; has venido a ser un refugio de amor para otros."
  },
  mision: {
    1: "Tu destino es abrir rutas vírgenes y demostrar el poder de la voluntad propia.",
    2: "Has venido a aprender el arte de la mediación y a equilibrar fuerzas opuestas.",
    3: "Tu propósito es elevar la frecuencia del mundo a través de la risa y el arte.",
    4: "Tu misión es profesionalizar el servicio y crear estructuras de beneficio común.",
    5: "Estás aquí para enseñarnos que el cambio es la única constante y la mayor aventura.",
    6: "Tu camino te llevará a sanar entornos y a reestablecer la armonía en lo doméstico.",
    7: "Tu misión es la especialización del conocimiento y el despertar de la conciencia.",
    8: "Has venido a dominar las leyes del intercambio y a generar riqueza consciente.",
    9: "Tu propósito es la entrega desinteresada y el cierre de deudas kármicas.",
    11: "Estás destinado a ser una luz de guía que eleve la vibración de tu comunidad.",
    22: "Tu misión es realizar obras que trasciendan generaciones y fronteras.",
    33: "Tu propósito máximo es ser un canal de amor incondicional y servicio planetario."
  },
  regalo: {
    1: "Posees el don de la determinación inquebrantable; nada detiene tu empuje creativo.",
    2: "Tu regalo es una diplomacia innata que abre puertas cerradas para otros.",
    3: "Recibes el don de la elocuencia mágica; tus palabras tienen el poder de encantar.",
    4: "Tu bendición es un sentido del orden que te permite prosperar en cualquier caos.",
    5: "Se te ha otorgado una juventud de espíritu eterna y una adaptabilidad total.",
    6: "Tu regalo es una voz y una presencia que calman instantáneamente el dolor ajeno.",
    7: "Posees una mente que accede a la sabiduría profunda con una facilidad asombrosa.",
    8: "Tu don es la capacidad de convertir ideas abstractas en negocios o bienes rentables.",
    9: "Recibes la gracia de la comprensión universal; ves la belleza en todos los procesos.",
    11: "Tu regalo es una clarividencia intuitiva que te permite 'saber' sin necesidad de explicar.",
    22: "Tienes el poder de convocar recursos y personas para construir visiones imposibles.",
    33: "Tu bendición es la capacidad de amar sin límites, siendo un imán de paz divina."
  },
  nombre: {
    1: "Tu nombre resuena con una frecuencia de mando y originalidad proyectada.",
    2: "Tu vibración externa invita a la confianza y a la colaboración estrecha.",
    3: "Te proyectas como un ser magnético, expresivo y lleno de luz comunicativa.",
    4: "Los demás ven en ti a alguien confiable, trabajador y extremadamente capaz.",
    5: "Tu vibración social es vibrante, cambiante y sumamente atractiva.",
    6: "Vibras como una figura materna/paterna, responsable y protectora.",
    7: "Tu nombre emite una frecuencia de misterio, intelecto y profesionalismo.",
    8: "Te perciben como una autoridad, alguien exitoso y con gran peso personal.",
    9: "Tu impacto en los demás es de inspiración, desapego y generosidad.",
    11: "Tu nombre actúa como una señal de guía espiritual para quienes te rodean.",
    22: "Vibras como un maestro de la realidad, alguien con poder de ejecución total.",
    33: "Tu vibración externa es de una pureza y bondad que desarma cualquier negatividad."
  },
  ano: {
    1: "Este es tu año de siembra; tiempo de iniciar, plantar y atreverse a lo nuevo.",
    2: "Año de paciencia y fertilización; es hora de esperar, colaborar y nutrir.",
    3: "Periodo de florecimiento; disfruta, comunícate y expande tus proyectos.",
    4: "Año de enraizamiento; trabaja duro, organiza tus bases y construye muros.",
    5: "Ciclo de libertad y cambios inesperados; suelta lo viejo y fluye con el viento.",
    6: "Año de responsabilidades y ajustes familiares; enfócate en el hogar y la armonía.",
    7: "Tiempo de estudio y reflexión; retírate un poco del ruido y búscate a ti mismo.",
    8: "Ciclo de cosecha y justicia; recibe los frutos de tus esfuerzos pasados.",
    9: "Año de limpieza profunda; suelta lo que ya no sirve para prepararte para lo nuevo.",
    11: "Año de revelaciones y pruebas espirituales; mantén tu visión elevada.",
    22: "Periodo de construcción magistral; piensa en grande y actúa con firmeza.",
    33: "Ciclo de servicio amoroso elevado; tiempo de dar sin esperar nada a cambio."
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
    essence: nuance
  };
}
