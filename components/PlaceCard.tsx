import React from 'react';
import { Place } from '../types';

interface PlaceCardProps {
  place: Place;
}

const PlaceCard: React.FC<PlaceCardProps> = ({ place }) => {
  return (
    <div className="bg-[#303134] border border-gray-700 rounded-xl p-4 flex flex-col gap-3 shadow-lg hover:shadow-xl transition-shadow duration-200">
      <div className="flex justify-between items-start gap-2">
        <h3 className="font-semibold text-lg text-blue-300 leading-tight">
          {place.google_maps_uri ? (
            <a 
              href={place.google_maps_uri} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:underline hover:text-blue-200"
            >
              {place.name}
            </a>
          ) : (
            place.name
          )}
        </h3>
        {place.rating && (
          <div className="flex items-center gap-1 bg-yellow-500/10 px-2 py-1 rounded-md border border-yellow-500/20 shrink-0">
            <span className="text-yellow-400 font-bold text-sm">{place.rating}</span>
            <svg className="w-3 h-3 text-yellow-400 fill-current" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {place.user_ratings_total && (
              <span className="text-xs text-gray-400 ml-0.5">({place.user_ratings_total})</span>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1 text-sm text-gray-300">
        {place.address && (
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{place.address}</span>
          </div>
        )}
        
        {place.hours && (
          <div className="flex items-start gap-2">
             <svg className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
             <span className="text-green-300/80">{place.hours}</span>
          </div>
        )}
      </div>

      {place.description && (
        <div className="text-xs text-gray-400 border-t border-gray-700/50 pt-2 mt-1">
          {place.description}
        </div>
      )}

      {place.google_maps_uri && (
        <a 
          href={place.google_maps_uri}
          target="_blank" 
          rel="noopener noreferrer"
          className="mt-1 flex items-center justify-center gap-2 w-full py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-sm font-medium rounded-lg border border-blue-500/30 transition-colors"
        >
          הצג במפה
          <svg className="w-3 h-3 rtl:-scale-x-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      )}
    </div>
  );
};

export default PlaceCard;