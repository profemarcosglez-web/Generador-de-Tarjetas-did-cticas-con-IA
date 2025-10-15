import { GoogleGenAI, Type } from "@google/genai";
import { FlashcardData } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const flashcardSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        term: {
          type: Type.STRING,
          description: "Un concepto, término o estructura clave extraído del texto proporcionado.",
        },
        definition: {
          type: Type.STRING,
          description: "Una explicación concisa y clara del término, basada en el texto proporcionado.",
        },
      },
      required: ["term", "definition"],
    },
};

export async function generateFlashcards(sourceText: string): Promise<FlashcardData[]> {
    try {
        if (!sourceText.trim()) {
            throw new Error("El texto fuente no puede estar vacío.");
        }

        const prompt = `Analiza el siguiente texto y genera 12 tarjetas didácticas (flashcards) basadas en su contenido. Cada tarjeta debe tener un "term" (término) y una "definition" (definición). El término debe ser un concepto clave del texto y la definición una explicación clara y breve extraída o inferida del mismo texto. El idioma de las tarjetas debe ser español.\n\n--- TEXTO ---\n${sourceText}\n\n--- FIN DEL TEXTO ---`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: flashcardSchema,
            },
        });

        const jsonText = response.text.trim();
        const flashcards = JSON.parse(jsonText) as FlashcardData[];
        return flashcards;

    } catch (error) {
        console.error("Error generating flashcards:", error);
        throw new Error("No se pudieron generar las tarjetas. Por favor, verifica tu texto e inténtalo de nuevo.");
    }
}