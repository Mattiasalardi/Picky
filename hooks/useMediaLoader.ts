import { useState, useCallback, useRef } from 'react';
import { MediaLibraryService, MediaAsset, MediaLoadOptions, Album } from '../services/MediaLibraryService';

interface MediaLoaderState {
  assets: MediaAsset[];
  loading: boolean;
  error: string | null;
  endCursor: string;
  hasNextPage: boolean;
  totalCount: number;
  currentIndex: number;
}

interface UseMediaLoaderOptions extends Partial<MediaLoadOptions> {
  initialPageSize?: number;
}

export function useMediaLoader(options: UseMediaLoaderOptions = {}) {
  const [state, setState] = useState<MediaLoaderState>({
    assets: [],
    loading: false,
    error: null,
    endCursor: '',
    hasNextPage: true,
    totalCount: 0,
    currentIndex: 0,
  });

  const mediaService = useRef(MediaLibraryService.getInstance()).current;
  const loadingRef = useRef(false);

  const loadMedia = useCallback(async (
    source: Album | 'all',
    loadMore = false
  ) => {
    if (loadingRef.current || (!state.hasNextPage && loadMore)) {
      return;
    }

    loadingRef.current = true;
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const loadOptions: MediaLoadOptions = {
        albumId: source === 'all' ? undefined : source.id,
        pageSize: options.initialPageSize || 20,
        sortBy: 'creationTime',
        sortOrder: 'desc',
        includePhotos: true,
        includeVideos: true,
        ...options,
      };

      const result = await mediaService.getMediaAssets(
        loadOptions,
        loadMore ? state.endCursor : undefined
      );

      const newAssets = loadMore 
        ? [...state.assets, ...result.assets]
        : result.assets;

      setState(prev => ({
        ...prev,
        assets: newAssets,
        loading: false,
        endCursor: result.endCursor,
        hasNextPage: result.hasNextPage,
        totalCount: result.totalCount || 0,
        currentIndex: loadMore ? prev.currentIndex : 0,
      }));

    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Errore nel caricamento dei media'
      }));
      console.error('MediaLoader error:', error);
    } finally {
      loadingRef.current = false;
    }
  }, [mediaService, options, state.endCursor, state.hasNextPage, state.assets]);

  const loadMore = useCallback(async (source: Album | 'all') => {
    return loadMedia(source, true);
  }, [loadMedia]);

  const refresh = useCallback(async (source: Album | 'all') => {
    setState(prev => ({ 
      ...prev, 
      assets: [],
      endCursor: '',
      hasNextPage: true,
      currentIndex: 0,
    }));
    return loadMedia(source, false);
  }, [loadMedia]);

  const goToNext = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentIndex: Math.min(prev.currentIndex + 1, prev.assets.length - 1)
    }));
  }, []);

  const goToPrevious = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentIndex: Math.max(prev.currentIndex - 1, 0)
    }));
  }, []);

  const getCurrentAsset = useCallback((): MediaAsset | null => {
    return state.assets[state.currentIndex] || null;
  }, [state.assets, state.currentIndex]);

  const getProgress = useCallback(() => {
    if (state.assets.length === 0) {
      return { current: 0, total: 0, percentage: 0 };
    }

    return {
      current: state.currentIndex + 1,
      total: state.totalCount || state.assets.length,
      percentage: Math.round(((state.currentIndex + 1) / (state.totalCount || state.assets.length)) * 100)
    };
  }, [state.currentIndex, state.assets.length, state.totalCount]);

  const jumpToIndex = useCallback((index: number) => {
    if (index >= 0 && index < state.assets.length) {
      setState(prev => ({ ...prev, currentIndex: index }));
    }
  }, [state.assets.length]);

  const hasMore = useCallback(() => {
    return state.hasNextPage;
  }, [state.hasNextPage]);

  const needsMoreContent = useCallback(() => {
    // Load more when we're within 5 items of the end
    const threshold = 5;
    return state.currentIndex >= (state.assets.length - threshold) && state.hasNextPage;
  }, [state.currentIndex, state.assets.length, state.hasNextPage]);

  return {
    // State
    assets: state.assets,
    loading: state.loading,
    error: state.error,
    currentIndex: state.currentIndex,
    totalCount: state.totalCount,
    
    // Actions
    loadMedia,
    loadMore,
    refresh,
    goToNext,
    goToPrevious,
    getCurrentAsset,
    jumpToIndex,
    
    // Computed
    getProgress,
    hasMore,
    needsMoreContent,
  };
}