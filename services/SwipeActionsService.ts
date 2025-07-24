import * as MediaLibrary from 'expo-media-library';
import * as Haptics from 'expo-haptics';
import { StorageService, StoredMediaAsset } from './StorageService';
import { MediaAsset } from './MediaLibraryService';

export type SwipeActionType = 'keep' | 'trash' | 'favorites';

export interface SwipeActionResult {
  success: boolean;
  message?: string;
  undoAvailable?: boolean;
}

export class SwipeActionsService {
  private static instance: SwipeActionsService;
  private storageService: StorageService;

  public static getInstance(): SwipeActionsService {
    if (!SwipeActionsService.instance) {
      SwipeActionsService.instance = new SwipeActionsService();
    }
    return SwipeActionsService.instance;
  }

  private constructor() {
    this.storageService = StorageService.getInstance();
  }

  /**
   * Execute a swipe action on a media asset
   */
  async executeSwipeAction(
    asset: MediaAsset, 
    action: SwipeActionType
  ): Promise<SwipeActionResult> {
    try {
      // Convert MediaAsset to StoredMediaAsset
      const storedAsset: StoredMediaAsset = {
        id: asset.id,
        filename: asset.filename,
        uri: asset.uri,
        fileSize: asset.fileSize,
        timestamp: Date.now(),
        albumId: asset.albumId,
      };

      switch (action) {
        case 'keep':
          return await this.handleKeepAction(storedAsset);
        
        case 'trash':
          return await this.handleTrashAction(storedAsset);
        
        case 'favorites':
          return await this.handleFavoritesAction(storedAsset);
        
        default:
          return {
            success: false,
            message: 'Azione non riconosciuta',
          };
      }
    } catch (error) {
      console.error('Error executing swipe action:', error);
      return {
        success: false,
        message: 'Errore durante l\'esecuzione dell\'azione',
      };
    }
  }

  /**
   * Handle 'keep' action - just record the action for statistics
   */
  private async handleKeepAction(asset: StoredMediaAsset): Promise<SwipeActionResult> {
    try {
      // Record the action for history and statistics
      await this.storageService.recordSwipeAction(asset.id, 'keep');
      
      // Update global statistics
      await this.updateGlobalStatistics({ kept: 1, deleted: 0, favorites: 0, bytesDeleted: 0 });
      
      // Provide gentle haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      return {
        success: true,
        message: 'Foto mantenuta',
        undoAvailable: true,
      };
    } catch (error) {
      console.error('Error handling keep action:', error);
      return {
        success: false,
        message: 'Errore nel mantenere la foto',
      };
    }
  }

  /**
   * Handle 'trash' action - add to in-app trash
   */
  private async handleTrashAction(asset: StoredMediaAsset): Promise<SwipeActionResult> {
    try {
      // Add to in-app trash
      await this.storageService.addToTrash(asset);
      
      // Record the action
      await this.storageService.recordSwipeAction(asset.id, 'trash');
      
      // Update global statistics
      await this.updateGlobalStatistics({ 
        kept: 0, 
        deleted: 1, 
        favorites: 0, 
        bytesDeleted: asset.fileSize || 0 
      });
      
      // Provide moderate haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      return {
        success: true,
        message: 'Foto spostata nel cestino',
        undoAvailable: true,
      };
    } catch (error) {
      console.error('Error handling trash action:', error);
      return {
        success: false,
        message: 'Errore nello spostare la foto nel cestino',
      };
    }
  }

  /**
   * Handle 'favorites' action - add to Picky Favorites
   */
  private async handleFavoritesAction(asset: StoredMediaAsset): Promise<SwipeActionResult> {
    try {
      // Add to favorites
      await this.storageService.addToFavorites(asset);
      
      // Record the action
      await this.storageService.recordSwipeAction(asset.id, 'favorites');
      
      // Update global statistics
      await this.updateGlobalStatistics({ kept: 0, deleted: 0, favorites: 1, bytesDeleted: 0 });
      
      // Provide strong haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      
      return {
        success: true,
        message: 'Foto aggiunta ai preferiti',
        undoAvailable: true,
      };
    } catch (error) {
      console.error('Error handling favorites action:', error);
      return {
        success: false,
        message: 'Errore nell\'aggiungere la foto ai preferiti',
      };
    }
  }

  /**
   * Undo the last swipe action
   */
  async undoLastAction(): Promise<SwipeActionResult> {
    try {
      const lastAction = await this.storageService.undoLastSwipeAction();
      
      if (!lastAction) {
        return {
          success: false,
          message: 'Nessuna azione da annullare',
        };
      }

      // Remove from appropriate storage based on action type
      switch (lastAction.action) {
        case 'trash':
          await this.storageService.removeFromTrash(lastAction.assetId);
          break;
        case 'favorites':
          await this.storageService.removeFromFavorites(lastAction.assetId);
          break;
        case 'keep':
          // Nothing to undo for keep action
          break;
      }

      // Provide confirmation haptic
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      return {
        success: true,
        message: 'Azione annullata',
        undoAvailable: false,
      };
    } catch (error) {
      console.error('Error undoing last action:', error);
      return {
        success: false,
        message: 'Errore nell\'annullare l\'azione',
      };
    }
  }

  /**
   * Check if undo is available
   */
  async isUndoAvailable(): Promise<boolean> {
    try {
      const lastAction = await this.storageService.getLastSwipeAction();
      return lastAction != null && !lastAction.undone;
    } catch (error) {
      console.error('Error checking undo availability:', error);
      return false;
    }
  }

  /**
   * Get statistics for current session
   */
  async getSessionStats(): Promise<{
    kept: number;
    deleted: number;
    favorites: number;
    total: number;
  }> {
    try {
      const history = await this.storageService.getSwipeHistory();
      
      // Count actions from today that haven't been undone
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayActions = history.filter(action => 
        action.timestamp >= today.getTime() && !action.undone
      );

      const stats = {
        kept: todayActions.filter(a => a.action === 'keep').length,
        deleted: todayActions.filter(a => a.action === 'trash').length,
        favorites: todayActions.filter(a => a.action === 'favorites').length,
        total: todayActions.length,
      };

      return stats;
    } catch (error) {
      console.error('Error getting session stats:', error);
      return { kept: 0, deleted: 0, favorites: 0, total: 0 };
    }
  }

  /**
   * Get trash size and count
   */
  async getTrashInfo(): Promise<{ count: number; sizeBytes: number; sizeMB: string }> {
    try {
      const trash = await this.storageService.getTrash();
      const sizeBytes = await this.storageService.getTrashSize();
      const sizeMB = (sizeBytes / (1024 * 1024)).toFixed(1).replace('.', ',');
      
      return {
        count: trash.length,
        sizeBytes,
        sizeMB: `${sizeMB} MB`,
      };
    } catch (error) {
      console.error('Error getting trash info:', error);
      return { count: 0, sizeBytes: 0, sizeMB: '0,0 MB' };
    }
  }

  /**
   * Get favorites count
   */
  async getFavoritesCount(): Promise<number> {
    try {
      const favorites = await this.storageService.getFavorites();
      return favorites.length;
    } catch (error) {
      console.error('Error getting favorites count:', error);
      return 0;
    }
  }

  /**
   * Empty trash (for later implementation)
   */
  async emptyTrash(): Promise<SwipeActionResult> {
    try {
      await this.storageService.emptyTrash();
      
      return {
        success: true,
        message: 'Cestino svuotato',
      };
    } catch (error) {
      console.error('Error emptying trash:', error);
      return {
        success: false,
        message: 'Errore nello svuotare il cestino',
      };
    }
  }

  /**
   * Calculate storage saved from deleted items
   */
  async getStorageSaved(): Promise<{ bytes: number; mb: string }> {
    try {
      const sizeBytes = await this.storageService.getTrashSize();
      const sizeMB = (sizeBytes / (1024 * 1024)).toFixed(1).replace('.', ',');
      
      return {
        bytes: sizeBytes,
        mb: `${sizeMB} MB`,
      };
    } catch (error) {
      console.error('Error calculating storage saved:', error);
      return { bytes: 0, mb: '0,0 MB' };
    }
  }

  /**
   * Update global statistics
   */
  private async updateGlobalStatistics(stats: { 
    kept: number; 
    deleted: number; 
    favorites: number; 
    bytesDeleted: number; 
  }): Promise<void> {
    try {
      await this.storageService.updateStatistics(stats);
    } catch (error) {
      console.error('Error updating global statistics:', error);
      // Don't throw - statistics updates are not critical for core functionality
    }
  }

  /**
   * Milestone haptic feedback
   */
  async checkForMilestones(totalProcessed: number): Promise<void> {
    try {
      // Every 10 items
      if (totalProcessed > 0 && totalProcessed % 10 === 0) {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }
      
      // Every 50 items - notification haptic
      if (totalProcessed > 0 && totalProcessed % 50 === 0) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      // Every 100 items - success notification
      if (totalProcessed > 0 && totalProcessed % 100 === 0) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        // Could add confetti animation here in the future
      }
    } catch (error) {
      console.error('Error checking milestones:', error);
    }
  }
}