import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeContainer, ThemedText, Card, Button } from '../../components/UI';
import { Theme } from '../../constants/Theme';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen() {
  return (
    <SafeContainer>
      <StatusBar style="light" />
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <ThemedText variant="title1" style={styles.title}>
            Impostazioni
          </ThemedText>
          <ThemedText variant="body" color="secondary" style={styles.subtitle}>
            Gestisci le tue preferenze e impostazioni dell'app
          </ThemedText>
          
          <View style={styles.settingsContainer}>
            <Card style={styles.settingCard}>
              <View style={styles.settingHeader}>
                <Ionicons name="phone-portrait-outline" size={24} color={Theme.colors.primary.purple} />
                <ThemedText variant="headline">
                  Feedback aptico
                </ThemedText>
              </View>
              <ThemedText variant="body" color="tertiary" style={styles.settingDescription}>
                Attiva la vibrazione per i feedback durante l'uso
              </ThemedText>
            </Card>

            <Card style={styles.settingCard}>
              <View style={styles.settingHeader}>
                <Ionicons name="volume-high-outline" size={24} color={Theme.colors.primary.yellow} />
                <ThemedText variant="headline">
                  Effetti sonori
                </ThemedText>
              </View>
              <ThemedText variant="body" color="tertiary" style={styles.settingDescription}>
                Riproduci suoni durante le azioni
              </ThemedText>
            </Card>

            <Card style={styles.settingCard}>
              <View style={styles.settingHeader}>
                <Ionicons name="shield-checkmark-outline" size={24} color={Theme.colors.system.info} />
                <ThemedText variant="headline">
                  Privacy
                </ThemedText>
              </View>
              <ThemedText variant="body" color="tertiary" style={styles.settingDescription}>
                Leggi la nostra informativa sulla privacy
              </ThemedText>
            </Card>

            <View style={styles.buttonContainer}>
              <Button
                title="Reset statistiche"
                variant="secondary"
                fullWidth
                style={styles.buttonSpacing}
              />
              <Button
                title="Richiesta cancellazione dati"
                variant="secondary"
                fullWidth
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Theme.spacing.layout.screenPadding,
    paddingTop: Theme.spacing.xl,
    paddingBottom: Theme.spacing.xxl,
  },
  title: {
    marginBottom: Theme.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: Theme.spacing.xl,
    maxWidth: 320,
    alignSelf: 'center',
  },
  settingsContainer: {
    gap: Theme.spacing.md,
  },
  settingCard: {
    backgroundColor: Theme.colors.background.tertiary,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.sm,
  },
  settingDescription: {
    marginLeft: Theme.spacing.xl,
  },
  buttonContainer: {
    marginTop: Theme.spacing.xl,
    gap: Theme.spacing.md,
  },
  buttonSpacing: {
    marginBottom: Theme.spacing.sm,
  },
});