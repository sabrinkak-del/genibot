import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { LocationData, MapsGroundingChunk } from "../types";

// Initialize the API client
// CRITICAL: process.env.API_KEY is guaranteed to be present in this environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `You are a helpful and knowledgeable local guide assistant speaking Hebrew.
You have access to Google Maps data. 
When the user asks for recommendations, to find places, restaurants, or shops:
1. Use the Google Maps tool to find accurate, real-time information.
2. CRITICAL: You must output the results STRICTLY as a JSON array inside a markdown code block labeled 'json'.
   Example format:
   \`\`\`json
   [
     {
       "name": "שם המקום",
       "rating": "4.5",
       "user_ratings_total": "1200",
       "address": "רחוב ראשי 123, תל אביב",
       "hours": "פתוח עד 22:00",
       "description": "תיאור קצר של המקום בעברית",
       "google_maps_uri": "https://..."
     }
   ]
   \`\`\`
3. Do NOT output a text list (like bullet points) outside of this JSON block when listing places.
4. Ensure the keys in the JSON match the example above (name, rating, user_ratings_total, address, hours, description, google_maps_uri).
5. If the Google Maps tool provides a URI, include it in 'google_maps_uri'.
6. ALWAYS RESPOND IN HEBREW. Even the values inside the JSON (name, address, hours, description) must be in Hebrew.

If the user asks a general question unrelated to finding specific places, answer normally in Hebrew text.
Your tone should be friendly, concise, and helpful.`;

export const sendMessageToGemini = async (
  prompt: string,
  history: { role: string; parts: { text: string }[] }[],
  location?: LocationData
): Promise<{ text: string; groundingChunks?: MapsGroundingChunk[] }> => {
  try {
    // Construct the configuration
    // According to instructions: gemini-2.5-flash is required for Maps Grounding.
    const modelId = "gemini-2.5-flash";

    const config: any = {
      tools: [{ googleMaps: {} }],
      systemInstruction: SYSTEM_INSTRUCTION,
    };

    // If location is available, add it to the toolConfig for better grounding
    if (location) {
      config.toolConfig = {
        retrievalConfig: {
          latLng: {
            latitude: location.latitude,
            longitude: location.longitude,
          },
        },
      };
    }

    const response = await ai.models.generateContent({
      model: modelId,
      contents: [
        ...history,
        { role: 'user', parts: [{ text: prompt }] }
      ],
      config: config,
    });

    const text = response.text || "לא התקבלה תשובה.";
    
    // Extract grounding metadata safely
    // The SDK types might be loose, so we cast or access carefully
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    const groundingChunks = groundingMetadata?.groundingChunks as MapsGroundingChunk[] | undefined;

    return { text, groundingChunks };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};