import React from 'react';
import {
  View,
  StyleSheet,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PermissionStatus } from '../services/MediaLibraryService';
import { ThemedText, Button } from './UI';
import { Theme } from '../constants/Theme';

interface PermissionRequestProps {
  permissionStatus: PermissionStatus;
  isLoading: boolean;
  onRequestPermission: () => Promise<PermissionStatus>;
}

export default function PermissionRequest({
  permissionStatus,
  isLoading,
  onRequestPermission,
}: PermissionRequestProps) {
  const handlePermissionRequest = async () => {
    const result = await onRequestPermission();
    
    if (result === 'denied') {
      Alert.alert(
        'Autorizzazione negata',
        'Picky ha bisogno di accedere alle tue foto per funzionare. Puoi abilitare l\'accesso nelle Impostazioni.',
        [
          {
            text: 'Annulla',
            style: 'cancel',
          },
          {
            text: 'Apri Impostazioni',
            onPress: () => Linking.openSettings(),
          },
        ]
      );
    }
  };

  const renderContent = () => {
    switch (permissionStatus) {
      case 'undetermined':
        return (
          <>
            <View style={styles.iconContainer}>
              <Ionicons name="images-outline" size={80} color={Theme.colors.primary.purple} />
            </View>
            <ThemedText variant="title2" style={styles.title}>
              Accesso alle foto
            </ThemedText>
            <ThemedText variant="body" color="secondary" style={styles.description}>
              Picky deve accedere alle tue foto per aiutarti a organizzarle e liberare spazio di archiviazione.
            </ThemedText>
            <Button
              title={isLoading ? 'Caricamento...' : 'Consenti accesso'}
              variant="primary"
              onPress={handlePermissionRequest}
              disabled={isLoading}
              loading={isLoading}
              fullWidth
            />
          </>
        );

      case 'denied':
        return (
          <>
            <View style={styles.iconContainer}>
              <Ionicons name="ban-outline" size={80} color={Theme.colors.system.error} />
            </View>
            <ThemedText variant="title2" style={styles.title}>
              Accesso negato
            </ThemedText>
            <ThemedText variant="body" color="secondary" style={styles.description}>
              Picky ha bisogno di accedere alle tue foto per funzionare. Puoi abilitare l'accesso nelle Impostazioni dell'app.
            </ThemedText>
            <Button
              title="Apri Impostazioni"
              variant="secondary"
              onPress={() => Linking.openSettings()}
              fullWidth
              style={styles.buttonSpacing}
            />
            <Button
              title={isLoading ? 'Verificando...' : 'Riprova'}
              variant="primary"
              onPress={handlePermissionRequest}
              disabled={isLoading}
              loading={isLoading}
              fullWidth
            />
          </>
        );

      default:
        return null;
    }
  };

  if (permissionStatus === 'granted') {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {renderContent()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background.primary,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.xl,
    maxWidth: 400,
    alignSelf: 'center',
  },
  iconContainer: {
    marginBottom: Theme.spacing.xl,
  },
  title: {
    textAlign: 'center',
    marginBottom: Theme.spacing.md,
  },
  description: {
    textAlign: 'center',
    marginBottom: Theme.spacing.xl,
    maxWidth: 320,
  },
  buttonSpacing: {
    marginBottom: Theme.spacing.md,
  },
});