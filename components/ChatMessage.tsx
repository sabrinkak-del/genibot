import React, { useMemo } from 'react';
import { ChatMessage as ChatMessageType, Place } from '../types';
import GroundingDisplay from './GroundingDisplay';
import PlaceCard from './PlaceCard';

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';

  // Attempt to parse JSON content from the message if it comes from the model
  const { displayContent, places } = useMemo(() => {
    if (isUser) return { displayContent: message.text, places: null };

    // Regex to extract JSON block: ```json ... ``` or just ``` ... ``` containing json
    const jsonBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/;
    const match = message.text.match(jsonBlockRegex);

    if (match && match[1]) {
      try {
        const parsed = JSON.parse(match[1]);
        if (Array.isArray(parsed)) {
          // If successfully parsed as an array, we assume it's a list of places
          // We remove the JSON block from the text to avoid duplicate/ugly display
          // and return the places structure.
          const textWithoutJson = message.text.replace(jsonBlockRegex, '').trim();
          return { displayContent: textWithoutJson, places: parsed as Place[] };
        }
      } catch (e) {
        // Fallback if parsing fails
        console.debug("Failed to parse potential JSON content", e);
      }
    }
    
    return { displayContent: message.text, places: null };
  }, [message.text, isUser]);

  const hasPlaces = places && places.length > 0;

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div 
        className={`
          relative max-w-[95%] md:max-w-[85%] lg:max-w-[75%] rounded-2xl px-5 py-4
          ${isUser 
            ? 'bg-primary text-white rounded-bl-none' 
            : 'bg-surface text-gray-100 rounded-br-none border border-gray-700'
          }
        `}
      >
        {/* Render Text Content (ONLY if no places are found) */}
        {/* The user requested to hide the text if places are found ("enough what is above") */}
        {displayContent && !hasPlaces && (
          <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap leading-relaxed mb-4">
            {displayContent}
          </div>
        )}

        {/* Render Place Cards Grid */}
        {hasPlaces && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 mb-2">
            {places!.map((place, idx) => (
              <PlaceCard key={idx} place={place} />
            ))}
          </div>
        )}

        {/* Display Grounding Sources (Maps/Web) ONLY if no places found (redundant otherwise) */}
        {!isUser && message.groundingMetadata?.groundingChunks && !hasPlaces && (
          <GroundingDisplay chunks={message.groundingMetadata.groundingChunks} />
        )}
        
        <div className={`text-[10px] mt-2 opacity-50 ${isUser ? 'text-blue-200' : 'text-gray-400'}`}>
           {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;