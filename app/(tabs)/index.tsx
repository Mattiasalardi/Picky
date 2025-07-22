import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { useMediaLibraryPermissions } from '../../hooks/useMediaLibraryPermissions';
import PermissionRequest from '../../components/PermissionRequest';
import SwipingInterface from '../../components/SwipingInterface';
import { SafeContainer } from '../../components/UI';

export default function CleanupScreen() {
  const { permissionStatus, isLoading, requestPermission, hasPermission } = 
    useMediaLibraryPermissions();

  if (!hasPermission) {
    return (
      <SafeContainer>
        <StatusBar style="light" />
        <PermissionRequest
          permissionStatus={permissionStatus}
          isLoading={isLoading}
          onRequestPermission={requestPermission}
        />
      </SafeContainer>
    );
  }

  // Go directly to swiping interface with 'all' photos by default
  return (
    <SafeContainer>
      <StatusBar style="light" />
      <SwipingInterface
        selectedAlbum="all"
        onBack={() => {}} // No back action needed since this is the main screen
      />
    </SafeContainer>
  );
}