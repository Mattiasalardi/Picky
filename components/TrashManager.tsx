import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Video, ResizeMode } from 'expo-av';
import { ThemedText, Button, Card } from './UI';
import { Theme } from '../constants/Theme';
import { StorageService, StoredMediaAsset } from '../services/StorageService';
import { SwipeActionsService } from '../services/SwipeActionsService';
import localeStrings from '../locales/it.json';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_COLUMNS = 3;
const GRID_SPACING = Theme.spacing.sm;
const GRID_ITEM_SIZE = (SCREEN_WIDTH - (Theme.spacing.layout.screenPadding * 2) - (GRID_SPACING * (GRID_COLUMNS - 1))) / GRID_COLUMNS;

interface TrashManagerProps {
  onTrashEmptied?: () => void;
  onItemRestored?: (item: StoredMediaAsset) => void;
}

export default function TrashManager({ onTrashEmptied, onItemRestored }: TrashManagerProps) {
  const [trashItems, setTrashItems] = useState<StoredMediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [emptyingTrash, setEmptyingTrash] = useState(false);
  const [trashSize, setTrashSize] = useState<string>('0,0 MB');
  
  const storageService = StorageService.getInstance();
  const swipeActionsService = SwipeActionsService.getInstance();

  const loadTrashData = useCallback(async () => {
    try {
      const [items, info] = await Promise.all([
        storageService.getTrash(),
        swipeActionsService.getTrashInfo()
      ]);
      
      // Sort by timestamp (most recently deleted first)
      const sortedItems = items.sort((a, b) => b.timestamp - a.timestamp);
      
      setTrashItems(sortedItems);
      setTrashSize(info.sizeMB);
    } catch (error) {
      console.error('Error loading trash data:', error);
      Alert.alert('Errore', 'Impossibile caricare i dati del cestino');
    }
  }, []);

  const refreshTrashData = useCallback(async () => {
    setRefreshing(true);
    await loadTrashData();
    setRefreshing(false);
  }, [loadTrashData]);

  useEffect(() => {
    const initializeTrash = async () => {
      await loadTrashData();
      setLoading(false);
    };
    
    initializeTrash();
  }, [loadTrashData]);

  const handleEmptyTrash = useCallback(() => {
    if (trashItems.length === 0) {
      Alert.alert('Cestino vuoto', 'Il cestino è già vuoto');
      return;
    }

    Alert.alert(
      'Svuota cestino',
      `Sei sicuro di voler eliminare definitivamente ${trashItems.length} elementi dal cestino? Questa azione non può essere annullata.`,
      [
        {
          text: 'Annulla',
          style: 'cancel',
        },
        {
          text: 'Elimina definitivamente',
          style: 'destructive',
          onPress: async () => {
            setEmptyingTrash(true);
            try {
              await swipeActionsService.emptyTrash();
              setTrashItems([]);
              setTrashSize('0,0 MB');
              
              // Success haptic and callback
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              onTrashEmptied?.();
              
              Alert.alert(
                'Cestino svuotato',
                'Tutti gli elementi sono stati eliminati definitivamente dal cestino.'
              );
            } catch (error) {
              console.error('Error emptying trash:', error);
              Alert.alert('Errore', 'Impossibile svuotare il cestino');
            } finally {
              setEmptyingTrash(false);
            }
          },
        },
      ]
    );
  }, [trashItems.length, swipeActionsService, onTrashEmptied]);

  const handleRestoreItem = useCallback(async (item: StoredMediaAsset) => {
    Alert.alert(
      'Ripristina elemento',
      `Vuoi ripristinare "${item.filename}"?`,
      [
        {
          text: 'Annulla',
          style: 'cancel',
        },
        {
          text: 'Ripristina',
          onPress: async () => {
            try {
              await storageService.removeFromTrash(item.id);
              
              // Update local state
              setTrashItems(prev => prev.filter(trashItem => trashItem.id !== item.id));
              
              // Update trash size
              const updatedInfo = await swipeActionsService.getTrashInfo();
              setTrashSize(updatedInfo.sizeMB);
              
              // Success haptic and callback
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              onItemRestored?.(item);
              
              Alert.alert('Ripristinato', `"${item.filename}" è stato ripristinato dal cestino`);
            } catch (error) {
              console.error('Error restoring item:', error);
              Alert.alert('Errore', 'Impossibile ripristinare l\'elemento');
            }
          },
        },
      ]
    );
  }, [storageService, swipeActionsService, onItemRestored]);

  const renderTrashItem = useCallback((item: StoredMediaAsset, index: number) => {
    const isVideo = item.filename.toLowerCase().match(/\.(mp4|mov|avi|mkv|webm)$/);
    const fileSize = item.fileSize ? `${(item.fileSize / (1024 * 1024)).toFixed(1).replace('.', ',')} MB` : '';
    
    const deleteDate = new Date(item.timestamp).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.gridItem}
        onPress={() => handleRestoreItem(item)}
        activeOpacity={0.8}
      >
        <View style={styles.mediaContainer}>
          {isVideo ? (
            <View style={styles.videoContainer}>
              <Video
                source={{ uri: item.uri }}
                style={styles.media}
                resizeMode={ResizeMode.COVER}
                shouldPlay={false}
                isMuted
                isLooping={false}
              />
              <View style={styles.videoOverlay}>
                <Ionicons name="play-circle" size={24} color="white" />
              </View>
            </View>
          ) : (
            <Image
              source={{ uri: item.uri }}
              style={styles.media}
              resizeMode="cover"
            />
          )}
        </View>
        
        <View style={styles.itemInfo}>
          <ThemedText variant="caption1" style={styles.itemDate} numberOfLines={1}>
            {deleteDate}
          </ThemedText>
          {fileSize && (
            <ThemedText variant="caption1" style={styles.itemSize} numberOfLines={1}>
              {fileSize}
            </ThemedText>
          )}
        </View>
        
        <View style={styles.restoreButton}>
          <Ionicons name="arrow-undo" size={16} color={Theme.colors.primary.main} />
        </View>
      </TouchableOpacity>
    );
  }, [handleRestoreItem]);

  if (loading) {
    return (
      <Card style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Theme.colors.primary.main} />
          <ThemedText variant="body" style={styles.loadingText}>
            Caricamento cestino...
          </ThemedText>
        </View>
      </Card>
    );
  }

  return (
    <Card style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="trash-outline" size={24} color={Theme.colors.system.error} />
          <ThemedText variant="headline" style={styles.headerTitle}>
            Cestino
          </ThemedText>
        </View>
        <TouchableOpacity onPress={refreshTrashData} disabled={refreshing}>
          <Ionicons 
            name="refresh" 
            size={20} 
            color={refreshing ? Theme.colors.text.tertiary : Theme.colors.text.secondary} 
          />
        </TouchableOpacity>
      </View>

      {/* Statistics */}
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <ThemedText variant="title2" style={styles.statNumber}>
            {trashItems.length}
          </ThemedText>
          <ThemedText variant="caption1" color="secondary">
            elementi
          </ThemedText>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <ThemedText variant="title2" style={styles.statNumber}>
            {trashSize}
          </ThemedText>
          <ThemedText variant="caption1" color="secondary">
            dimensione
          </ThemedText>
        </View>
      </View>

      {/* Empty Trash Button */}
      <Button
        title={emptyingTrash ? "Svuotamento..." : "Svuota cestino"}
        onPress={handleEmptyTrash}
        disabled={trashItems.length === 0 || emptyingTrash}
        variant={trashItems.length === 0 ? "secondary" : "primary"}
        style={styles.emptyButton}
      />

      {/* Trash Items */}
      {trashItems.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="checkmark-circle-outline" size={48} color={Theme.colors.system.success} />
          <ThemedText variant="body" style={styles.emptyText}>
            Il cestino è vuoto
          </ThemedText>
          <ThemedText variant="caption1" color="tertiary" style={styles.emptySubtext}>
            Gli elementi eliminati appariranno qui
          </ThemedText>
        </View>
      ) : (
        <View style={styles.content}>
          <ThemedText variant="body" color="secondary" style={styles.sectionTitle}>
            Elementi eliminati di recente
          </ThemedText>
          <ScrollView 
            style={styles.gridContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.grid}>
              {trashItems.map(renderTrashItem)}
            </View>
          </ScrollView>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Theme.colors.background.secondary,
    marginVertical: Theme.spacing.sm,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: Theme.spacing.xl,
  },
  loadingText: {
    marginTop: Theme.spacing.md,
    color: Theme.colors.text.secondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
  },
  headerTitle: {
    color: Theme.colors.text.primary,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    color: Theme.colors.text.primary,
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Theme.colors.background.tertiary,
    marginHorizontal: Theme.spacing.md,
  },
  emptyButton: {
    marginBottom: Theme.spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Theme.spacing.xl,
  },
  emptyText: {
    marginTop: Theme.spacing.md,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
  },
  emptySubtext: {
    marginTop: Theme.spacing.sm,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    marginBottom: Theme.spacing.md,
  },
  gridContainer: {
    maxHeight: 300, // Limit height to avoid making the card too tall
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_SPACING,
  },
  gridItem: {
    width: GRID_ITEM_SIZE,
    backgroundColor: Theme.colors.background.tertiary,
    borderRadius: Theme.spacing.radius.md,
    overflow: 'hidden',
  },
  mediaContainer: {
    width: '100%',
    height: GRID_ITEM_SIZE,
    position: 'relative',
  },
  media: {
    width: '100%',
    height: '100%',
  },
  videoContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  itemInfo: {
    padding: Theme.spacing.xs,
    minHeight: 40,
  },
  itemDate: {
    color: Theme.colors.text.tertiary,
    fontSize: 10,
  },
  itemSize: {
    color: Theme.colors.text.secondary,
    fontSize: 10,
    marginTop: 2,
  },
  restoreButton: {
    position: 'absolute',
    top: Theme.spacing.xs,
    right: Theme.spacing.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
});