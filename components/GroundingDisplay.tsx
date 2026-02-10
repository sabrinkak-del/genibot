import React from 'react';
import { MapsGroundingChunk } from '../types';

interface GroundingDisplayProps {
  chunks: MapsGroundingChunk[];
}

const GroundingDisplay: React.FC<GroundingDisplayProps> = ({ chunks }) => {
  if (!chunks || chunks.length === 0) return null;

  // Filter out chunks that don't have Maps data or Web data
  const validChunks = chunks.filter(c => c.maps?.title || c.web?.title);

  if (validChunks.length === 0) return null;

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {validChunks.map((chunk, index) => {
        const isMaps = !!chunk.maps;
        const data = chunk.maps || chunk.web;
        
        if (!data) return null;

        const title = data.title || "מיקום לא ידוע";
        const uri = data.uri;

        return (
          <a
            key={index}
            href={uri}
            target="_blank"
            rel="noopener noreferrer"
            className={`
              flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
              border border-opacity-20
              ${isMaps 
                ? 'bg-[#34A853]/10 border-[#34A853] text-[#8ab4f8] hover:bg-[#34A853]/20' 
                : 'bg-white/5 border-white/20 text-gray-300 hover:bg-white/10'
              }
            `}
          >
            {isMaps ? (
              // Google Maps Pin Icon
              <svg className="w-4 h-4 text-[#34A853]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            ) : (
              // Globe/Web Icon
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            )}
            <span className="truncate max-w-[150px]">{title}</span>
            <svg className="w-3 h-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        );
      })}
    </div>
  );
};

export default GroundingDisplay;