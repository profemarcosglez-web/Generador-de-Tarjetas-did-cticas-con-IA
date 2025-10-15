
import React, { useState } from 'react';

interface FlashcardProps {
  term: string;
  definition: string;
}

const Flashcard: React.FC<FlashcardProps> = ({ term, definition }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleCardClick = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div
      className="perspective w-full h-64 sm:h-72 cursor-pointer group"
      onClick={handleCardClick}
    >
      <div
        className={`relative w-full h-full transform-style-preserve-3d transition-transform duration-700 ease-in-out ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* Front of the card */}
        <div className="absolute w-full h-full backface-hidden rounded-xl bg-slate-800 border border-slate-700 shadow-lg shadow-cyan-500/10 p-6 flex flex-col justify-center items-center text-center">
          <h3 className="text-xl md:text-2xl font-bold text-cyan-400">{term}</h3>
          <p className="mt-4 text-xs text-slate-400">(Haz clic para ver la definición)</p>
        </div>

        {/* Back of the card */}
        <div className="absolute w-full h-full backface-hidden rotate-y-180 rounded-xl bg-slate-700 border border-slate-600 shadow-lg p-6 flex flex-col justify-center items-center text-center">
          <p className="text-base text-slate-200">{definition}</p>
        </div>
      </div>
    </div>
  );
};

export default Flashcard;
