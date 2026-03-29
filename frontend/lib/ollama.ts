const GROQ_API_KEY = process.env.GROQ_API_KEY || ''
const GROQ_BASE_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_VISION_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct'
const GROQ_TEXT_MODEL = 'llama-3.1-8b-instant'

export interface OllamaMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  images?: string[]
}

export interface SpeciesIdentification {
  common_name: string
  scientific_name: string
  type: 'animal' | 'plant'
  confidence: number
  short_desc: string
  is_domestic: boolean
  is_legal: boolean
  safety_level: 'safe' | 'caution' | 'danger'
  diet: string
  lifespan: string
  habitat: string
  care_notes: string
  legal_notes: string
}

async function groqChat(messages: object[], model: string): Promise<string> {
  const response = await fetch(GROQ_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({ model, messages, temperature: 0.3 }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Groq error: ${response.status} ${err}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content || ''
}

function extractJSON(text: string): string {
  const match = text.match(/\[[\s\S]*\]|\{[\s\S]*\}/)
  return match ? match[0] : text
}

export async function identifyFromImage(base64Image: string): Promise<SpeciesIdentification[]> {
  const prompt = `You are an expert biologist and veterinarian. Analyze this image and identify the animal or plant shown.
Return a JSON array with UP TO 3 possible species matches, ordered by confidence. Each object must have:
- common_name (string, in Spanish) — MUST be the real, widely accepted Spanish common name for the scientific_name given. Do NOT invent or translate incorrectly.
- scientific_name (string) — MUST be the correct Latin binomial or trinomial that corresponds exactly to the common_name.
- type ("animal" or "plant")
- confidence (number 0-1)
- short_desc (string, 1 sentence in Spanish describing THIS specific species)
- is_domestic (boolean)
- is_legal (boolean, whether it's legal to keep as a pet/plant in most countries)
- safety_level ("safe", "caution", or "danger")
- diet (string in Spanish)
- lifespan (string in Spanish)
- habitat (string in Spanish)
- care_notes (string in Spanish)
- legal_notes (string in Spanish)

CRITICAL: The common_name and scientific_name MUST refer to the same organism. Example of correct pairing: "Pez Mariposa Africano" + "Pantodon buchholzi". Example of WRONG pairing: "Pez Globo" + "Pantodon buchholzi" (Pez Globo is Tetraodontidae, not Pantodon). If you are not certain of the common name in Spanish, keep the scientific name and use a literal translation instead of a wrong popular name.

Respond ONLY with the JSON array, no markdown or explanation.`

  const text = await groqChat([
    {
      role: 'user',
      content: [
        { type: 'text', text: prompt },
        { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } },
      ],
    },
  ], GROQ_VISION_MODEL)

  try {
    const parsed = JSON.parse(extractJSON(text))
    return Array.isArray(parsed) ? parsed.slice(0, 3) : [parsed]
  } catch {
    throw new Error('No se pudo parsear la respuesta de la IA')
  }
}

export async function identifyFromText(query: string): Promise<SpeciesIdentification[]> {
  const prompt = `You are an expert biologist and veterinarian. The user is asking about: "${query}"
Identify up to 3 possible matching species (animal or plant).
Return a JSON array with UP TO 3 species, ordered by relevance. Each object must have:
- common_name (string, in Spanish) — MUST be the real, widely accepted Spanish common name for the scientific_name given.
- scientific_name (string) — MUST be the correct Latin binomial that corresponds exactly to the common_name.
- type ("animal" or "plant")
- confidence (number 0-1)
- short_desc (string, 1 sentence in Spanish describing THIS specific species)
- is_domestic (boolean)
- is_legal (boolean)
- safety_level ("safe", "caution", or "danger")
- diet (string in Spanish)
- lifespan (string in Spanish)
- habitat (string in Spanish)
- care_notes (string in Spanish)
- legal_notes (string in Spanish)

CRITICAL: The common_name and scientific_name MUST refer to the same organism. Do NOT pair a popular common name with an unrelated scientific name. If uncertain of the Spanish common name, use a literal translation of the scientific name rather than a wrong popular name.

Respond ONLY with the JSON array.`

  const text = await groqChat([{ role: 'user', content: prompt }], GROQ_TEXT_MODEL)

  try {
    const parsed = JSON.parse(extractJSON(text))
    return Array.isArray(parsed) ? parsed.slice(0, 3) : [parsed]
  } catch {
    throw new Error('No se pudo parsear la respuesta de la IA')
  }
}

export interface SpeciesDetails {
  common_name: string
  scientific_name: string
  type: 'animal' | 'plant'
  biological_family: string
  classification: string
  subspecies: string | null
  known_varieties: string | null
  geographic_origin: string
  natural_habitat: string
  continent: string
  native_countries: string
  ideal_climate: string
  ideal_temperature: string
  ecosystem: string
  diet: string
  specific_foods: string
  feeding_frequency: string
  forbidden_foods: string | null
  water_needs: string
  lifespan: string
  maturity_age: string
  life_stages: string
  reproduction_season: string
  is_domestic: boolean
  care_difficulty: string
  min_space: string
  sun_needs: string
  humidity_needs: string
  cleaning_frequency: string
  special_needs: string | null
  care_notes: string
  temperament: string | null
  activity_level: string | null
  human_compatibility: string | null
  children_compatibility: string | null
  other_pets_compatibility: string | null
  noise_level: string | null
  watering_frequency: string | null
  soil_type: string | null
  fertilizer_needs: string | null
  pot_type: string | null
  annual_growth: string | null
  blooms: boolean | null
  safety_level: 'safe' | 'caution' | 'danger'
  is_legal: boolean
  is_toxic: boolean
  requires_permit: boolean
  is_protected_species: boolean
  threat_level: string
  legal_notes: string
  fun_facts: string[]
  special_adaptations: string
  cultural_history: string
  home_recommendation: 'recommended' | 'possible' | 'not_recommended'
  recommendation_reason: string
  short_desc: string
}

export async function getSpeciesDetails(
  commonName: string,
  scientificName: string,
  type: 'animal' | 'plant'
): Promise<SpeciesDetails> {
  const isAnimal = type === 'animal'
  const prompt = `You are an expert biologist, veterinarian, and botanist. Generate comprehensive educational data about: "${commonName}" (${scientificName}), which is a ${type}.
Return a single JSON object with these exact fields (all string values in Spanish, use null for not-applicable fields):
{
  "common_name": "nombre común",
  "scientific_name": "${scientificName}",
  "type": "${type}",
  "biological_family": "familia biológica",
  "classification": "clasificación específica (ej: mamífero, reptil, árbol, suculenta)",
  "subspecies": "subespecie o null",
  "known_varieties": "razas o variedades conocidas, separadas por coma, o null",
  "geographic_origin": "origen geográfico",
  "natural_habitat": "descripción del hábitat natural",
  "continent": "continente(s) de origen",
  "native_countries": "países donde vive naturalmente",
  "ideal_climate": "clima ideal",
  "ideal_temperature": "rango de temperatura ideal (ej: 18-25°C)",
  "ecosystem": "tipo de ecosistema (ej: selva tropical, desierto, bosque)",
  "diet": "tipo general de alimentación",
  "specific_foods": "qué come específicamente",
  "feeding_frequency": "cada cuánto se alimenta",
  "forbidden_foods": "alimentos prohibidos o null",
  "water_needs": "necesidad de agua",
  "lifespan": "esperanza de vida promedio",
  "maturity_age": "edad de madurez sexual o de desarrollo",
  "life_stages": "etapas de vida (cría, juvenil, adulto, etc.)",
  "reproduction_season": "temporada o época de reproducción",
  "is_domestic": ${isAnimal ? 'true or false' : 'false'},
  "care_difficulty": "fácil|moderado|difícil|experto",
  "min_space": "espacio mínimo recomendado en casa",
  "sun_needs": "necesidad de luz solar",
  "humidity_needs": "nivel de humedad recomendado",
  "cleaning_frequency": "frecuencia de limpieza o mantenimiento",
  "special_needs": "necesidades especiales o null",
  "care_notes": "resumen de cuidados generales",
  "temperament": ${isAnimal ? '"descripción del temperamento"' : 'null'},
  "activity_level": ${isAnimal ? '"nivel de actividad (bajo/medio/alto)"' : 'null'},
  "human_compatibility": ${isAnimal ? '"compatibilidad con humanos"' : 'null'},
  "children_compatibility": ${isAnimal ? '"compatibilidad con niños"' : 'null'},
  "other_pets_compatibility": ${isAnimal ? '"compatibilidad con otras mascotas"' : 'null'},
  "noise_level": ${isAnimal ? '"nivel de ruido que produce"' : 'null'},
  "watering_frequency": ${!isAnimal ? '"frecuencia de riego recomendada"' : 'null'},
  "soil_type": ${!isAnimal ? '"tipo de suelo ideal"' : 'null'},
  "fertilizer_needs": ${!isAnimal ? '"necesidad de fertilizante"' : 'null'},
  "pot_type": ${!isAnimal ? '"tipo y tamaño de maceta recomendada"' : 'null'},
  "annual_growth": ${!isAnimal ? '"crecimiento aproximado por año"' : 'null'},
  "blooms": ${!isAnimal ? 'true or false' : 'null'},
  "safety_level": "safe|caution|danger",
  "is_legal": true or false,
  "is_toxic": true or false,
  "requires_permit": true or false,
  "is_protected_species": true or false,
  "threat_level": "estado de conservación (ej: Preocupación menor, Vulnerable, En peligro)",
  "legal_notes": "notas legales importantes",
  "fun_facts": ["dato curioso 1", "dato curioso 2", "dato curioso 3"],
  "special_adaptations": "adaptaciones especiales de la especie",
  "cultural_history": "relación cultural, histórica o mitológica",
  "home_recommendation": "recommended|possible|not_recommended",
  "recommendation_reason": "razón de la recomendación en 1-2 oraciones",
  "short_desc": "descripción breve en 1 oración"
}
Respond ONLY with the JSON object, no markdown, no explanation.`

  const text = await groqChat([{ role: 'user', content: prompt }], GROQ_TEXT_MODEL)
  try {
    return JSON.parse(extractJSON(text)) as SpeciesDetails
  } catch {
    throw new Error('No se pudo obtener los detalles de la especie')
  }
}

export async function generateVirtualPetName(speciesName: string, type: 'animal' | 'plant'): Promise<{
  name: string
  personality: string
  message: string
}> {
  const prompt = `Generate a cute virtual pet companion for a ${type} called "${speciesName}".
Return JSON with:
- name (string: a cute, fun Spanish name for this virtual pet)
- personality (string: 2-3 word personality trait in Spanish, e.g. "Curioso y alegre")
- message (string: a short motivational message in Spanish, 1 sentence, first person, as if the pet is speaking to remind the user to take care of it)

Respond ONLY with the JSON object.`

  const text = await groqChat([{ role: 'user', content: prompt }], GROQ_TEXT_MODEL)

  try {
    return JSON.parse(extractJSON(text))
  } catch {
    return {
      name: 'Amiguito',
      personality: 'Curioso y alegre',
      message: 'Yo seré tu recordatorio de que cuides a tu animal o planta 🌿',
    }
  }
}

export async function generateCareReminders(
  speciesName: string,
  type: 'animal' | 'plant',
  country: string,
  season: string
): Promise<Array<{ type: string; label: string; time: string; frequency: string }>> {
  const prompt = `Generate care reminders for a ${type} called "${speciesName}" for a user in ${country} during ${season}.
Return a JSON array of reminders. Each must have:
- type: one of "food", "sun", "water", "cleaning", "other"
- label (string in Spanish, what to do)
- time (string, e.g. "08:00", "12:00")
- frequency (string in Spanish, e.g. "Diario", "Cada 3 días", "Semanal")

For animals: include food, water, cleaning reminders.
For plants: include water, sun, fertilizer reminders.
Generate 3-5 reminders. Respond ONLY with JSON array.`

  const text = await groqChat([{ role: 'user', content: prompt }], GROQ_TEXT_MODEL)

  try {
    return JSON.parse(extractJSON(text))
  } catch {
    return []
  }
}
