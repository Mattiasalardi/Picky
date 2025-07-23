import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import SwipeCard, { SwipeDirection } from './SwipeCard';
import CardStack from './CardStack';
import AlbumDropdown from './AlbumDropdown';
import { ThemedText, Button } from './UI';
import { Theme } from '../constants/Theme';
import { useMediaLoader } from '../hooks/useMediaLoader';
import { MediaAsset, Album } from '../services/MediaLibraryService';
import { SwipeActionsService } from '../services/SwipeActionsService';
import localeStrings from '../locales/it.json';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SwipingInterfaceProps {
  selectedAlbum: Album | 'all';
  onBack: () => void;
  onComplete?: () => void;
}

interface SwipeStats {
  total: number;
  deleted: number;
  kept: number;
  favorites: number;
}

export default function SwipingInterface({ 
  selectedAlbum: initialAlbum, 
  onBack, 
  onComplete 
}: SwipingInterfaceProps) {
  const [selectedAlbum, setSelectedAlbum] = useState<Album | 'all'>(initialAlbum);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [stats, setStats] = useState<SwipeStats>({
    total: 0,
    deleted: 0,
    kept: 0,
    favorites: 0,
  });
  const [undoAvailable, setUndoAvailable] = useState(false);
  const [lastActionResult, setLastActionResult] = useState<string>('');
  
  const mediaLoaderOptions = useMemo(() => ({
    initialPageSize: 50, // Load enough for smooth swiping without overwhelming
    sortOrder: 'desc' as const
  }), []);
  
  const mediaLoader = useMediaLoader(mediaLoaderOptions);
  
  const swipeActionsService = SwipeActionsService.getInstance();

  // Handle album selection change
  const handleAlbumChange = useCallback(async (newAlbum: Album | 'all') => {
    if (newAlbum === selectedAlbum) return;
    
    setSelectedAlbum(newAlbum);
    setCurrentCardIndex(0); // Reset to first card
    
    try {
      await mediaLoader.refresh(newAlbum);
    } catch (error) {
      console.error('Error switching album:', error);
      Alert.alert('Errore', 'Impossibile caricare il nuovo album');
    }
  }, [selectedAlbum, mediaLoader]);

  // Load media when component mounts or album changes
  useEffect(() => {
    const loadInitialMedia = async () => {
      try {
        await mediaLoader.loadMedia(selectedAlbum);
      } catch (error) {
        console.error('Error loading media for swiping:', error);
        Alert.alert(
          'Errore',
          'Impossibile caricare i media per la pulizia.',
          [{ text: 'OK', onPress: onBack }]
        );
      }
    };

    loadInitialMedia();
  }, [selectedAlbum, mediaLoader, onBack]);

  // Auto-load more content when approaching end
  useEffect(() => {
    const loadMoreIfNeeded = async () => {
      if (mediaLoader.needsMoreContent(currentCardIndex) && mediaLoader.hasMore()) {
        try {
          await mediaLoader.loadMore(selectedAlbum);
        } catch (error) {
          console.error('Error loading more media:', error);
        }
      }
    };

    loadMoreIfNeeded();
  }, [currentCardIndex, mediaLoader, selectedAlbum]);

  const handleSwipe = useCallback(async (direction: SwipeDirection, asset: MediaAsset, swipeIndex?: number) => {
    // Ensure we're only processing swipes for the current card
    if (swipeIndex !== undefined && swipeIndex !== currentCardIndex) {
      return;
    }
    try {
      // Map swipe direction to action type
      const actionMap = {
        'left': 'trash' as const,
        'right': 'keep' as const,
        'up': 'favorites' as const,
      };
      
      const action = actionMap[direction];
      
      // Execute the swipe action
      const result = await swipeActionsService.executeSwipeAction(asset, action);
      
      if (result.success) {
        // Update statistics
        setStats(prev => {
          const newStats = { ...prev };
          switch (direction) {
            case 'left':
              newStats.deleted++;
              break;
            case 'right':
              newStats.kept++;
              break;
            case 'up':
              newStats.favorites++;
              break;
          }
          newStats.total++;
          return newStats;
        });

        // Update UI feedback
        setLastActionResult(result.message || '');
        setUndoAvailable(result.undoAvailable || false);
        
        // Check for milestone haptics
        await swipeActionsService.checkForMilestones(stats.total + 1);
      } else {
        // Show error message
        Alert.alert('Errore', result.message || 'Errore durante l\'esecuzione dell\'azione');
        return; // Don't advance to next card on error
      }

      // Move to next card
      const nextIndex = currentCardIndex + 1;
      setCurrentCardIndex(nextIndex);

      // Check if we've reached the end
      if (nextIndex >= mediaLoader.assets.length && !mediaLoader.hasMore()) {
        // Give a small delay for the animation to complete
        setTimeout(() => {
          handleComplete();
        }, 500);
      }
      
    } catch (error) {
      console.error('Error handling swipe:', error);
      Alert.alert('Errore', 'Errore inaspettato durante l\'azione');
    }
  }, [currentCardIndex, mediaLoader, stats.total, swipeActionsService, onComplete]);

  const handleUndo = useCallback(async () => {
    try {
      const result = await swipeActionsService.undoLastAction();
      
      if (result.success) {
        // Move back to previous card
        const prevIndex = Math.max(0, currentCardIndex - 1);
        setCurrentCardIndex(prevIndex);
        
        // Update stats by reversing the last action
        setStats(prev => ({
          ...prev,
          total: Math.max(0, prev.total - 1),
          deleted: Math.max(0, prev.deleted - (lastActionResult.includes('cestino') ? 1 : 0)),
          kept: Math.max(0, prev.kept - (lastActionResult.includes('mantenuta') ? 1 : 0)),
          favorites: Math.max(0, prev.favorites - (lastActionResult.includes('preferiti') ? 1 : 0)),
        }));
        
        // Update UI state
        setUndoAvailable(false);
        setLastActionResult('Azione annullata');
        
        // Success haptic
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
      } else {
        Alert.alert('Impossibile annullare', result.message || 'Nessuna azione da annullare');
      }
    } catch (error) {
      console.error('Error undoing action:', error);
      Alert.alert('Errore', 'Errore durante l\'annullamento');
    }
  }, [swipeActionsService, currentCardIndex, lastActionResult]);

  const handleComplete = useCallback(() => {
    const totalProcessed = stats.total; 
    
    Alert.alert(
      'Pulizia completata!',
      `Hai processato ${totalProcessed} media:\n• ${stats.deleted} eliminati\n• ${stats.kept} mantenuti\n• ${stats.favorites} preferiti`,
      [
        {
          text: 'Continua',
          onPress: () => {
            onComplete?.();
            onBack();
          }
        }
      ]
    );
  }, [stats, onComplete, onBack]);

  const getCurrentAsset = useCallback((): MediaAsset | null => {
    return mediaLoader.assets[currentCardIndex] || null;
  }, [mediaLoader.assets, currentCardIndex]);

  const getProgress = useCallback(() => {
    const total = mediaLoader.totalCount || mediaLoader.assets.length;
    const current = currentCardIndex + 1;
    const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
    
    return {
      current,
      total,
      percentage,
    };
  }, [mediaLoader.totalCount, mediaLoader.assets.length, currentCardIndex]);

  const getAlbumName = useCallback(() => {
    if (selectedAlbum === 'all') return 'Tutte le foto';
    return selectedAlbum.title;
  }, [selectedAlbum]);

  // Move all hooks to top level - NEVER call hooks after conditional returns
  const currentAsset = useMemo(() => getCurrentAsset(), [getCurrentAsset]);
  const progress = useMemo(() => getProgress(), [getProgress]);

  // Handle loading state
  if (mediaLoader.loading && mediaLoader.assets.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Theme.colors.primary.main} />
          <ThemedText variant="body" style={styles.loadingText}>
            Preparazione delle foto...
          </ThemedText>
          <ThemedText variant="caption" style={styles.loadingSubtext}>
            {getAlbumName()}
          </ThemedText>
        </View>
      </View>
    );
  }

  // Handle error state
  if (mediaLoader.error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={Theme.colors.system.error} />
          <ThemedText variant="body" style={styles.errorText}>
            {mediaLoader.error}
          </ThemedText>
          <Button
            title="Riprova"
            onPress={() => mediaLoader.refresh(selectedAlbum)}
            style={styles.retryButton}
          />
          <Button
            title="Indietro"
            variant="secondary"
            onPress={onBack}
            style={styles.backButton}
          />
        </View>
      </View>
    );
  }

  // Handle empty state
  if (!currentAsset) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="checkmark-circle" size={64} color={Theme.colors.system.success} />
          <ThemedText variant="title" style={styles.emptyTitle}>
            Album completato!
          </ThemedText>
          <ThemedText variant="body" style={styles.emptyText}>
            Hai terminato la pulizia di questo album.
          </ThemedText>
          <Button
            title="Torna alla selezione"
            onPress={onBack}
            style={styles.backButton}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with progress */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <AlbumDropdown
            selectedAlbum={selectedAlbum}
            onSelectAlbum={handleAlbumChange}
            style={styles.albumDropdown}
          />
          <View style={styles.albumInfo}>
            <ThemedText variant="caption" color="secondary" style={styles.progressInfo}>
              {progress.current} di {progress.total.toLocaleString('it-IT')}
            </ThemedText>
          </View>
        </View>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[styles.progressFill, { width: `${progress.percentage}%` }]}
            />
          </View>
          <ThemedText variant="caption" style={styles.progressText}>
            {progress.percentage}%
          </ThemedText>
        </View>

        {/* Action Feedback and Statistics */}
        <View style={styles.actionFeedbackContainer}>
          {lastActionResult ? (
            <View style={styles.actionFeedback}>
              <ThemedText variant="caption" style={styles.actionText}>
                {lastActionResult}
              </ThemedText>
              {undoAvailable && (
                <TouchableOpacity onPress={handleUndo} style={styles.undoButton}>
                  <Ionicons name="arrow-undo" size={16} color={Theme.colors.primary.main} />
                  <ThemedText variant="caption" style={styles.undoText}>
                    Annulla
                  </ThemedText>
                </TouchableOpacity>
              )}
            </View>
          ) : null}
        </View>

        {/* Statistics */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Ionicons name="trash" size={16} color={Theme.colors.system.error} />
            <ThemedText variant="caption" style={styles.statText}>
              {stats.deleted}
            </ThemedText>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="checkmark-circle" size={16} color={Theme.colors.system.success} />
            <ThemedText variant="caption" style={styles.statText}>
              {stats.kept}
            </ThemedText>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="heart" size={16} color={Theme.colors.secondary.main} />
            <ThemedText variant="caption" style={styles.statText}>
              {stats.favorites}
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Card Stack */}
      <View style={styles.cardContainer}>
        <CardStack
          assets={mediaLoader.assets}
          currentIndex={currentCardIndex}
          onSwipe={handleSwipe}
          onLoadError={(asset) => {
            // Could implement error handling here if needed
          }}
        />
      </View>

      {/* Instructions */}
      <View style={styles.instructions}>
        <View style={styles.instructionItem}>
          <View style={styles.swipeIndicator}>
            <Ionicons name="arrow-back" size={20} color={Theme.colors.system.error} />
          </View>
          <ThemedText variant="caption" style={styles.instructionText}>
            Scorri a sinistra per eliminare
          </ThemedText>
        </View>
        <View style={styles.instructionItem}>
          <View style={styles.swipeIndicator}>
            <Ionicons name="arrow-up" size={20} color={Theme.colors.secondary.main} />
          </View>
          <ThemedText variant="caption" style={styles.instructionText}>
            Scorri in alto per i preferiti
          </ThemedText>
        </View>
        <View style={styles.instructionItem}>
          <View style={styles.swipeIndicator}>
            <Ionicons name="arrow-forward" size={20} color={Theme.colors.system.success} />
          </View>
          <ThemedText variant="caption" style={styles.instructionText}>
            Scorri a destra per mantenere
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background.primary,
  },
  header: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.background.tertiary,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  albumDropdown: {
    flex: 1,
    maxWidth: 200,
  },
  albumInfo: {
    alignItems: 'flex-end',
    marginLeft: Theme.spacing.md,
  },
  progressInfo: {
    textAlign: 'right',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.sm,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: Theme.colors.background.tertiary,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Theme.colors.primary.main,
  },
  progressText: {
    color: Theme.colors.text.secondary,
    minWidth: 35,
    textAlign: 'right',
  },
  actionFeedbackContainer: {
    minHeight: 28,
    justifyContent: 'center',
    marginBottom: Theme.spacing.xs,
  },
  actionFeedback: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.sm,
  },
  actionText: {
    color: Theme.colors.text.secondary,
    flex: 1,
  },
  undoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: Theme.spacing.sm,
    backgroundColor: Theme.colors.background.tertiary,
    borderRadius: Theme.spacing.radius.sm,
  },
  undoText: {
    color: Theme.colors.primary.main,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    color: Theme.colors.text.secondary,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  instructions: {
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    gap: Theme.spacing.xs,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
  },
  swipeIndicator: {
    width: 32,
    alignItems: 'center',
  },
  instructionText: {
    color: Theme.colors.text.tertiary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.xl,
  },
  loadingText: {
    color: Theme.colors.text.secondary,
    marginTop: Theme.spacing.md,
    textAlign: 'center',
  },
  loadingSubtext: {
    color: Theme.colors.text.tertiary,
    marginTop: Theme.spacing.sm,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.xl,
  },
  errorText: {
    color: Theme.colors.system.error,
    marginTop: Theme.spacing.md,
    marginBottom: Theme.spacing.lg,
    textAlign: 'center',
  },
  retryButton: {
    marginBottom: Theme.spacing.md,
  },
  backButton: {
    marginTop: Theme.spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.xl,
  },
  emptyTitle: {
    color: Theme.colors.text.primary,
    marginTop: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
    textAlign: 'center',
  },
  emptyText: {
    color: Theme.colors.text.secondary,
    marginBottom: Theme.spacing.lg,
    textAlign: 'center',
  },
});