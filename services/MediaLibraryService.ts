import * as MediaLibrary from 'expo-media-library';

export type PermissionStatus = 'granted' | 'denied' | 'undetermined';

export interface MediaAsset {
  id: string;
  filename: string;
  uri: string;
  mediaType: MediaLibrary.MediaType;
  width: number;
  height: number;
  creationTime: number;
  modificationTime: number;
  duration?: number;
  albumId?: string;
  isInCloud?: boolean;
  fileSize?: number;
}

export interface MediaLoadOptions {
  albumId?: string;
  pageSize?: number;
  sortBy?: 'creationTime' | 'modificationTime';
  sortOrder?: 'asc' | 'desc';
  includeVideos?: boolean;
  includePhotos?: boolean;
}

export interface Album {
  id: string;
  title: string;
  assetCount: number;
  type?: string;
  isSmartAlbum?: boolean;
  priority?: number; // For sorting smart albums first
}

export class MediaLibraryService {
  private static instance: MediaLibraryService;
  private albumsCache: Album[] | null = null;
  private albumsCacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Smart album titles that get priority (Italian and English variants)
  private readonly PRIORITY_ALBUM_NAMES = [
    'selfie', 'selfies',
    'video', 'videos', 
    'whatsapp',
    'screenshot', 'screenshots', 'schermate',
    'camera', 'fotocamera',
    'favorites', 'preferiti', 'favourites'
  ];

  public static getInstance(): MediaLibraryService {
    if (!MediaLibraryService.instance) {
      MediaLibraryService.instance = new MediaLibraryService();
    }
    return MediaLibraryService.instance;
  }

  private constructor() {}

  /**
   * Request permission to access media library
   */
  async requestPermissions(): Promise<PermissionStatus> {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      
      switch (status) {
        case MediaLibrary.PermissionStatus.GRANTED:
          return 'granted';
        case MediaLibrary.PermissionStatus.DENIED:
          return 'denied';
        default:
          return 'undetermined';
      }
    } catch (error) {
      console.error('Error requesting media library permissions:', error);
      return 'denied';
    }
  }

  /**
   * Check current permission status
   */
  async getPermissionStatus(): Promise<PermissionStatus> {
    try {
      const { status } = await MediaLibrary.getPermissionsAsync();
      
      switch (status) {
        case MediaLibrary.PermissionStatus.GRANTED:
          return 'granted';
        case MediaLibrary.PermissionStatus.DENIED:
          return 'denied';
        default:
          return 'undetermined';
      }
    } catch (error) {
      console.error('Error checking media library permissions:', error);
      return 'denied';
    }
  }

  /**
   * Check if album cache is still valid
   */
  private isCacheValid(): boolean {
    const now = Date.now();
    return this.albumsCache !== null && (now - this.albumsCacheTimestamp) < this.CACHE_DURATION;
  }

  /**
   * Determine album priority based on title and type
   */
  private getAlbumPriority(album: any): number {
    const titleLower = album.title.toLowerCase();
    
    // Priority 1: Smart albums with special names
    if (this.PRIORITY_ALBUM_NAMES.some(name => titleLower.includes(name))) {
      return 1;
    }
    
    // Priority 2: User albums (non-smart albums)
    if (album.type !== 'smart') {
      return 2;
    }
    
    // Priority 3: Other smart albums
    return 3;
  }

  /**
   * Get all albums from device with smart sorting and caching
   */
  async getAlbums(forceRefresh: boolean = false): Promise<Album[]> {
    // Return cached albums if valid and not forcing refresh
    if (!forceRefresh && this.isCacheValid()) {
      return this.albumsCache!;
    }

    try {
      const albums = await MediaLibrary.getAlbumsAsync({
        includeSmartAlbums: true,
      });

      // Transform and enhance albums with priority info
      const enhancedAlbums: Album[] = albums
        .map(album => ({
          id: album.id,
          title: album.title,
          assetCount: album.assetCount,
          type: album.type,
          isSmartAlbum: album.type === 'smart',
          priority: this.getAlbumPriority(album),
        }))
        .filter(album => album.assetCount > 0) // Only include albums with photos
        .sort((a, b) => {
          // First sort by priority (smart albums first)
          if (a.priority !== b.priority) {
            return a.priority - b.priority;
          }
          // Then sort by asset count (largest first)
          return b.assetCount - a.assetCount;
        });

      // Cache the results
      this.albumsCache = enhancedAlbums;
      this.albumsCacheTimestamp = Date.now();

      return enhancedAlbums;
    } catch (error) {
      console.error('Error fetching albums:', error);
      return [];
    }
  }

  /**
   * Clear albums cache (useful when permissions change)
   */
  clearAlbumsCache(): void {
    this.albumsCache = null;
    this.albumsCacheTimestamp = 0;
  }

  /**
   * Get assets from a specific album
   */
  async getAssetsFromAlbum(
    albumId: string,
    first: number = 20,
    after?: string
  ): Promise<{
    assets: MediaAsset[];
    endCursor: string;
    hasNextPage: boolean;
  }> {
    try {
      const result = await MediaLibrary.getAssetsAsync({
        first,
        after,
        album: albumId,
        mediaType: [MediaLibrary.MediaType.photo, MediaLibrary.MediaType.video],
        sortBy: MediaLibrary.SortBy.creationTime,
      });

      const assets: MediaAsset[] = result.assets.map(asset => ({
        id: asset.id,
        filename: asset.filename,
        uri: asset.uri,
        mediaType: asset.mediaType,
        width: asset.width,
        height: asset.height,
        creationTime: asset.creationTime,
        modificationTime: asset.modificationTime,
        duration: asset.duration,
        albumId,
      }));

      return {
        assets,
        endCursor: result.endCursor,
        hasNextPage: result.hasNextPage,
      };
    } catch (error) {
      console.error('Error fetching assets from album:', error);
      return {
        assets: [],
        endCursor: '',
        hasNextPage: false,
      };
    }
  }

  /**
   * Get recent assets (all photos/videos)
   */
  async getRecentAssets(
    first: number = 20,
    after?: string
  ): Promise<{
    assets: MediaAsset[];
    endCursor: string;
    hasNextPage: boolean;
  }> {
    try {
      const result = await MediaLibrary.getAssetsAsync({
        first,
        after,
        mediaType: [MediaLibrary.MediaType.photo, MediaLibrary.MediaType.video],
        sortBy: MediaLibrary.SortBy.creationTime,
      });

      const assets: MediaAsset[] = result.assets.map(asset => ({
        id: asset.id,
        filename: asset.filename,
        uri: asset.uri,
        mediaType: asset.mediaType,
        width: asset.width,
        height: asset.height,
        creationTime: asset.creationTime,
        modificationTime: asset.modificationTime,
        duration: asset.duration,
      }));

      return {
        assets,
        endCursor: result.endCursor,
        hasNextPage: result.hasNextPage,
      };
    } catch (error) {
      console.error('Error fetching recent assets:', error);
      return {
        assets: [],
        endCursor: '',
        hasNextPage: false,
      };
    }
  }

  /**
   * Enhanced method to get media assets with flexible options
   */
  async getMediaAssets(
    options: MediaLoadOptions = {},
    after?: string
  ): Promise<{
    assets: MediaAsset[];
    endCursor: string;
    hasNextPage: boolean;
    totalCount?: number;
  }> {
    const {
      albumId,
      pageSize = 20,
      sortBy = 'creationTime',
      sortOrder = 'desc',
      includePhotos = true,
      includeVideos = true,
    } = options;

    try {
      // Determine media types to include
      const mediaTypes: MediaLibrary.MediaType[] = [];
      if (includePhotos) mediaTypes.push(MediaLibrary.MediaType.photo);
      if (includeVideos) mediaTypes.push(MediaLibrary.MediaType.video);

      if (mediaTypes.length === 0) {
        throw new Error('At least one media type must be included');
      }

      // Determine sort order
      const sortByOption = sortBy === 'creationTime' 
        ? MediaLibrary.SortBy.creationTime 
        : MediaLibrary.SortBy.modificationTime;

      const queryOptions: MediaLibrary.AssetsOptions = {
        first: pageSize,
        after,
        mediaType: mediaTypes,
        sortBy: [sortByOption],
      };

      // Add album filter if specified
      if (albumId) {
        queryOptions.album = albumId;
      }

      const result = await MediaLibrary.getAssetsAsync(queryOptions);

      // Enhanced asset mapping - get basic info first, detailed info on demand
      const assets: MediaAsset[] = result.assets.map((asset) => {
        const enhancedAsset: MediaAsset = {
          id: asset.id,
          filename: asset.filename,
          uri: asset.uri,
          mediaType: asset.mediaType,
          width: asset.width,
          height: asset.height,
          creationTime: asset.creationTime,
          modificationTime: asset.modificationTime,
          duration: asset.duration,
          albumId,
          isInCloud: asset.uri.startsWith('ph://'), // Simple heuristic
        };

        return enhancedAsset;
      });

      // Sort assets according to sortOrder (MediaLibrary doesn't support desc directly)
      const sortedAssets = sortOrder === 'desc' 
        ? assets.sort((a, b) => b[sortBy] - a[sortBy])
        : assets.sort((a, b) => a[sortBy] - b[sortBy]);

      return {
        assets: sortedAssets,
        endCursor: result.endCursor,
        hasNextPage: result.hasNextPage,
        totalCount: result.totalCount,
      };
    } catch (error) {
      console.error('Error fetching media assets:', error);
      return {
        assets: [],
        endCursor: '',
        hasNextPage: false,
        totalCount: 0,
      };
    }
  }

  /**
   * Get asset info including download progress for iCloud assets
   */
  async getAssetInfo(assetId: string): Promise<MediaLibrary.AssetInfo | null> {
    try {
      const info = await MediaLibrary.getAssetInfoAsync(assetId);
      return info;
    } catch (error) {
      console.error('Error getting asset info:', error);
      return null;
    }
  }

  /**
   * Download iCloud asset to device and get proper local URI
   */
  async downloadAsset(assetId: string): Promise<string | null> {
    try {
      const assetInfo = await MediaLibrary.getAssetInfoAsync(assetId);
      
      // If it's a network asset (iCloud), we need to get the local URI
      if (assetInfo.isNetworkAsset) {
        // The localUri should be available for network assets
        if (assetInfo.localUri && !assetInfo.localUri.startsWith('ph://')) {
          return assetInfo.localUri;
        }
        
        // If no localUri available, we can't use this asset
        console.warn('Network asset has no accessible localUri:', assetId);
        return null;
      }
      
      // For local assets, prefer localUri over uri
      const uri = assetInfo.localUri || assetInfo.uri;
      
      // Ensure we don't return ph:// URIs
      if (uri && uri.startsWith('ph://')) {
        console.warn('Asset still has ph:// URI after info fetch:', assetId);
        return null;
      }
      
      return uri;
    } catch (error) {
      console.error('Error downloading asset:', error);
      return null;
    }
  }

  /**
   * Delete assets from device
   */
  async deleteAssets(assetIds: string[]): Promise<boolean> {
    try {
      const result = await MediaLibrary.deleteAssetsAsync(assetIds);
      return result;
    } catch (error) {
      console.error('Error deleting assets:', error);
      return false;
    }
  }

  /**
   * Create album if it doesn't exist
   */
  async createAlbum(albumName: string): Promise<Album | null> {
    try {
      const album = await MediaLibrary.createAlbumAsync(albumName);
      return {
        id: album.id,
        title: album.title,
        assetCount: album.assetCount,
        type: album.type,
      };
    } catch (error) {
      console.error('Error creating album:', error);
      return null;
    }
  }

  /**
   * Add assets to album
   */
  async addAssetsToAlbum(assetIds: string[], albumId: string): Promise<boolean> {
    try {
      const result = await MediaLibrary.addAssetsToAlbumAsync(assetIds, albumId);
      return result;
    } catch (error) {
      console.error('Error adding assets to album:', error);
      return false;
    }
  }
}