export interface StrapiImage {
  id?: number;
  url?: string;
  formats?: {
    thumbnail?: { url: string };
    small?: { url: string };
    medium?: { url: string };
  };
}

export interface GameRating {
  id: number;
  rating: number;
  member?: { id: number };
  game?: { id: number };
}

export interface StrapiGame {
  id: number;
  documentId?: string;
  name: string;
  description?: string | null;
  age_min: number;
  age_max?: number | null;
  playing_time?: string | null;
  player_min: number;
  player_max?: number | null;
  image?: StrapiImage | null;
  image_url?: string | null;
  ratings?: GameRating[];
  owner?: { id: number; username?: string } | null;
  createdAt?: string;
}

export interface TransformedGame {
  id: number;
  documentId?: string;
  titre: string;
  description: string;
  image: string | null;
  tags: string[];
  categorie: string;
  duree: number;
  age_min: number;
  age_max: number | null;
  player_min: number;
  player_max: number;
  ratings?: GameRating[];
  owner?: { id: number; username?: string } | null;
  createdAt: string;
}

export interface PlayerScore {
  id: number;
  score: number;
  is_winner: boolean;
  member?: { id: number; username: string } | null;
  guest_name?: string | null;
}

export interface GameSession {
  id: number;
  played_at: string;
  notes?: string | null;
  game: {
    id: number;
    documentId?: string;
    name: string;
    image?: StrapiImage | null;
    image_url?: string | null;
  };
  player_scores?: PlayerScore[];
}

export interface DishRating {
  id: number;
  rating: number;
}

export interface BookReading {
  id: number;
  date_debut?: string | null;
  date_fin?: string | null;
  abandonne?: boolean;
  member?: { id: number; username: string };
}

export interface HomeDish {
  id: number;
  documentId?: string;
  name: string;
  image: string | null;
  ratings?: DishRating[];
  createdAt: string;
}

export interface HomeBook {
  id: number;
  documentId?: string;
  titre: string;
  image: string | null;
  book_readings?: BookReading[];
}

export interface ReadingInProgressItem {
  book: HomeBook;
  reading: BookReading;
}

export interface FamilyMeResponse {
  id: number;
  name: string;
  games?: StrapiGame[];
  books?: Array<{
    id: number;
    documentId?: string;
    titre: string;
    image?: StrapiImage | null;
    image_url?: string | null;
    book_readings?: BookReading[];
    createdAt?: string;
  }>;
  dishes?: Array<{
    id: number;
    documentId?: string;
    name: string;
    image?: StrapiImage | null;
    image_url?: string | null;
    ratings?: DishRating[];
    createdAt?: string;
  }>;
}
