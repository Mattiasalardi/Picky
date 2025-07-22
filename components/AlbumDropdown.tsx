import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './UI';
import Card from './UI/Card';
import { Theme } from '../constants/Theme';
import { MediaLibraryService, Album } from '../services/MediaLibraryService';

interface AlbumDropdownProps {
  selectedAlbum: Album | 'all';
  onSelectAlbum: (album: Album | 'all') => void;
  style?: any;
}

export default function AlbumDropdown({ 
  selectedAlbum, 
  onSelectAlbum, 
  style 
}: AlbumDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(false);
  
  const mediaService = MediaLibraryService.getInstance();

  useEffect(() => {
    loadAlbums();
  }, []);

  const loadAlbums = async () => {
    setLoading(true);
    try {
      const albumList = await mediaService.getAlbums();
      setAlbums(albumList);
    } catch (error) {
      console.error('Error loading albums:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSelectedAlbumText = () => {
    if (selectedAlbum === 'all') return 'Tutte le foto';
    return selectedAlbum.title;
  };

  const handleSelectAlbum = (album: Album | 'all') => {
    onSelectAlbum(album);
    setIsOpen(false);
  };

  const formatPhotoCount = (count: number): string => {
    return `${count.toLocaleString('it-IT')} foto`;
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

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity 
        style={styles.dropdownButton}
        onPress={() => setIsOpen(true)}
      >
        <View style={styles.buttonContent}>
          <ThemedText variant="callout" style={styles.selectedText}>
            {getSelectedAlbumText()}
          </ThemedText>
          <Ionicons 
            name="chevron-down" 
            size={16} 
            color={Theme.colors.text.secondary} 
          />
        </View>
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={styles.dropdownContent}>
            <View style={styles.header}>
              <ThemedText variant="title" style={styles.headerTitle}>
                Scegli Album
              </ThemedText>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <Ionicons 
                  name="close" 
                  size={24} 
                  color={Theme.colors.text.secondary} 
                />
              </TouchableOpacity>
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Theme.colors.primary.main} />
                <ThemedText variant="body" style={styles.loadingText}>
                  Caricamento album...
                </ThemedText>
              </View>
            ) : (
              <ScrollView style={styles.albumsList} showsVerticalScrollIndicator={false}>
                {/* All Photos Option */}
                <TouchableOpacity onPress={() => handleSelectAlbum('all')}>
                  <Card style={[
                    styles.albumItem, 
                    selectedAlbum === 'all' && styles.selectedAlbumItem
                  ]}>
                    <View style={styles.albumContent}>
                      <View style={styles.albumIcon}>
                        <Ionicons 
                          name="images" 
                          size={20} 
                          color={Theme.colors.primary.main} 
                        />
                      </View>
                      <View style={styles.albumInfo}>
                        <ThemedText variant="body" style={styles.albumTitle}>
                          Tutte le foto
                        </ThemedText>
                        <ThemedText variant="caption" style={styles.albumSubtitle}>
                          Tutte le foto e video del dispositivo
                        </ThemedText>
                      </View>
                      {selectedAlbum === 'all' && (
                        <Ionicons 
                          name="checkmark" 
                          size={20} 
                          color={Theme.colors.primary.main} 
                        />
                      )}
                    </View>
                  </Card>
                </TouchableOpacity>

                {/* Album List */}
                {albums.map((album) => (
                  <TouchableOpacity 
                    key={album.id} 
                    onPress={() => handleSelectAlbum(album)}
                  >
                    <Card style={[
                      styles.albumItem,
                      selectedAlbum !== 'all' && selectedAlbum.id === album.id && styles.selectedAlbumItem
                    ]}>
                      <View style={styles.albumContent}>
                        <View style={styles.albumIcon}>
                          <Ionicons 
                            name={getAlbumIcon(album)} 
                            size={20} 
                            color={album.isSmartAlbum ? Theme.colors.secondary.main : Theme.colors.primary.main} 
                          />
                        </View>
                        <View style={styles.albumInfo}>
                          <ThemedText variant="body" style={styles.albumTitle}>
                            {album.title}
                          </ThemedText>
                          <ThemedText variant="caption" style={styles.albumSubtitle}>
                            {formatPhotoCount(album.assetCount)}
                            {album.isSmartAlbum && ' • Album intelligente'}
                          </ThemedText>
                        </View>
                        {selectedAlbum !== 'all' && selectedAlbum.id === album.id && (
                          <Ionicons 
                            name="checkmark" 
                            size={20} 
                            color={Theme.colors.primary.main} 
                          />
                        )}
                      </View>
                    </Card>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minWidth: 120,
  },
  dropdownButton: {
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    backgroundColor: Theme.colors.background.secondary,
    borderRadius: Theme.spacing.radius.sm,
    borderWidth: 1,
    borderColor: Theme.colors.ui.separator,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
  },
  selectedText: {
    color: Theme.colors.text.primary,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    paddingHorizontal: Theme.spacing.md,
  },
  dropdownContent: {
    backgroundColor: Theme.colors.background.primary,
    borderRadius: Theme.spacing.radius.lg,
    maxHeight: '70%',
    shadowColor: Theme.colors.ui.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.ui.separator,
  },
  headerTitle: {
    color: Theme.colors.text.primary,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: Theme.spacing.xl,
  },
  loadingText: {
    marginTop: Theme.spacing.md,
    color: Theme.colors.text.secondary,
  },
  albumsList: {
    maxHeight: 400,
  },
  albumItem: {
    margin: Theme.spacing.sm,
    marginBottom: Theme.spacing.xs,
  },
  selectedAlbumItem: {
    borderWidth: 2,
    borderColor: Theme.colors.primary.main,
  },
  albumContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  albumIcon: {
    width: 32,
    height: 32,
    borderRadius: Theme.spacing.radius.sm,
    backgroundColor: Theme.colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Theme.spacing.sm,
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
});