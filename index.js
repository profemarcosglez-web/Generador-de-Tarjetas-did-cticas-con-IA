// All necessary imports from the CDN via import map
import React, { useState, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI, Type } from "@google/genai";

// ===================================================================================
// ¡ACCIÓN REQUERIDA!
// Pega tu clave de API de Google Gemini aquí para que la aplicación funcione.
// Consigue tu clave en https://aistudio.google.com/app/apikey
// NO COMPARTAS ESTE ARCHIVO PÚBLICAMENTE CON TU CLAVE INCLUIDA.
const API_KEY = "PEGA_AQUÍ_TU_CLAVE_DE_API_DE_GEMINI";
// ===================================================================================


// --- Lógica del servicio Gemini (de services/geminiService.ts) ---

const ai = new GoogleGenAI({ apiKey: API_KEY });

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

async function generateFlashcards(sourceText) {
    if (!API_KEY || API_KEY === "PEGA_AQUÍ_TU_CLAVE_DE_API_DE_GEMINI") {
        throw new Error("Clave de API no configurada. Por favor, edita el archivo index.js y añade tu clave de API de Gemini.");
    }
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
        const flashcards = JSON.parse(jsonText);
        return flashcards;

    } catch (error) {
        console.error("Error generating flashcards:", error);
        if (error.message.includes('API key not valid')) {
             throw new Error("La clave de API no es válida. Revisa que la hayas copiado correctamente en el archivo index.js.");
        }
        throw new Error("No se pudieron generar las tarjetas. Por favor, verifica tu texto, la clave de API, e inténtalo de nuevo.");
    }
}


// --- Componente Flashcard (de components/Flashcard.tsx) ---

const Flashcard = ({ term, definition }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const handleCardClick = () => setIsFlipped(!isFlipped);

  return React.createElement(
    'div',
    {
      className: "perspective w-full h-64 sm:h-72 cursor-pointer group",
      onClick: handleCardClick,
      role: "button",
      tabIndex: 0,
      "aria-label": `Tarjeta de ${term}. Presiona para ver la definición.`,
      onKeyDown: (e) => (e.key === 'Enter' || e.key === ' ') && handleCardClick(),
    },
    React.createElement(
      'div',
      {
        className: `relative w-full h-full transform-style-preserve-3d transition-transform duration-700 ease-in-out ${isFlipped ? 'rotate-y-180' : ''}`,
      },
      React.createElement(
        'div',
        { className: "absolute w-full h-full backface-hidden rounded-xl bg-slate-800 border border-slate-700 shadow-lg shadow-cyan-500/10 p-6 flex flex-col justify-center items-center text-center" },
        React.createElement('h3', { className: "text-xl md:text-2xl font-bold text-cyan-400" }, term),
        React.createElement('p', { className: "mt-4 text-xs text-slate-400" }, "(Haz clic para ver la definición)")
      ),
      React.createElement(
        'div',
        { className: "absolute w-full h-full backface-hidden rotate-y-180 rounded-xl bg-slate-700 border border-slate-600 shadow-lg p-6 flex flex-col justify-center items-center text-center" },
        React.createElement('p', { className: "text-base text-slate-200" }, definition)
      )
    )
  );
};


// --- Componente App (de App.tsx) ---

const LoadingSpinner = () => (
    React.createElement('div', { className: "flex flex-col items-center justify-center space-y-4" },
        React.createElement('svg', { className: "animate-spin h-12 w-12 text-cyan-400", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24" },
            React.createElement('circle', { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }),
            React.createElement('path', { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })
        ),
        React.createElement('p', { className: "text-slate-300 text-lg" }, "Analizando texto y generando tarjetas...")
    )
);

const App = () => {
    const [sourceText, setSourceText] = useState('');
    const [flashcards, setFlashcards] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleGenerate = useCallback(async () => {
        if (!sourceText.trim()) {
            setError("Por favor, introduce un texto para generar las tarjetas.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setFlashcards([]);
        try {
            const data = await generateFlashcards(sourceText);
            setFlashcards(data);
        } catch (err) {
            setError(err.message || "Ocurrió un error inesperado.");
        } finally {
            setIsLoading(false);
        }
    }, [sourceText]);

    return React.createElement(
        'div', { className: "min-h-screen bg-slate-900 text-white font-sans p-4 sm:p-8" },
        React.createElement('div', { className: "max-w-7xl mx-auto" },
            React.createElement('header', { className: "text-center mb-8" },
                React.createElement('h1', { className: "text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 mb-2" },
                    "Generador de Tarjetas Didácticas con IA"
                ),
                React.createElement('p', { className: "text-lg text-slate-400" },
                    "Pega tu texto fuente y la IA creará tarjetas de estudio para ti."
                )
            ),
            React.createElement('main', null,
                React.createElement('div', { className: "max-w-3xl mx-auto mb-8" },
                    React.createElement('textarea', {
                        value: sourceText,
                        onChange: (e) => setSourceText(e.target.value),
                        placeholder: "Pega aquí el texto que quieres estudiar...",
                        className: "w-full h-48 p-4 bg-slate-800 border-2 border-slate-700 rounded-lg text-slate-300 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-300 resize-y",
                        "aria-label": "Texto fuente para generar tarjetas",
                        disabled: isLoading,
                    }),
                    React.createElement('div', { className: "text-center mt-6" },
                        React.createElement('button', {
                                onClick: handleGenerate,
                                disabled: isLoading || !sourceText.trim(),
                                className: "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                            },
                            isLoading ? 'Generando...' : '✨ Generar Tarjetas'
                        )
                    )
                ),
                React.createElement('div', { className: "mt-12" },
                    isLoading && React.createElement(LoadingSpinner, null),
                    error && React.createElement('div', { className: "text-center bg-red-900/50 border border-red-700 text-red-300 p-6 rounded-lg max-w-2xl mx-auto" },
                        React.createElement('h2', { className: "text-2xl font-bold mb-2" }, "¡Oh no! Algo salió mal."),
                        React.createElement('p', null, error)
                    ),
                    !isLoading && !error && flashcards.length > 0 &&
                    React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8" },
                        flashcards.map((card, index) => React.createElement(Flashcard, { key: index, term: card.term, definition: card.definition }))
                    )
                )
            ),
            React.createElement('footer', { className: "text-center mt-16 text-slate-500 text-sm" },
                React.createElement('p', null, "Creado con React, Tailwind CSS y la API de Gemini.")
            )
        )
    );
};


// --- Punto de entrada de la aplicación (de index.tsx) ---

const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);
root.render(React.createElement(React.StrictMode, null, React.createElement(App, null)));
