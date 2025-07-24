import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  StyleSheet, 
  ActivityIndicator,
  Alert,
  Image,
  Dimensions
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './UI';
import Card from './UI/Card';
import { Theme } from '../constants/Theme';
import { MediaLibraryService, MediaAsset, MediaLoadOptions } from '../services/MediaLibraryService';
import localeStrings from '../locales/it.json';

interface MediaLoaderProps {
  albumId?: string;
  onMediaLoad: (assets: MediaAsset[]) => void;
  onLoadingChange: (loading: boolean) => void;
  onError?: (error: string) => void;
  loadOptions?: Partial<MediaLoadOptions>;
  autoLoad?: boolean;
}

interface MediaLoaderState {
  assets: MediaAsset[];
  loading: boolean;
  error: string | null;
  endCursor: string;
  hasNextPage: boolean;
  totalCount: number;
  loadedCount: number;
}

export default function MediaLoader({
  albumId,
  onMediaLoad,
  onLoadingChange,
  onError,
  loadOptions = {},
  autoLoad = false,
}: MediaLoaderProps) {
  const [state, setState] = useState<MediaLoaderState>({
    assets: [],
    loading: false,
    error: null,
    endCursor: '',
    hasNextPage: true,
    totalCount: 0,
    loadedCount: 0,
  });

  const mediaService = MediaLibraryService.getInstance();
  const screenWidth = Dimensions.get('window').width;

  const loadMedia = useCallback(async (loadMore = false) => {
    if (state.loading || (!state.hasNextPage && loadMore)) {
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));
    onLoadingChange(true);

    try {
      const options: MediaLoadOptions = {
        albumId,
        pageSize: 20,
        sortBy: 'creationTime',
        sortOrder: 'desc',
        includePhotos: true,
        includeVideos: true,
        ...loadOptions,
      };

      const result = await mediaService.getMediaAssets(
        options,
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
        totalCount: result.totalCount || prev.totalCount,
        loadedCount: newAssets.length,
      }));

      onMediaLoad(newAssets);
      onLoadingChange(false);

    } catch (error) {
      const errorMessage = 'Errore nel caricamento dei media';
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: errorMessage 
      }));
      onLoadingChange(false);
      onError?.(errorMessage);
      console.error('MediaLoader error:', error);
    }
  }, [albumId, state.loading, state.hasNextPage, state.endCursor, state.assets, loadOptions, onMediaLoad, onLoadingChange, onError, mediaService]);

  const loadMoreMedia = useCallback(() => {
    loadMedia(true);
  }, [loadMedia]);

  const refreshMedia = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      assets: [],
      endCursor: '',
      hasNextPage: true,
      loadedCount: 0,
    }));
    loadMedia(false);
  }, [loadMedia]);

  // Auto-load on mount if enabled
  useEffect(() => {
    if (autoLoad && state.assets.length === 0) {
      loadMedia(false);
    }
  }, [autoLoad, loadMedia, state.assets.length]);

  // Expose methods to parent component
  useEffect(() => {
    // You can access these methods via ref if needed
  }, [loadMedia, loadMoreMedia, refreshMedia]);

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '';
    
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const size = (bytes / Math.pow(1024, i)).toFixed(1);
    
    // Use Italian decimal separator
    return `${size.replace('.', ',')} ${sizes[i]}`;
  };

  const getLoadingProgress = (): string => {
    if (state.totalCount > 0) {
      const percentage = Math.round((state.loadedCount / state.totalCount) * 100);
      return `${state.loadedCount}/${state.totalCount.toLocaleString('it-IT')} (${percentage}%)`;
    }
    return `${state.loadedCount} caricati`;
  };

  const MediaPreviewItem = React.memo(({ asset, size }: { asset: MediaAsset; size: number }) => {
    const [localUri, setLocalUri] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const isVideo = asset.mediaType?.toString().toLowerCase().includes('video') || 
                    asset.filename?.toLowerCase().match(/\.(mp4|mov|avi|mkv|webm)$/);

    useEffect(() => {
      const loadAsset = async () => {
        if (asset.uri.startsWith('ph://')) {
          setLoading(true);
          try {
            const downloadedUri = await mediaService.downloadAsset(asset.id);
            if (downloadedUri) {
              setLocalUri(downloadedUri);
            } else {
              setError(true);
            }
          } catch (err) {
            console.error('Error loading asset:', err);
            setError(true);
          } finally {
            setLoading(false);
          }
        } else {
          setLocalUri(asset.uri);
        }
      };

      loadAsset();
    }, [asset.id, asset.uri]);

    const displayUri = localUri || asset.uri;
    const shouldShowMedia = !loading && !error && localUri && !localUri.startsWith('ph://');

    return (
      <Card style={[styles.mediaPreview, { width: size, height: size }]}>
        {loading || (asset.uri.startsWith('ph://') && !localUri) ? (
          <View style={styles.loadingPreview}>
            <ActivityIndicator size="small" color={Theme.colors.primary.main} />
            <ThemedText variant="caption1" style={styles.loadingPreviewText}>
              Caricamento...
            </ThemedText>
          </View>
        ) : error || !shouldShowMedia ? (
          <View style={styles.errorPreview}>
            <Ionicons name="image-outline" size={24} color={Theme.colors.text.tertiary} />
            <ThemedText variant="caption1" style={styles.errorPreviewText}>
              Errore caricamento
            </ThemedText>
          </View>
        ) : isVideo ? (
          <View style={styles.videoContainer}>
            <Video
              source={{ uri: localUri }}
              style={styles.videoPreview}
              resizeMode={ResizeMode.COVER}
              shouldPlay={false}
              isLooping={false}
              isMuted={true}
              useNativeControls={false}
              onError={() => setError(true)}
            />
            <View style={styles.videoOverlay}>
              <Ionicons 
                name="play-circle" 
                size={24} 
                color="white" 
              />
              {asset.duration && (
                <ThemedText variant="caption1" style={styles.videoDuration}>
                  {Math.round(asset.duration / 1000)}s
                </ThemedText>
              )}
            </View>
          </View>
        ) : (
          <Image 
            source={{ uri: localUri }}
            style={styles.imagePreview}
            resizeMode="cover"
            onError={() => setError(true)}
          />
        )}
        
        {asset.isInCloud && (
          <View style={styles.cloudBadge}>
            <Ionicons name="cloud-download" size={16} color="white" />
          </View>
        )}
        
        <View style={styles.mediaInfo}>
          <ThemedText variant="caption1" style={styles.mediaSize}>
            {formatFileSize(asset.fileSize)}
          </ThemedText>
        </View>
      </Card>
    );
  });

  const renderMediaPreview = (asset: MediaAsset, index: number) => {
    const previewSize = (screenWidth - Theme.spacing.lg * 3) / 2; // 2 columns with spacing
    return (
      <MediaPreviewItem 
        key={asset.id} 
        asset={asset} 
        size={previewSize}
      />
    );
  };

  if (state.error) {
    return (
      <Card style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color={Theme.colors.system.error} />
        <ThemedText variant="body" style={styles.errorText}>
          {state.error}
        </ThemedText>
        <ThemedText 
          variant="caption1" 
          color="primary" 
          style={styles.retryText}
          onPress={() => loadMedia(false)}
        >
          Tocca per riprovare
        </ThemedText>
      </Card>
    );
  }

  return (
    <View style={styles.container}>
      {state.loading && state.assets.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Theme.colors.primary.main} />
          <ThemedText variant="body" style={styles.loadingText}>
            {localeStrings.common.loading}
          </ThemedText>
        </View>
      ) : (
        <View>
          {state.assets.length > 0 && (
            <View style={styles.headerContainer}>
              <ThemedText variant="callout" style={styles.progressText}>
                {getLoadingProgress()}
              </ThemedText>
              {state.hasNextPage && (
                <ThemedText 
                  variant="caption1" 
                  color="primary"
                  style={styles.loadMoreText}
                  onPress={loadMoreMedia}
                >
                  Carica altro
                </ThemedText>
              )}
            </View>
          )}

          <View style={styles.mediaGrid}>
            {state.assets.map((asset, index) => renderMediaPreview(asset, index))}
          </View>

          {state.loading && state.assets.length > 0 && (
            <View style={styles.loadingMore}>
              <ActivityIndicator size="small" color={Theme.colors.primary.main} />
              <ThemedText variant="caption1" style={styles.loadingMoreText}>
                Caricamento...
              </ThemedText>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Theme.spacing.xl,
  },
  loadingText: {
    marginTop: Theme.spacing.md,
    color: Theme.colors.text.secondary,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Theme.spacing.xl,
    margin: Theme.spacing.md,
  },
  errorText: {
    marginVertical: Theme.spacing.md,
    textAlign: 'center',
    color: Theme.colors.text.secondary,
  },
  retryText: {
    textAlign: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
  },
  progressText: {
    color: Theme.colors.text.secondary,
  },
  loadMoreText: {
    textAlign: 'center',
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Theme.spacing.md,
    gap: Theme.spacing.sm,
  },
  mediaPreview: {
    marginBottom: Theme.spacing.sm,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: '80%',
  },
  videoContainer: {
    position: 'relative',
    width: '100%',
    height: '80%',
  },
  videoPreview: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoDuration: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    color: 'white',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 10,
  },
  cloudBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: Theme.colors.primary.main,
    borderRadius: 12,
    padding: 4,
  },
  mediaInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 4,
  },
  mediaSize: {
    color: 'white',
    fontSize: 10,
    textAlign: 'center',
  },
  loadingMore: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.md,
  },
  loadingMoreText: {
    marginLeft: Theme.spacing.sm,
    color: Theme.colors.text.secondary,
  },
  loadingPreview: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.background.secondary,
  },
  loadingPreviewText: {
    marginTop: Theme.spacing.xs,
    color: Theme.colors.text.tertiary,
    fontSize: 10,
  },
  errorPreview: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.background.secondary,
  },
  errorPreviewText: {
    marginTop: Theme.spacing.xs,
    color: Theme.colors.text.tertiary,
    fontSize: 10,
    textAlign: 'center',
  },
});