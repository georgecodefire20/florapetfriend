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
- common_name (string, in Spanish)
- scientific_name (string)
- type ("animal" or "plant")
- confidence (number 0-1)
- short_desc (string, 1 sentence in Spanish)
- is_domestic (boolean)
- is_legal (boolean, whether it's legal to keep as a pet/plant in most countries)
- safety_level ("safe", "caution", or "danger")
- diet (string in Spanish)
- lifespan (string in Spanish)
- habitat (string in Spanish)
- care_notes (string in Spanish)
- legal_notes (string in Spanish)

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
- common_name (string, in Spanish)
- scientific_name (string)
- type ("animal" or "plant")
- confidence (number 0-1)
- short_desc (string, 1 sentence in Spanish)
- is_domestic (boolean)
- is_legal (boolean)
- safety_level ("safe", "caution", or "danger")
- diet (string in Spanish)
- lifespan (string in Spanish)
- habitat (string in Spanish)
- care_notes (string in Spanish)
- legal_notes (string in Spanish)

Respond ONLY with the JSON array.`

  const text = await groqChat([{ role: 'user', content: prompt }], GROQ_TEXT_MODEL)

  try {
    const parsed = JSON.parse(extractJSON(text))
    return Array.isArray(parsed) ? parsed.slice(0, 3) : [parsed]
  } catch {
    throw new Error('No se pudo parsear la respuesta de la IA')
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
