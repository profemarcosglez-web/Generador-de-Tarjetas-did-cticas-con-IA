import React, { useState, useCallback } from 'react';
import { FlashcardData } from './types';
import { generateFlashcards } from './services/geminiService';
import Flashcard from './components/Flashcard';

const LoadingSpinner: React.FC = () => (
    <div className="flex flex-col items-center justify-center space-y-4">
        <svg className="animate-spin h-12 w-12 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-slate-300 text-lg">Analizando texto y generando tarjetas...</p>
    </div>
);

const App: React.FC = () => {
    const [sourceText, setSourceText] = useState<string>('');
    const [flashcards, setFlashcards] = useState<FlashcardData[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

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
        } catch (err: any) {
            setError(err.message || "Ocurrió un error inesperado.");
        } finally {
            setIsLoading(false);
        }
    }, [sourceText]);

    return (
        <div className="min-h-screen bg-slate-900 text-white font-sans p-4 sm:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="text-center mb-8">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 mb-2">
                        Generador de Tarjetas Didácticas con IA
                    </h1>
                    <p className="text-lg text-slate-400">
                        Pega tu texto fuente y la IA creará tarjetas de estudio para ti.
                    </p>
                </header>

                <main>
                    <div className="max-w-3xl mx-auto mb-8">
                        <textarea
                            value={sourceText}
                            onChange={(e) => setSourceText(e.target.value)}
                            placeholder="Pega aquí el texto que quieres estudiar..."
                            className="w-full h-48 p-4 bg-slate-800 border-2 border-slate-700 rounded-lg text-slate-300 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-300 resize-y"
                            aria-label="Texto fuente para generar tarjetas"
                            disabled={isLoading}
                        ></textarea>
                        <div className="text-center mt-6">
                            <button
                                onClick={handleGenerate}
                                disabled={isLoading || !sourceText.trim()}
                                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                            >
                                {isLoading ? 'Generando...' : '✨ Generar Tarjetas'}
                            </button>
                        </div>
                    </div>

                    <div className="mt-12">
                        {isLoading && <LoadingSpinner />}
                        
                        {error && (
                            <div className="text-center bg-red-900/50 border border-red-700 text-red-300 p-6 rounded-lg max-w-2xl mx-auto">
                                <h2 className="text-2xl font-bold mb-2">¡Oh no! Algo salió mal.</h2>
                                <p>{error}</p>
                            </div>
                        )}

                        {!isLoading && !error && flashcards.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
                                {flashcards.map((card, index) => (
                                    <Flashcard key={index} term={card.term} definition={card.definition} />
                                ))}
                            </div>
                        )}
                    </div>
                </main>
                 <footer className="text-center mt-16 text-slate-500 text-sm">
                    <p>Creado con React, Tailwind CSS y la API de Gemini.</p>
                </footer>
            </div>
        </div>
    );
};

export default App;