import AsyncStorage from '@react-native-async-storage/async-storage';

export interface StoredMediaAsset {
  id: string;
  filename: string;
  uri: string;
  fileSize?: number;
  timestamp: number;
  albumId?: string;
}

export interface SwipeAction {
  assetId: string;
  action: 'keep' | 'trash' | 'favorites';
  timestamp: number;
  undone?: boolean;
}

export interface SwipeSession {
  id: string;
  albumId: string | 'all';
  startTime: number;
  endTime?: number;
  actions: SwipeAction[];
  stats: {
    total: number;
    kept: number;
    deleted: number;
    favorites: number;
  };
}

export class StorageService {
  private static instance: StorageService;
  
  // Storage keys
  private static readonly KEYS = {
    TRASH: 'picky_trash',
    FAVORITES: 'picky_favorites', 
    SWIPE_HISTORY: 'picky_swipe_history',
    CURRENT_SESSION: 'picky_current_session',
    ALBUM_PROGRESS: 'picky_album_progress',
    STATISTICS: 'picky_statistics',
  };

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  private constructor() {}

  /**
   * Trash Management
   */
  async addToTrash(asset: StoredMediaAsset): Promise<void> {
    try {
      const trash = await this.getTrash();
      const newTrashItem = {
        ...asset,
        timestamp: Date.now(),
      };
      
      // Avoid duplicates
      if (!trash.find(item => item.id === asset.id)) {
        trash.push(newTrashItem);
        await AsyncStorage.setItem(StorageService.KEYS.TRASH, JSON.stringify(trash));
      }
    } catch (error) {
      console.error('Error adding to trash:', error);
      throw new Error('Impossibile aggiungere al cestino');
    }
  }

  async getTrash(): Promise<StoredMediaAsset[]> {
    try {
      const trashData = await AsyncStorage.getItem(StorageService.KEYS.TRASH);
      return trashData ? JSON.parse(trashData) : [];
    } catch (error) {
      console.error('Error getting trash:', error);
      return [];
    }
  }

  async removeFromTrash(assetId: string): Promise<void> {
    try {
      const trash = await this.getTrash();
      const filteredTrash = trash.filter(item => item.id !== assetId);
      await AsyncStorage.setItem(StorageService.KEYS.TRASH, JSON.stringify(filteredTrash));
    } catch (error) {
      console.error('Error removing from trash:', error);
      throw new Error('Impossibile rimuovere dal cestino');
    }
  }

  async emptyTrash(): Promise<void> {
    try {
      await AsyncStorage.setItem(StorageService.KEYS.TRASH, JSON.stringify([]));
    } catch (error) {
      console.error('Error emptying trash:', error);
      throw new Error('Impossibile svuotare il cestino');
    }
  }

  async getTrashSize(): Promise<number> {
    try {
      const trash = await this.getTrash();
      return trash.reduce((total, item) => total + (item.fileSize || 0), 0);
    } catch (error) {
      console.error('Error calculating trash size:', error);
      return 0;
    }
  }

  /**
   * Favorites Management
   */
  async addToFavorites(asset: StoredMediaAsset): Promise<void> {
    try {
      const favorites = await this.getFavorites();
      const newFavorite = {
        ...asset,
        timestamp: Date.now(),
      };
      
      // Avoid duplicates
      if (!favorites.find(item => item.id === asset.id)) {
        favorites.push(newFavorite);
        await AsyncStorage.setItem(StorageService.KEYS.FAVORITES, JSON.stringify(favorites));
      }
    } catch (error) {
      console.error('Error adding to favorites:', error);
      throw new Error('Impossibile aggiungere ai preferiti');
    }
  }

  async getFavorites(): Promise<StoredMediaAsset[]> {
    try {
      const favoritesData = await AsyncStorage.getItem(StorageService.KEYS.FAVORITES);
      return favoritesData ? JSON.parse(favoritesData) : [];
    } catch (error) {
      console.error('Error getting favorites:', error);
      return [];
    }
  }

  async removeFromFavorites(assetId: string): Promise<void> {
    try {
      const favorites = await this.getFavorites();
      const filteredFavorites = favorites.filter(item => item.id !== assetId);
      await AsyncStorage.setItem(StorageService.KEYS.FAVORITES, JSON.stringify(filteredFavorites));
    } catch (error) {
      console.error('Error removing from favorites:', error);
      throw new Error('Impossibile rimuovere dai preferiti');
    }
  }

  /**
   * Swipe Actions History
   */
  async recordSwipeAction(assetId: string, action: 'keep' | 'trash' | 'favorites'): Promise<void> {
    try {
      const history = await this.getSwipeHistory();
      const newAction: SwipeAction = {
        assetId,
        action,
        timestamp: Date.now(),
      };
      
      history.push(newAction);
      
      // Keep only last 1000 actions to avoid storage bloat
      if (history.length > 1000) {
        history.splice(0, history.length - 1000);
      }
      
      await AsyncStorage.setItem(StorageService.KEYS.SWIPE_HISTORY, JSON.stringify(history));
    } catch (error) {
      console.error('Error recording swipe action:', error);
      // Don't throw error for history recording - it's not critical
    }
  }

  async getSwipeHistory(): Promise<SwipeAction[]> {
    try {
      const historyData = await AsyncStorage.getItem(StorageService.KEYS.SWIPE_HISTORY);
      return historyData ? JSON.parse(historyData) : [];
    } catch (error) {
      console.error('Error getting swipe history:', error);
      return [];
    }
  }

  async getLastSwipeAction(): Promise<SwipeAction | null> {
    try {
      const history = await this.getSwipeHistory();
      return history.length > 0 ? history[history.length - 1] : null;
    } catch (error) {
      console.error('Error getting last swipe action:', error);
      return null;
    }
  }

  async undoLastSwipeAction(): Promise<SwipeAction | null> {
    try {
      const history = await this.getSwipeHistory();
      const lastAction = history[history.length - 1];
      
      if (!lastAction || lastAction.undone) {
        return null;
      }
      
      // Mark as undone
      lastAction.undone = true;
      await AsyncStorage.setItem(StorageService.KEYS.SWIPE_HISTORY, JSON.stringify(history));
      
      return lastAction;
    } catch (error) {
      console.error('Error undoing swipe action:', error);
      return null;
    }
  }

  /**
   * Album Progress Tracking
   */
  async saveAlbumProgress(albumId: string | 'all', currentIndex: number): Promise<void> {
    try {
      const progress = await this.getAlbumProgress();
      progress[albumId] = {
        currentIndex,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(StorageService.KEYS.ALBUM_PROGRESS, JSON.stringify(progress));
    } catch (error) {
      console.error('Error saving album progress:', error);
    }
  }

  async getAlbumProgress(): Promise<Record<string, { currentIndex: number; timestamp: number }>> {
    try {
      const progressData = await AsyncStorage.getItem(StorageService.KEYS.ALBUM_PROGRESS);
      return progressData ? JSON.parse(progressData) : {};
    } catch (error) {
      console.error('Error getting album progress:', error);
      return {};
    }
  }

  /**
   * Statistics Management
   */
  async updateStatistics(stats: { deleted: number; kept: number; favorites: number; bytesDeleted: number }): Promise<void> {
    try {
      const currentStats = await this.getStatistics();
      const updatedStats = {
        totalProcessed: currentStats.totalProcessed + stats.deleted + stats.kept + stats.favorites,
        totalDeleted: currentStats.totalDeleted + stats.deleted,
        totalKept: currentStats.totalKept + stats.kept,
        totalFavorites: currentStats.totalFavorites + stats.favorites,
        totalBytesFreed: currentStats.totalBytesFreed + stats.bytesDeleted,
        lastUpdated: Date.now(),
      };
      
      await AsyncStorage.setItem(StorageService.KEYS.STATISTICS, JSON.stringify(updatedStats));
    } catch (error) {
      console.error('Error updating statistics:', error);
    }
  }

  async getStatistics(): Promise<{
    totalProcessed: number;
    totalDeleted: number;
    totalKept: number;
    totalFavorites: number;
    totalBytesFreed: number;
    lastUpdated: number;
  }> {
    try {
      const statsData = await AsyncStorage.getItem(StorageService.KEYS.STATISTICS);
      return statsData ? JSON.parse(statsData) : {
        totalProcessed: 0,
        totalDeleted: 0,
        totalKept: 0,
        totalFavorites: 0,
        totalBytesFreed: 0,
        lastUpdated: 0,
      };
    } catch (error) {
      console.error('Error getting statistics:', error);
      return {
        totalProcessed: 0,
        totalDeleted: 0,
        totalKept: 0,
        totalFavorites: 0,
        totalBytesFreed: 0,
        lastUpdated: 0,
      };
    }
  }

  /**
   * Clear all data (for settings reset)
   */
  async clearAllData(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(StorageService.KEYS.TRASH),
        AsyncStorage.removeItem(StorageService.KEYS.FAVORITES),
        AsyncStorage.removeItem(StorageService.KEYS.SWIPE_HISTORY),
        AsyncStorage.removeItem(StorageService.KEYS.CURRENT_SESSION),
        AsyncStorage.removeItem(StorageService.KEYS.ALBUM_PROGRESS),
        AsyncStorage.removeItem(StorageService.KEYS.STATISTICS),
      ]);
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw new Error('Impossibile cancellare i dati');
    }
  }
}