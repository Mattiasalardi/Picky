import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import {
  GestureDetector,
  Gesture,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { ThemedText } from './UI';
import { Theme } from '../constants/Theme';
import { MediaAsset, MediaLibraryService } from '../services/MediaLibraryService';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.9;
const CARD_HEIGHT = SCREEN_HEIGHT * 0.7;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

export type SwipeDirection = 'left' | 'right' | 'up';

interface SwipeCardProps {
  asset: MediaAsset;
  onSwipe: (direction: SwipeDirection, asset: MediaAsset) => void;
  onLoadError?: (asset: MediaAsset) => void;
  index?: number;
}

export default function SwipeCard({ asset, onSwipe, onLoadError, index = 0 }: SwipeCardProps) {
  const [localUri, setLocalUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotateZ = useSharedValue(0);
  const scale = useSharedValue(1);
  
  const mediaService = MediaLibraryService.getInstance();
  const isVideo = asset.mediaType === 'video';

  // Load asset URI
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
            onLoadError?.(asset);
          }
        } catch (err) {
          console.error('Error loading asset for swipe card:', err);
          setError(true);
          onLoadError?.(asset);
        } finally {
          setLoading(false);
        }
      } else {
        setLocalUri(asset.uri);
      }
    };

    loadAsset();
  }, [asset.id, asset.uri, mediaService, onLoadError]);

  // Handle swipe completion
  const handleSwipeComplete = (direction: SwipeDirection) => {
    // Trigger haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Call parent callback
    onSwipe(direction, asset);
  };

  // Reset card position
  const resetCardPosition = () => {
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
    rotateZ.value = withSpring(0);
    scale.value = withSpring(1);
  };

  // Animate swipe out
  const animateSwipeOut = (direction: SwipeDirection) => {
    const toX = direction === 'left' ? -SCREEN_WIDTH : 
                direction === 'right' ? SCREEN_WIDTH : 0;
    const toY = direction === 'up' ? -SCREEN_HEIGHT : 0;
    
    translateX.value = withSpring(toX, { damping: 15 });
    translateY.value = withSpring(toY, { damping: 15 });
    scale.value = withSpring(0.8, { damping: 15 });
    
    // Complete swipe after animation
    setTimeout(() => runOnJS(handleSwipeComplete)(direction), 200);
  };

  // Pan gesture
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
      
      // Rotation based on horizontal movement
      rotateZ.value = (event.translationX / SCREEN_WIDTH) * 30;
      
      // Scale slightly based on movement
      const distance = Math.sqrt(
        event.translationX ** 2 + event.translationY ** 2
      );
      scale.value = interpolate(
        distance,
        [0, SWIPE_THRESHOLD],
        [1, 0.95],
        Extrapolate.CLAMP
      );
    })
    .onEnd((event) => {
      const { translationX, translationY, velocityX, velocityY } = event;
      
      // Determine swipe direction and threshold
      const horizontalSwipe = Math.abs(translationX) > SWIPE_THRESHOLD || Math.abs(velocityX) > 500;
      const verticalSwipe = Math.abs(translationY) > SWIPE_THRESHOLD || Math.abs(velocityY) > 500;
      
      if (horizontalSwipe && Math.abs(translationX) > Math.abs(translationY)) {
        // Horizontal swipe
        const direction: SwipeDirection = translationX > 0 ? 'right' : 'left';
        runOnJS(animateSwipeOut)(direction);
      } else if (verticalSwipe && translationY < 0) {
        // Upward swipe only
        runOnJS(animateSwipeOut)('up');
      } else {
        // Return to center
        runOnJS(resetCardPosition)();
      }
    });

  // Animated styles
  const cardAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotateZ: `${rotateZ.value}deg` },
        { scale: scale.value },
      ],
    };
  });

  // Overlay styles for visual feedback
  const leftOverlayStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, -50, 0],
      [1, 0.7, 0],
      Extrapolate.CLAMP
    );
    return { opacity };
  });

  const rightOverlayStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, 50, SWIPE_THRESHOLD],
      [0, 0.7, 1],
      Extrapolate.CLAMP
    );
    return { opacity };
  });

  const upOverlayStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateY.value,
      [-SWIPE_THRESHOLD, -50, 0],
      [1, 0.7, 0],
      Extrapolate.CLAMP
    );
    return { opacity };
  });

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '';
    
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const size = (bytes / Math.pow(1024, i)).toFixed(1);
    
    return `${size.replace('.', ',')} ${sizes[i]}`;
  };

  const shouldShowMedia = !loading && !error && localUri && !localUri.startsWith('ph://');

  if (error) {
    return (
      <View style={styles.container}>
        <Animated.View style={[styles.card, styles.errorCard, cardAnimatedStyle]}>
          <View style={styles.errorContent}>
            <Ionicons name="alert-circle" size={64} color={Theme.colors.system.error} />
            <ThemedText variant="body" style={styles.errorText}>
              Errore nel caricamento
            </ThemedText>
            <ThemedText variant="caption" style={styles.errorSubtext}>
              {asset.filename}
            </ThemedText>
          </View>
        </Animated.View>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.card, cardAnimatedStyle]}>
          {loading || (asset.uri.startsWith('ph://') && !localUri) ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Theme.colors.primary.main} />
              <ThemedText variant="body" style={styles.loadingText}>
                Caricamento...
              </ThemedText>
            </View>
          ) : !shouldShowMedia ? (
            <View style={styles.loadingContainer}>
              <Ionicons name="image-outline" size={64} color={Theme.colors.text.tertiary} />
              <ThemedText variant="body" style={styles.loadingText}>
                Media non disponibile
              </ThemedText>
            </View>
          ) : isVideo ? (
            <Video
              source={{ uri: localUri }}
              style={styles.media}
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay={true}
              isLooping={true}
              isMuted={false}
              useNativeControls={false}
              onError={() => setError(true)}
            />
          ) : (
            <Image 
              source={{ uri: localUri }}
              style={styles.media}
              resizeMode="contain"
              onError={() => setError(true)}
            />
          )}

          {/* Media Info Overlay */}
          <View style={styles.infoOverlay}>
            <View style={styles.topInfo}>
              {asset.isInCloud && (
                <View style={styles.cloudBadge}>
                  <Ionicons name="cloud-download" size={16} color="white" />
                </View>
              )}
              {isVideo && asset.duration && (
                <View style={styles.durationBadge}>
                  <Ionicons name="videocam" size={14} color="white" />
                  <ThemedText variant="caption" style={styles.durationText}>
                    {Math.round(asset.duration / 1000)}s
                  </ThemedText>
                </View>
              )}
            </View>
            
            <View style={styles.bottomInfo}>
              <ThemedText variant="caption" style={styles.filename}>
                {asset.filename}
              </ThemedText>
              <ThemedText variant="caption" style={styles.fileSize}>
                {formatFileSize(asset.fileSize)}
              </ThemedText>
            </View>
          </View>

          {/* Swipe Direction Overlays */}
          <Animated.View style={[styles.swipeOverlay, styles.leftOverlay, leftOverlayStyle]}>
            <Ionicons name="trash" size={48} color="white" />
            <ThemedText variant="callout" style={styles.swipeText}>
              ELIMINA
            </ThemedText>
          </Animated.View>

          <Animated.View style={[styles.swipeOverlay, styles.rightOverlay, rightOverlayStyle]}>
            <Ionicons name="checkmark-circle" size={48} color="white" />
            <ThemedText variant="callout" style={styles.swipeText}>
              MANTIENI
            </ThemedText>
          </Animated.View>

          <Animated.View style={[styles.swipeOverlay, styles.upOverlay, upOverlayStyle]}>
            <Ionicons name="heart" size={48} color="white" />
            <ThemedText variant="callout" style={styles.swipeText}>
              PREFERITI
            </ThemedText>
          </Animated.View>
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: Theme.colors.background.tertiary,
    borderRadius: Theme.spacing.radius.xl,
    overflow: 'hidden',
    shadowColor: Theme.colors.ui.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  errorCard: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContent: {
    alignItems: 'center',
    padding: Theme.spacing.xl,
  },
  errorText: {
    color: Theme.colors.system.error,
    marginTop: Theme.spacing.md,
    textAlign: 'center',
  },
  errorSubtext: {
    color: Theme.colors.text.tertiary,
    marginTop: Theme.spacing.sm,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: Theme.colors.text.secondary,
    marginTop: Theme.spacing.md,
  },
  media: {
    width: '100%',
    height: '100%',
  },
  infoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
  },
  topInfo: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: Theme.spacing.md,
    gap: Theme.spacing.sm,
  },
  cloudBadge: {
    backgroundColor: Theme.colors.primary.main,
    borderRadius: Theme.spacing.radius.sm,
    padding: Theme.spacing.xs,
  },
  durationBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: Theme.spacing.radius.sm,
    padding: Theme.spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationText: {
    color: 'white',
    fontSize: 12,
  },
  bottomInfo: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: Theme.spacing.md,
  },
  filename: {
    color: 'white',
    marginBottom: 2,
  },
  fileSize: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  swipeOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leftOverlay: {
    backgroundColor: 'rgba(244, 67, 54, 0.9)', // Red for delete
  },
  rightOverlay: {
    backgroundColor: 'rgba(76, 175, 80, 0.9)', // Green for keep
  },
  upOverlay: {
    backgroundColor: 'rgba(255, 193, 7, 0.9)', // Yellow for favorites
  },
  swipeText: {
    color: 'white',
    fontWeight: 'bold',
    marginTop: Theme.spacing.sm,
    textAlign: 'center',
  },
});