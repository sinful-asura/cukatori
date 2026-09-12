export const MEDIA_TYPES = ['anime', 'manga', 'book', 'movie', 'novel', 'youtube'] as const;
export type MediaType = (typeof MEDIA_TYPES)[number];

export const MEDIA_STATUSES = [
  'planned',
  'watching',
  'reading',
  'completed',
  'paused',
  'dropped',
] as const;
export type MediaStatus = (typeof MEDIA_STATUSES)[number];

export const MEDIA_PAGE_CHUNK = 20;

export interface MediaItemDto {
  id: string;
  type: MediaType;
  title: string;
  posterUrl: string | null;
  status: MediaStatus;
  subtitle: string | null;
  totalUnits: number | null;
  currentEpisode: number | null;
  currentPages: number | null;
  rating: number | null;
  hours: number;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MediaProgressDto {
  id: string;
  mediaId: string;
  episode: number | null;
  pages: number | null;
  rating: number | null;
  hours: number | null;
  note: string | null;
  completedAt: string | null;
  createdAt: string;
}

export interface CreateMediaItemRequest {
  type: MediaType;
  title: string;
  posterUrl?: string | null;
  status?: MediaStatus;
  subtitle?: string | null;
  totalUnits?: number | null;
  currentEpisode?: number | null;
  currentPages?: number | null;
  rating?: number | null;
  hours?: number;
}

export interface UpdateMediaItemRequest {
  type?: MediaType;
  title?: string;
  posterUrl?: string | null;
  status?: MediaStatus;
  subtitle?: string | null;
  totalUnits?: number | null;
  currentEpisode?: number | null;
  currentPages?: number | null;
  rating?: number | null;
  hours?: number;
}

export interface LogMediaProgressRequest {
  episode?: number;
  pages?: number;
  rating?: number;
  hours?: number;
  note?: string;
  completed?: boolean;
}

export interface MediaActivityEcho {
  type: 'MEDIA_PROGRESS' | 'MEDIA_COMPLETED';
  title: string;
  summary: string;
  xpAwarded: number;
}

export interface LogMediaProgressResponse {
  item: MediaItemDto;
  progress: MediaProgressDto;
  events: MediaActivityEcho[];
}

export interface MediaLibraryStatsDto {
  hours: number;
  completed: number;
  averageRating: number;
  streak: number;
}

export interface MediaLibraryDto {
  items: MediaItemDto[];
  currentlyWatching: MediaItemDto[];
  currentlyReading: MediaItemDto[];
  recentlyCompleted: MediaItemDto[];
  stats: MediaLibraryStatsDto;
}
