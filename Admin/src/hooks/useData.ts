import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/services';
import toast from 'react-hot-toast';

const QUERY_KEYS = {
  tracks: ['tracks'] as const,
  track: (id: string) => ['tracks', id] as const,
  artists: ['artists'] as const,
  artist: (id: string) => ['artists', id] as const,
  albums: ['albums'] as const,
  album: (id: string) => ['albums', id] as const,
  playlists: ['playlists'] as const,
  podcasts: ['podcasts'] as const,
  episodes: (podcastId: string) => ['episodes', podcastId] as const,
  reports: ['reports'] as const,
  categories: ['categories'] as const,
  users: ['users'] as const,
  user: (id: string) => ['users', id] as const,
  dashboardStats: ['dashboard', 'stats'] as const,
  topTracks: ['dashboard', 'topTracks'] as const,
  topArtists: ['dashboard', 'topArtists'] as const,
};

export function useTracks() {
  return useQuery({
    queryKey: QUERY_KEYS.tracks,
    queryFn: db.getTracks,
  });
}

export function useTrack(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.track(id),
    queryFn: () => db.getTrack(id),
    enabled: !!id,
  });
}

export function useCreateTrack() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: db.createTrack,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tracks });
      toast.success('Track created successfully');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUpdateTrack() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<import('@/types').Track> }) =>
      db.updateTrack(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tracks });
      toast.success('Track updated successfully');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteTrack() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: db.deleteTrack,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tracks });
      toast.success('Track deleted successfully');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useArtists() {
  return useQuery({
    queryKey: QUERY_KEYS.artists,
    queryFn: db.getArtists,
  });
}

export function useArtist(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.artist(id),
    queryFn: () => db.getArtist(id),
    enabled: !!id,
  });
}

export function useCreateArtist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: db.createArtist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.artists });
      toast.success('Artist created successfully');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUpdateArtist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<import('@/types').Artist> }) =>
      db.updateArtist(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.artists });
      toast.success('Artist updated successfully');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteArtist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: db.deleteArtist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.artists });
      toast.success('Artist deleted successfully');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useAlbums() {
  return useQuery({
    queryKey: QUERY_KEYS.albums,
    queryFn: db.getAlbums,
  });
}

export function useAlbum(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.album(id),
    queryFn: () => db.getAlbum(id),
    enabled: !!id,
  });
}

export function useCreateAlbum() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: db.createAlbum,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.albums });
      toast.success('Album created successfully');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUpdateAlbum() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<import('@/types').Album> }) =>
      db.updateAlbum(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.albums });
      toast.success('Album updated successfully');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteAlbum() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: db.deleteAlbum,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.albums });
      toast.success('Album deleted successfully');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function usePlaylists() {
  return useQuery({
    queryKey: QUERY_KEYS.playlists,
    queryFn: db.getPlaylists,
  });
}

export function usePodcasts() {
  return useQuery({
    queryKey: QUERY_KEYS.podcasts,
    queryFn: db.getPodcasts,
  });
}

export function useEpisodes(podcastId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.episodes(podcastId),
    queryFn: () => db.getEpisodes(podcastId),
    enabled: !!podcastId,
  });
}

export function useReports() {
  return useQuery({
    queryKey: QUERY_KEYS.reports,
    queryFn: db.getReports,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: QUERY_KEYS.categories,
    queryFn: db.getCategories,
  });
}

export function useUsers() {
  return useQuery({
    queryKey: QUERY_KEYS.users,
    queryFn: db.getUsers,
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: QUERY_KEYS.dashboardStats,
    queryFn: db.getDashboardStats,
  });
}

export function useTopTracks() {
  return useQuery({
    queryKey: QUERY_KEYS.topTracks,
    queryFn: () => db.getTopTracks(),
  });
}

export function useTopArtists() {
  return useQuery({
    queryKey: QUERY_KEYS.topArtists,
    queryFn: () => db.getTopArtists(),
  });
}
