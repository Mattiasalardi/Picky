import { useState, useEffect } from 'react';
import { MediaLibraryService, PermissionStatus } from '../services/MediaLibraryService';

export interface UseMediaLibraryPermissionsResult {
  permissionStatus: PermissionStatus;
  isLoading: boolean;
  requestPermission: () => Promise<PermissionStatus>;
  hasPermission: boolean;
}

export function useMediaLibraryPermissions(): UseMediaLibraryPermissionsResult {
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>('undetermined');
  const [isLoading, setIsLoading] = useState(true);

  const mediaService = MediaLibraryService.getInstance();

  useEffect(() => {
    checkInitialPermission();
  }, []);

  const checkInitialPermission = async () => {
    setIsLoading(true);
    try {
      const status = await mediaService.getPermissionStatus();
      setPermissionStatus(status);
    } catch (error) {
      console.error('Error checking permission status:', error);
      setPermissionStatus('denied');
    } finally {
      setIsLoading(false);
    }
  };

  const requestPermission = async (): Promise<PermissionStatus> => {
    setIsLoading(true);
    try {
      const status = await mediaService.requestPermissions();
      setPermissionStatus(status);
      return status;
    } catch (error) {
      console.error('Error requesting permission:', error);
      setPermissionStatus('denied');
      return 'denied';
    } finally {
      setIsLoading(false);
    }
  };

  return {
    permissionStatus,
    isLoading,
    requestPermission,
    hasPermission: permissionStatus === 'granted',
  };
}