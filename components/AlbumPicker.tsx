import React, { useState, useEffect } from 'react';
import { 
  View, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './UI';
import Card from './UI/Card';
import { Theme } from '../constants/Theme';
import { MediaLibraryService, Album } from '../services/MediaLibraryService';
import localeStrings from '../locales/it.json';

interface AlbumPickerProps {
  onSelectAlbum: (album: Album | 'all') => void;
  visible: boolean;
  onClose: () => void;
}

export default function AlbumPicker({ onSelectAlbum, visible, onClose }: AlbumPickerProps) {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(false);
  const mediaService = MediaLibraryService.getInstance();

  useEffect(() => {
    if (visible) {
      loadAlbums();
    }
  }, [visible]);

  const loadAlbums = async () => {
    setLoading(true);
    try {
      const albumList = await mediaService.getAlbums();
      setAlbums(albumList);
    } catch (error) {
      console.error('Error loading albums:', error);
      Alert.alert('Errore', 'Impossibile caricare gli album');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAlbum = (album: Album | 'all') => {
    onSelectAlbum(album);
    onClose();
  };

  const formatPhotoCount = (count: number): string => {
    return localeStrings.albums.picker.photoCount.replace('{count}', count.toLocaleString('it-IT'));
  };

  const getAlbumIcon = (album: Album): keyof typeof Ionicons.glyphMap => {
    const titleLower = album.title.toLowerCase();
    
    if (titleLower.includes('selfie')) return 'camera-reverse';
    if (titleLower.includes('video')) return 'videocam';
    if (titleLower.includes('whatsapp')) return 'chatbubbles';
    if (titleLower.includes('screenshot') || titleLower.includes('schermat')) return 'phone-portrait';
    if (titleLower.includes('favorite') || titleLower.includes('preferit')) return 'heart';
    if (titleLower.includes('camera') || titleLower.includes('fotocamera')) return 'camera';
    
    return album.isSmartAlbum ? 'folder-open' : 'folder';
  };

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <View style={styles.header}>
          <ThemedText variant="title1" style={styles.title}>
            {localeStrings.albums.picker.title}
          </ThemedText>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons 
              name="close" 
              size={24} 
              color={Theme.colors.text.secondary} 
            />
          </TouchableOpacity>
        </View>
        
        <ThemedText variant="body" style={styles.subtitle}>
          {localeStrings.albums.picker.subtitle}
        </ThemedText>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Theme.colors.primary.main} />
            <ThemedText variant="body" style={styles.loadingText}>
              {localeStrings.common.loading}
            </ThemedText>
          </View>
        ) : (
          <ScrollView style={styles.albumsList} showsVerticalScrollIndicator={false}>
            {/* All Photos Option */}
            <TouchableOpacity onPress={() => handleSelectAlbum('all')}>
              <Card style={styles.albumCard}>
                <View style={styles.albumContent}>
                  <View style={styles.albumIcon}>
                    <Ionicons 
                      name="images" 
                      size={24} 
                      color={Theme.colors.primary.main} 
                    />
                  </View>
                  <View style={styles.albumInfo}>
                    <ThemedText variant="body" style={styles.albumTitle}>
                      {localeStrings.albums.picker.allPhotos}
                    </ThemedText>
                    <ThemedText variant="caption1" style={styles.albumSubtitle}>
                      Tutte le foto e video del dispositivo
                    </ThemedText>
                  </View>
                  <Ionicons 
                    name="chevron-forward" 
                    size={20} 
                    color={Theme.colors.text.tertiary} 
                  />
                </View>
              </Card>
            </TouchableOpacity>

            {/* Album List */}
            {albums.length === 0 ? (
              <Card style={styles.emptyCard}>
                <View style={styles.emptyContent}>
                  <Ionicons 
                    name="folder-open-outline" 
                    size={48} 
                    color={Theme.colors.text.tertiary} 
                  />
                  <ThemedText variant="body" style={styles.emptyText}>
                    {localeStrings.albums.picker.noAlbums}
                  </ThemedText>
                </View>
              </Card>
            ) : (
              albums.map((album) => (
                <TouchableOpacity 
                  key={album.id} 
                  onPress={() => handleSelectAlbum(album)}
                >
                  <Card style={styles.albumCard}>
                    <View style={styles.albumContent}>
                      <View style={styles.albumIcon}>
                        <Ionicons 
                          name={getAlbumIcon(album)} 
                          size={24} 
                          color={album.isSmartAlbum ? Theme.colors.secondary.main : Theme.colors.primary.main} 
                        />
                      </View>
                      <View style={styles.albumInfo}>
                        <ThemedText variant="body" style={styles.albumTitle}>
                          {album.title}
                        </ThemedText>
                        <ThemedText variant="caption1" style={styles.albumSubtitle}>
                          {formatPhotoCount(album.assetCount)}
                          {album.isSmartAlbum && ' • Album intelligente'}
                        </ThemedText>
                      </View>
                      <Ionicons 
                        name="chevron-forward" 
                        size={20} 
                        color={Theme.colors.text.tertiary} 
                      />
                    </View>
                  </Card>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: Theme.colors.background.primary,
    borderTopLeftRadius: Theme.spacing.radius.xl,
    borderTopRightRadius: Theme.spacing.radius.xl,
    maxHeight: '80%',
    paddingTop: Theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: Theme.spacing.sm,
  },
  title: {
    color: Theme.colors.text.primary,
  },
  closeButton: {
    padding: Theme.spacing.xs,
  },
  subtitle: {
    color: Theme.colors.text.secondary,
    paddingHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
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
  albumsList: {
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: Theme.spacing.lg,
  },
  albumCard: {
    marginBottom: Theme.spacing.sm,
  },
  albumContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  albumIcon: {
    width: 40,
    height: 40,
    borderRadius: Theme.spacing.radius.md,
    backgroundColor: Theme.colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Theme.spacing.md,
  },
  albumInfo: {
    flex: 1,
  },
  albumTitle: {
    color: Theme.colors.text.primary,
    marginBottom: 2,
  },
  albumSubtitle: {
    color: Theme.colors.text.tertiary,
  },
  emptyCard: {
    marginTop: Theme.spacing.xl,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: Theme.spacing.lg,
  },
  emptyText: {
    color: Theme.colors.text.tertiary,
    marginTop: Theme.spacing.md,
  },
});