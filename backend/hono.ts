import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";

// app will be mounted at /api
const app = new Hono();

// Enable CORS for all routes
app.use("*", cors());

// Mount tRPC router at /trpc
app.use(
  "/trpc/*",
  trpcServer({
    endpoint: "/api/trpc",
    router: appRouter,
    createContext,
  })
);

// Simple health check endpoint
app.get("/", (c) => {
  return c.json({ status: "ok", message: "API is running" });
});

// AI Chat endpoint
app.post("/ai/chat", async (c) => {
  try {
    const body = await c.req.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return c.json({ error: "Invalid request format" }, 400);
    }

    const userMessage = messages.find((m: any) => m.role === "user")?.content || "";
    const systemPrompt = messages.find((m: any) => m.role === "system")?.content || "";
    const conversationHistory = messages.filter((m: any) => m.role === "assistant" || m.role === "user");

    // Importar planes mock para generar respuestas contextuales
    const { mockPlans } = await import("@/mocks/plans");
    
    // Generar respuesta inteligente basada en el mensaje del usuario
    const response = generateAIResponse(userMessage, systemPrompt, mockPlans, conversationHistory);

    return c.json({
      completion: response,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("AI Chat Error:", error);
    return c.json(
      { 
        error: "Error processing request",
        completion: "Disculpa, tengo problemas técnicos en este momento. ¿Podrías intentar de nuevo?"
      },
      500
    );
  }
});

// Función para generar respuestas inteligentes
function generateAIResponse(
  userMessage: string,
  systemPrompt: string,
  plans: any[],
  conversationHistory: any[] = []
): string {
  const messageLower = userMessage.toLowerCase().trim();
  
  // Detectar si ya hubo un saludo previo en la conversación
  const hasPreviousGreeting = conversationHistory.some((msg: any) => {
    const content = (msg.content || "").toLowerCase();
    return content.includes("hola") || content.includes("hey") || content.includes("qué tal");
  });
  
  // Detectar rechazo o negativa
  const isRejection = messageLower === "nope" || messageLower === "no" || 
                     messageLower === "no me gusta" || messageLower.includes("no me interesa") ||
                     messageLower.includes("no quiero") || messageLower === "nah";
  
  // Detectar mensajes muy cortos sin intención
  const isVeryShort = messageLower.length <= 3 || 
                     messageLower === "m" || messageLower === "no sé" || 
                     messageLower === "nose" || messageLower === "ns";
  
  // Si es muy corto, pedir claridad
  if (isVeryShort) {
    return "Necesito un poco más de info para ayudarte mejor. ¿Qué tipo de plan buscas? ¿Romántico, rumba, comida, naturaleza, cultura...?";
  }
  
  // Detectar saludos
  const greetings = ["hola", "hi", "hey", "buenos días", "buenas tardes", "buenas noches", 
                     "qué tal", "que tal", "qué hay", "que hay", "qué pasa", "que pasa",
                     "buen día", "buendía", "saludos", "qué más", "que más"];
  
  const isGreeting = greetings.some(greeting => 
    messageLower === greeting || 
    messageLower.startsWith(greeting + " ") ||
    messageLower.endsWith(" " + greeting) ||
    messageLower.includes(" " + greeting + " ")
  );
  
  // Detectar mensajes generales sin intención clara
  const isGeneralMessage = messageLower.length < 15 && !messageLower.includes("?") && 
                           !messageLower.includes("busco") && !messageLower.includes("quiero") &&
                           !messageLower.includes("necesito") && !messageLower.includes("recomienda") &&
                           !messageLower.includes("dónde") && !messageLower.includes("donde");
  
  // Si es rechazo, cambiar completamente el tipo de recomendación
  if (isRejection) {
    // Detectar qué tipo se estaba recomendando antes para cambiarlo
    const lastAssistantMessage = conversationHistory
      .filter((m: any) => m.role === "assistant")
      .slice(-1)[0]?.content?.toLowerCase() || "";
    
    let avoidCategory = "";
    if (lastAssistantMessage.includes("romántic")) avoidCategory = "romantic";
    else if (lastAssistantMessage.includes("rumba") || lastAssistantMessage.includes("nocturno")) avoidCategory = "nightlife";
    else if (lastAssistantMessage.includes("comida") || lastAssistantMessage.includes("restaurante")) avoidCategory = "food";
    else if (lastAssistantMessage.includes("aventura") || lastAssistantMessage.includes("deporte")) avoidCategory = "adventure";
    else if (lastAssistantMessage.includes("cultura") || lastAssistantMessage.includes("museo")) avoidCategory = "culture";
    else if (lastAssistantMessage.includes("naturaleza") || lastAssistantMessage.includes("parque")) avoidCategory = "nature";
    
    // Buscar un tipo completamente diferente
    const alternativeCategories = ["romantic", "nightlife", "food", "adventure", "culture", "nature", "chill"]
      .filter(cat => cat !== avoidCategory);
    const randomCategory = alternativeCategories[Math.floor(Math.random() * alternativeCategories.length)];
    
    let relevantPlans = plans;
    if (randomCategory === "romantic") {
      relevantPlans = plans.filter(p => p.rating && p.rating >= 4.5 || p.name?.toLowerCase().includes("rooftop"));
    } else if (randomCategory === "nightlife") {
      relevantPlans = plans.filter(p => p.category?.toLowerCase().includes("nocturno") || p.name?.toLowerCase().includes("bar"));
    } else if (randomCategory === "food") {
      relevantPlans = plans.filter(p => p.category?.toLowerCase().includes("comida") || p.category?.toLowerCase().includes("restaurante"));
    } else if (randomCategory === "nature") {
      relevantPlans = plans.filter(p => p.category?.toLowerCase().includes("parque") || p.name?.toLowerCase().includes("parque"));
    }
    
    if (relevantPlans.length === 0) relevantPlans = plans;
    
    const selectedPlans = relevantPlans.sort(() => Math.random() - 0.5).slice(0, 3);
    return formatRecommendations(selectedPlans, "Entiendo, cambiemos de tema. Te propongo esto:", "¿Te llama más la atención alguno de estos?");
  }
  
  // Si es solo un saludo o mensaje general (y no hubo saludo previo), responder conversacionalmente
  if ((isGreeting || isGeneralMessage) && !hasPreviousGreeting) {
    return "¡Hola! Soy Parche AI, tu compa que conoce todos los planes chéveres de Medellín. ¿Qué tipo de experiencia buscas? ¿Romántico, rumba, comida, naturaleza, cultura o algo más tranquilo?";
  }
  
  // Si es saludo pero ya hubo uno, ir directo al grano
  if (isGreeting && hasPreviousGreeting) {
    return "¿Qué tipo de plan te interesa? Romántico, rumba, comida, naturaleza, cultura...";
  }
  
  // Detectar categorías mencionadas
  const categories = ["romántico", "romantico", "romance", "pareja", "cita", "cena romántica", "romántica",
                      "noche", "nocturno", "rumba", "fiesta", "bebida", "bar", "discoteca", "antro",
                      "comida", "comer", "restaurante", "gastronomía", "gastronomia", "cenar", "almorzar",
                      "aventura", "deporte", "ejercicio", "caminar", "senderismo", "trekking", "bicicleta",
                      "cultura", "museo", "arte", "teatro", "música", "musica", "concierto", "exposición",
                      "naturaleza", "parque", "aire libre", "piscina", "playa", "montaña", "senderos",
                      "relajarse", "chill", "tranquilo", "calma", "descansar"];
  
  // Detectar intención específica
  const isRomantic = messageLower.includes("romántico") || messageLower.includes("romantico") || 
                    messageLower.includes("romance") || messageLower.includes("pareja") || 
                    messageLower.includes("cita") || messageLower.includes("romántica");
  const isNightlife = messageLower.includes("noche") || messageLower.includes("nocturno") || 
                     messageLower.includes("rumba") || messageLower.includes("fiesta") || 
                     messageLower.includes("bebida") || messageLower.includes("bar") || 
                     messageLower.includes("discoteca") || messageLower.includes("antro");
  const isFood = messageLower.includes("comida") || messageLower.includes("comer") || 
                messageLower.includes("restaurante") || messageLower.includes("gastronomía") ||
                messageLower.includes("gastronomia") || messageLower.includes("cenar") ||
                messageLower.includes("almorzar");
  const isAdventure = messageLower.includes("aventura") || messageLower.includes("deporte") || 
                     messageLower.includes("ejercicio") || messageLower.includes("caminar") || 
                     messageLower.includes("senderismo") || messageLower.includes("trekking");
  const isCulture = messageLower.includes("cultura") || messageLower.includes("museo") || 
                   messageLower.includes("arte") || messageLower.includes("teatro") || 
                   messageLower.includes("música") || messageLower.includes("musica") ||
                   messageLower.includes("concierto");
  const isNature = messageLower.includes("naturaleza") || messageLower.includes("parque") || 
                  messageLower.includes("aire libre") || messageLower.includes("piscina") ||
                  messageLower.includes("montaña");
  const isChill = messageLower.includes("relajarse") || messageLower.includes("chill") || 
                 messageLower.includes("tranquilo") || messageLower.includes("calma") ||
                 messageLower.includes("descansar");

  // Filtrar planes relevantes
  let relevantPlans = plans;
  
  if (isRomantic) {
    relevantPlans = plans.filter(p => 
      p.category?.toLowerCase().includes("romántico") || 
      p.category?.toLowerCase().includes("romantico") ||
      p.name?.toLowerCase().includes("romántico") ||
      p.name?.toLowerCase().includes("romantico") ||
      p.name?.toLowerCase().includes("rooftop") ||
      (p.rating && p.rating >= 4.5)
    );
  } else if (isNightlife) {
    relevantPlans = plans.filter(p => 
      p.category?.toLowerCase().includes("nocturno") ||
      p.category?.toLowerCase().includes("rumba") ||
      p.category?.toLowerCase().includes("fiesta") ||
      p.name?.toLowerCase().includes("bar") ||
      p.name?.toLowerCase().includes("discoteca") ||
      p.name?.toLowerCase().includes("antro")
    );
  } else if (isFood) {
    relevantPlans = plans.filter(p => 
      p.category?.toLowerCase().includes("comida") ||
      p.category?.toLowerCase().includes("restaurante") ||
      p.name?.toLowerCase().includes("restaurante") ||
      p.name?.toLowerCase().includes("comida")
    );
  } else if (isAdventure) {
    relevantPlans = plans.filter(p => 
      p.category?.toLowerCase().includes("aventura") ||
      p.category?.toLowerCase().includes("deporte") ||
      p.category?.toLowerCase().includes("ejercicio")
    );
  } else if (isCulture) {
    relevantPlans = plans.filter(p => 
      p.category?.toLowerCase().includes("cultura") ||
      p.category?.toLowerCase().includes("museo") ||
      p.category?.toLowerCase().includes("arte")
    );
  } else if (isNature || isChill) {
    relevantPlans = plans.filter(p => 
      p.category?.toLowerCase().includes("naturaleza") ||
      p.category?.toLowerCase().includes("parque") ||
      p.name?.toLowerCase().includes("parque") ||
      p.category?.toLowerCase().includes("rooftop")
    );
  }

  // Si no hay planes relevantes, usar todos
  if (relevantPlans.length === 0) {
    relevantPlans = plans;
  }

  // Seleccionar máximo 3 planes
  const selectedPlans = relevantPlans
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  // Determinar contexto e introducción según intención
  let intro = "";
  let question = "";
  
  if (isRomantic) {
    intro = "Para algo romántico, estos lugares son top:";
    question = "¿Cuál te llama más?";
  } else if (isNightlife) {
    intro = "Para la rumba, estos planes suenan:";
    question = "¿Cuál te pica?";
  } else if (isFood) {
    intro = "Para comer rico, estos lugares valen la pena:";
    question = "¿Cuál te tienta más?";
  } else if (isAdventure) {
    intro = "Para aventura, estos planes están chéveres:";
    question = "¿Cuál te anima?";
  } else if (isCulture) {
    intro = "Para cultura, estos lugares son interesantes:";
    question = "¿Cuál te interesa?";
  } else if (isNature || isChill) {
    intro = "Para relajarse, estos planes están tranquilos:";
    question = "¿Cuál te gusta más?";
  } else {
    intro = "Basándome en lo que dices, te recomiendo:";
    question = "¿Cuál te llama la atención?";
  }

  return formatRecommendations(selectedPlans, intro, question);
}

// Función helper para formatear recomendaciones según el formato especificado
function formatRecommendations(
  plans: any[],
  intro: string,
  finalQuestion: string
): string {
  if (plans.length === 0) {
    return "No tengo planes específicos para eso ahora. ¿Puedes darme más detalles de lo que buscas?";
  }

  let response = intro + "\n\n";

  plans.forEach((plan) => {
    // Obtener tipo del plan
    const planType = getPlanType(plan);
    
    // Descripción corta (vibe del sitio)
    const description = plan.description?.substring(0, 80).trim() || 
                       plan.vibe?.substring(0, 80).trim() || 
                       "Lugar chévere para pasar el rato";
    
    // Rating
    const rating = plan.rating ? `⭐ ${plan.rating.toFixed(1)}/5` : "";
    
    // Ideal para
    const idealFor = getIdealFor(plan);
    
    // Formato exacto según especificación
    response += `**${plan.name}**\n`;
    response += `${planType} – ${description}${description.length >= 80 ? '...' : ''}\n`;
    if (rating) {
      response += `${rating}\n`;
    }
    response += `Ideal para: ${idealFor}\n\n`;
  });

  // Pregunta final (siempre)
  response += finalQuestion;

  return response;
}

// Helper para obtener el tipo del plan
function getPlanType(plan: any): string {
  const category = (plan.category || plan.primaryCategory || "").toLowerCase();
  const name = (plan.name || "").toLowerCase();
  
  if (category.includes("rooftop") || name.includes("rooftop")) return "Rooftop";
  if (category.includes("bar") || name.includes("bar")) return "Bar";
  if (category.includes("restaurante") || name.includes("restaurante")) return "Restaurante";
  if (category.includes("café") || category.includes("cafe") || name.includes("café") || name.includes("cafe")) return "Café";
  if (category.includes("parque") || name.includes("parque")) return "Parque";
  if (category.includes("mirador") || name.includes("mirador")) return "Mirador";
  if (category.includes("club") || name.includes("club")) return "Club";
  if (category.includes("discoteca") || name.includes("discoteca")) return "Discoteca";
  if (category.includes("museo") || name.includes("museo")) return "Museo";
  if (category.includes("teatro") || name.includes("teatro")) return "Teatro";
  
  return plan.category || "Lugar";
}

// Helper para determinar "Ideal para"
function getIdealFor(plan: any): string {
  const category = (plan.category || plan.primaryCategory || "").toLowerCase();
  const name = (plan.name || "").toLowerCase();
  const tags = (plan.tags || []).map((t: string) => t.toLowerCase());
  
  if (category.includes("romántic") || name.includes("romántic") || tags.some((t: string) => t.includes("romántic") || t.includes("cita"))) {
    return "plan romántico o cita";
  }
  if (category.includes("nocturno") || category.includes("rumba") || name.includes("bar") || name.includes("discoteca")) {
    return "rumba y fiesta";
  }
  if (category.includes("comida") || category.includes("restaurante") || name.includes("restaurante")) {
    return "comer rico";
  }
  if (category.includes("parque") || name.includes("parque") || category.includes("naturaleza")) {
    return "relax y charla tranquila";
  }
  if (category.includes("cultura") || category.includes("museo") || category.includes("arte")) {
    return "cultura y aprendizaje";
  }
  if (category.includes("aventura") || category.includes("deporte")) {
    return "aventura y deporte";
  }
  
  // Default basado en rating
  if (plan.rating && plan.rating >= 4.5) {
    return "experiencia especial";
  }
  
  return "pasar el rato";
}

export default app;