import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import SwipeCard, { SwipeDirection } from './SwipeCard';
import AlbumDropdown from './AlbumDropdown';
import { ThemedText, Button } from './UI';
import { Theme } from '../constants/Theme';
import { useMediaLoader } from '../hooks/useMediaLoader';
import { MediaAsset, Album } from '../services/MediaLibraryService';
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
  
  const mediaLoader = useMediaLoader({ 
    initialPageSize: 100, // Load more for smooth swiping
    sortOrder: 'desc' 
  });

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
      if (mediaLoader.needsMoreContent() && mediaLoader.hasMore()) {
        try {
          await mediaLoader.loadMore(selectedAlbum);
        } catch (error) {
          console.error('Error loading more media:', error);
        }
      }
    };

    loadMoreIfNeeded();
  }, [currentCardIndex, mediaLoader, selectedAlbum]);

  const handleSwipe = useCallback(async (direction: SwipeDirection, asset: MediaAsset) => {
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

    // TODO: In the future, we'll actually implement:
    // - Adding to trash for 'left' swipe
    // - Adding to favorites for 'up' swipe
    // - For now, we just track statistics

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

    // Haptic feedback for milestone achievements
    if (stats.total > 0 && (stats.total + 1) % 10 === 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  }, [currentCardIndex, mediaLoader, stats.total, onComplete]);

  const handleComplete = useCallback(() => {
    const totalProcessed = stats.total + 1; // +1 for the current swipe
    
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

  const getCurrentAsset = (): MediaAsset | null => {
    return mediaLoader.assets[currentCardIndex] || null;
  };

  const getProgress = () => {
    const total = mediaLoader.totalCount || mediaLoader.assets.length;
    const current = currentCardIndex + 1;
    const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
    
    return {
      current,
      total,
      percentage,
    };
  };

  const getAlbumName = () => {
    if (selectedAlbum === 'all') return 'Tutte le foto';
    return selectedAlbum.title;
  };

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

  const currentAsset = getCurrentAsset();
  const progress = getProgress();

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

      {/* Swipe Card */}
      <View style={styles.cardContainer}>
        <SwipeCard
          asset={currentAsset}
          onSwipe={handleSwipe}
          index={currentCardIndex}
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