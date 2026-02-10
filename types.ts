export interface MapsGroundingChunk {
  maps?: {
    uri?: string;
    title?: string;
    placeAnswerSources?: {
      reviewSnippets?: {
        reviewText?: string;
        authorAttribution?: {
          displayName?: string;
          uri?: string;
        };
      }[];
    }[];
  };
  web?: {
    uri?: string;
    title?: string;
  };
}

export interface GroundingMetadata {
  groundingChunks?: MapsGroundingChunk[];
}

export interface Place {
  name: string;
  rating?: string | number;
  user_ratings_total?: string | number;
  address?: string;
  hours?: string;
  description?: string;
  google_maps_uri?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  groundingMetadata?: GroundingMetadata;
  timestamp: number;
}

export interface LocationData {
  latitude: number;
  longitude: number;
}
