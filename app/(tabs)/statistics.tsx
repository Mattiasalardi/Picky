import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeContainer, ThemedText, Card } from '../../components/UI';
import TrashManager from '../../components/TrashManager';
import { Theme } from '../../constants/Theme';
import { Ionicons } from '@expo/vector-icons';
import { SwipeActionsService } from '../../services/SwipeActionsService';
import { StorageService } from '../../services/StorageService';

interface StatisticsData {
  storageSaved: string;
  totalProcessed: number;
  totalDeleted: number;
  totalKept: number;
  totalFavorites: number;
  trashCount: number;
  trashSize: string;
  favoritesCount: number;
}

export default function StatisticsScreen() {
  const [stats, setStats] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState(true);
  
  const swipeActionsService = SwipeActionsService.getInstance();
  const storageService = StorageService.getInstance();

  const loadStatistics = useCallback(async () => {
    try {
      const [
        storageSavedData,
        trashInfo,
        favoritesCount,
        globalStats
      ] = await Promise.all([
        swipeActionsService.getStorageSaved(),
        swipeActionsService.getTrashInfo(),
        swipeActionsService.getFavoritesCount(),
        storageService.getStatistics()
      ]);

      setStats({
        storageSaved: storageSavedData.mb,
        totalProcessed: globalStats.totalProcessed,
        totalDeleted: globalStats.totalDeleted,
        totalKept: globalStats.totalKept,
        totalFavorites: globalStats.totalFavorites,
        trashCount: trashInfo.count,
        trashSize: trashInfo.sizeMB,
        favoritesCount,
      });
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatistics();
  }, []);

  const handleTrashEmptied = useCallback(() => {
    // Refresh statistics when trash is emptied
    loadStatistics();
  }, []);

  const getRankingInfo = useCallback(() => {
    if (!stats) return { rank: 'Novizio', color: Theme.colors.text.tertiary, icon: 'person-outline' };
    
    const { totalProcessed } = stats;
    
    if (totalProcessed >= 1000) {
      return { rank: 'Oro', color: Theme.colors.primary.yellow, icon: 'trophy' };
    } else if (totalProcessed >= 500) {
      return { rank: 'Argento', color: '#C0C0C0', icon: 'medal' };
    } else if (totalProcessed >= 100) {
      return { rank: 'Bronzo', color: '#CD7F32', icon: 'ribbon' };
    } else if (totalProcessed >= 10) {
      return { rank: 'Principiante', color: Theme.colors.primary.purple, icon: 'star-outline' };
    } else {
      return { rank: 'Novizio', color: Theme.colors.text.tertiary, icon: 'person-outline' };
    }
  }, [stats]);

  if (loading) {
    return (
      <SafeContainer>
        <StatusBar style="light" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Theme.colors.primary.main} />
          <ThemedText variant="body" style={styles.loadingText}>
            Caricamento statistiche...
          </ThemedText>
        </View>
      </SafeContainer>
    );
  }

  const rankingInfo = getRankingInfo();

  return (
    <SafeContainer>
      <StatusBar style="light" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <ThemedText variant="title1" style={styles.title}>
            Statistiche
          </ThemedText>
          <ThemedText variant="body" color="secondary" style={styles.subtitle}>
            Visualizza i tuoi progressi e risultati
          </ThemedText>
          
          <View style={styles.statsContainer}>
            {/* Ranking Card */}
            <Card style={styles.statCard}>
              <View style={styles.statHeader}>
                <Ionicons name={rankingInfo.icon as any} size={24} color={rankingInfo.color} />
                <ThemedText variant="headline" style={[styles.rankingTitle, { color: rankingInfo.color }]}>
                  {rankingInfo.rank}
                </ThemedText>
              </View>
              <ThemedText variant="body" color="secondary">
                {stats?.totalProcessed || 0} media processati
              </ThemedText>
              {stats && stats.totalProcessed < 10 && (
                <ThemedText variant="caption1" color="tertiary" style={styles.rankingHint}>
                  Processa 10 media per il primo livello
                </ThemedText>
              )}
            </Card>

            {/* Storage Saved Card */}
            <Card style={styles.statCard}>
              <View style={styles.statHeader}>
                <Ionicons name="cloud-download-outline" size={24} color={Theme.colors.primary.purple} />
                <ThemedText variant="headline" color="purple">
                  Spazio liberato
                </ThemedText>
              </View>
              <ThemedText variant="title2" style={styles.storageAmount}>
                {stats?.storageSaved || '0,0 MB'}
              </ThemedText>
              <ThemedText variant="caption1" color="secondary">
                {stats?.totalDeleted || 0} elementi eliminati
              </ThemedText>
            </Card>

            {/* Session Summary Card */}
            <Card style={styles.statCard}>
              <View style={styles.statHeader}>
                <Ionicons name="bar-chart-outline" size={24} color={Theme.colors.primary.main} />
                <ThemedText variant="headline">
                  Riepilogo totale
                </ThemedText>
              </View>
              <View style={styles.summaryGrid}>
                <View style={styles.summaryItem}>
                  <ThemedText variant="title3" style={styles.summaryNumber}>
                    {stats?.totalKept || 0}
                  </ThemedText>
                  <ThemedText variant="caption1" color="secondary">
                    Mantenuti
                  </ThemedText>
                </View>
                <View style={styles.summaryItem}>
                  <ThemedText variant="title3" style={styles.summaryNumber}>
                    {stats?.totalDeleted || 0}
                  </ThemedText>
                  <ThemedText variant="caption1" color="secondary">
                    Eliminati
                  </ThemedText>
                </View>
                <View style={styles.summaryItem}>
                  <ThemedText variant="title3" style={styles.summaryNumber}>
                    {stats?.favoritesCount || 0}
                  </ThemedText>
                  <ThemedText variant="caption1" color="secondary">
                    Preferiti
                  </ThemedText>
                </View>
              </View>
            </Card>

            {/* Favorites Card */}
            <Card style={styles.statCard}>
              <View style={styles.statHeader}>
                <Ionicons name="heart-outline" size={24} color={Theme.colors.secondary.main} />
                <ThemedText variant="headline" color="yellow">
                  Picky Preferiti
                </ThemedText>
              </View>
              <ThemedText variant="body" color="secondary">
                {stats?.favoritesCount ? 
                  `${stats.favoritesCount} media nella tua collezione preferiti` :
                  'Nessun elemento nei preferiti ancora'
                }
              </ThemedText>
            </Card>
          </View>

          {/* Trash Manager */}
          <TrashManager onTrashEmptied={handleTrashEmptied} />
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
    flex: 1,
    paddingHorizontal: Theme.spacing.layout.screenPadding,
    paddingTop: Theme.spacing.xl,
    paddingBottom: Theme.spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Theme.spacing.md,
    color: Theme.colors.text.secondary,
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
    marginBottom: Theme.spacing.lg,
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
  rankingTitle: {
    fontWeight: '600',
  },
  rankingHint: {
    marginTop: Theme.spacing.sm,
    fontStyle: 'italic',
  },
  storageAmount: {
    color: Theme.colors.text.primary,
    fontWeight: '700',
    marginBottom: Theme.spacing.xs,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: Theme.spacing.sm,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryNumber: {
    color: Theme.colors.text.primary,
    fontWeight: '600',
    marginBottom: Theme.spacing.xs,
  },
});