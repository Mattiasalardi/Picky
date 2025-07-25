import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Image,
  ActivityIndicator,
} from 'react-native';
import { TouchableOpacity, Linking } from 'react-native';
import { WebView } from 'react-native-webview';
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
import * as MediaLibrary from 'expo-media-library';

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
  isTopCard?: boolean; // New prop to identify the active card
}

export default function SwipeCard({ asset, onSwipe, onLoadError, index = 0, isTopCard = true }: SwipeCardProps) {
  const [resolvedUri, setResolvedUri] = useState<string | null>(null);
  const [error, setError] = useState(false);
  
  // Fuck video components - just show a play button
  const handleVideoPress = () => {
    if (resolvedUri) {
      Linking.openURL(resolvedUri);
    }
  };
  
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotateZ = useSharedValue(0);
  const scale = useSharedValue(1);
  
  const mediaService = MediaLibraryService.getInstance();
  const isVideo = asset.mediaType === 'video';
  
  // Calculate optimal aspect ratio and dimensions
  const getMediaDimensions = () => {
    const mediaAspectRatio = asset.width / asset.height;
    const cardAspectRatio = CARD_WIDTH / CARD_HEIGHT;
    
    let displayWidth = CARD_WIDTH;
    let displayHeight = CARD_HEIGHT;
    
    // For landscape photos/videos
    if (mediaAspectRatio > cardAspectRatio) {
      displayHeight = CARD_WIDTH / mediaAspectRatio;
    } 
    // For portrait photos/videos
    else if (mediaAspectRatio < cardAspectRatio) {
      displayWidth = CARD_HEIGHT * mediaAspectRatio;
    }
    
    return {
      width: displayWidth,
      height: displayHeight,
      aspectRatio: mediaAspectRatio,
      isLandscape: mediaAspectRatio > 1,
      isPortrait: mediaAspectRatio < 1,
      isSquare: Math.abs(mediaAspectRatio - 1) < 0.1,
    };
  };
  
  const mediaDimensions = getMediaDimensions();

  useEffect(() => {
    const resolveUri = async () => {
      try {
        const assetInfo = await MediaLibrary.getAssetInfoAsync(asset.id);
        const uri = assetInfo.localUri || assetInfo.uri;
        setResolvedUri(uri);
      } catch (error) {
        setError(true);
      }
    };
    resolveUri();
  }, [asset.id]);


  // Handle swipe completion
  const handleSwipeComplete = (direction: SwipeDirection) => {
    // Trigger haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Call parent callback
    onSwipe(direction, asset);
  };

  // Reset card position
  const resetCardPosition = () => {
    translateX.value = 0;
    translateY.value = 0;
    rotateZ.value = 0;
    scale.value = 1;
  };

  // Animate swipe out
  const animateSwipeOut = (direction: SwipeDirection) => {
    const toX = direction === 'left' ? -SCREEN_WIDTH : 
                direction === 'right' ? SCREEN_WIDTH : 0;
    const toY = direction === 'up' ? -SCREEN_HEIGHT : 0;
    
    translateX.value = toX;
    translateY.value = toY;
    scale.value = 0.8;
    runOnJS(handleSwipeComplete)(direction);
  };

  // Pan gesture
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      'worklet';
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
      'worklet';
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
    'worklet';
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
    'worklet';
    const opacity = interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, -50, 0],
      [1, 0.7, 0],
      Extrapolate.CLAMP
    );
    return { opacity };
  });

  const rightOverlayStyle = useAnimatedStyle(() => {
    'worklet';
    const opacity = interpolate(
      translateX.value,
      [0, 50, SWIPE_THRESHOLD],
      [0, 0.7, 1],
      Extrapolate.CLAMP
    );
    return { opacity };
  });

  const upOverlayStyle = useAnimatedStyle(() => {
    'worklet';
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

  if (!resolvedUri || error) {
    return (
      <View style={styles.container}>
        <Animated.View style={[styles.card, cardAnimatedStyle]}>
          <View style={styles.mediaContainer}>
            <View style={styles.placeholderContainer}>
              <View style={[styles.placeholder, {
                width: mediaDimensions.width,
                height: mediaDimensions.height,
              }]}>
                {error ? (
                  <>
                    <Ionicons name="alert-circle" size={48} color={Theme.colors.system.error} />
                    <ThemedText variant="caption1" style={styles.placeholderText}>
                      Errore caricamento
                    </ThemedText>
                  </>
                ) : (
                  <>
                    <ActivityIndicator size="large" color={Theme.colors.primary.main} />
                    <ThemedText variant="caption1" style={styles.placeholderText}>
                      Caricamento...
                    </ThemedText>
                  </>
                )}
              </View>
            </View>
          </View>
        </Animated.View>
      </View>
    );
  }


  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.card, cardAnimatedStyle]}>
          {/* Media Container with proper aspect ratio */}
          <View style={styles.mediaContainer}>
            {isVideo ? (
              <WebView
                style={{
                  width: mediaDimensions.width,
                  height: mediaDimensions.height,
                }}
                source={{
                  html: `
                    <html>
                      <body style="margin:0; background:black; display:flex; justify-content:center; align-items:center;">
                        <video 
                          width="${mediaDimensions.width}" 
                          height="${mediaDimensions.height}"
                          controls 
                          autoplay 
                          loop 
                          muted="false"
                          style="object-fit:contain;"
                        >
                          <source src="${resolvedUri}" type="video/mp4">
                        </video>
                      </body>
                    </html>
                  `
                }}
                allowsInlineMediaPlayback={true}
                mediaPlaybackRequiresUserAction={false}
                javaScriptEnabled={true}
                domStorageEnabled={true}
              />
            ) : (
              <Image 
                source={{ uri: resolvedUri }}
                style={[
                  styles.media,
                  {
                    width: mediaDimensions.width,
                    height: mediaDimensions.height,
                  }
                ]}
                resizeMode="contain"
              />
            )}
          </View>

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
                  <ThemedText variant="caption1" style={styles.durationText}>
                    {Math.round(asset.duration / 1000)}s
                  </ThemedText>
                </View>
              )}
            </View>
            
            <View style={styles.bottomInfo}>
              <ThemedText variant="caption1" style={styles.filename}>
                {asset.filename}
              </ThemedText>
              <ThemedText variant="caption1" style={styles.fileSize}>
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
  mediaContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  videoContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Theme.spacing.radius.xl,
  },
  media: {
    borderRadius: Theme.spacing.radius.xl,
  },
  errorDetails: {
    color: Theme.colors.text.tertiary,
    marginTop: Theme.spacing.xs,
    textAlign: 'center',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    backgroundColor: Theme.colors.background.tertiary,
    borderRadius: Theme.spacing.radius.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: Theme.colors.text.tertiary,
    marginTop: Theme.spacing.sm,
    textAlign: 'center',
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