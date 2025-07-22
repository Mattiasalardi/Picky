import React from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeContainer, ThemedText, Card } from '../../components/UI';
import { Theme } from '../../constants/Theme';
import { Ionicons } from '@expo/vector-icons';

export default function StatisticsScreen() {
  return (
    <SafeContainer>
      <StatusBar style="light" />
      <View style={styles.content}>
        <ThemedText variant="title1" style={styles.title}>
          Statistiche
        </ThemedText>
        <ThemedText variant="body" color="secondary" style={styles.subtitle}>
          Visualizza i tuoi progressi e risultati
        </ThemedText>
        
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <View style={styles.statHeader}>
              <Ionicons name="trophy-outline" size={24} color={Theme.colors.primary.yellow} />
              <ThemedText variant="headline" color="yellow">
                Classifica
              </ThemedText>
            </View>
            <ThemedText variant="body" color="tertiary">
              Inizia a pulire le foto per vedere la tua classifica!
            </ThemedText>
          </Card>

          <Card style={styles.statCard}>
            <View style={styles.statHeader}>
              <Ionicons name="cloud-download-outline" size={24} color={Theme.colors.primary.purple} />
              <ThemedText variant="headline" color="purple">
                Spazio liberato
              </ThemedText>
            </View>
            <ThemedText variant="body" color="tertiary">
              0 MB risparmiati
            </ThemedText>
          </Card>
        </View>
      </View>
    </SafeContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: Theme.spacing.layout.screenPadding,
    paddingTop: Theme.spacing.xl,
  },
  title: {
    marginBottom: Theme.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: Theme.spacing.xl,
    maxWidth: 300,
    alignSelf: 'center',
  },
  statsContainer: {
    gap: Theme.spacing.md,
  },
  statCard: {
    backgroundColor: Theme.colors.background.tertiary,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.sm,
  },
});