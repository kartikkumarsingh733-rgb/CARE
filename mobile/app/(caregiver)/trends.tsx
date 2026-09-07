import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { useFocusEffect } from 'expo-router';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/constants/theme';
import { getRecentSessionsForDomain } from '@/engine/database';
import { useAppStore } from '@/store/appStore';
import type { DomainKey } from '@/engine/gameSession';

const screenWidth = Dimensions.get('window').width;

export default function TrendsScreen() {
  const patient = useAppStore((state) => state.patient);
  const [loading, setLoading] = useState(true);
  
  // Data for charts
  const [memoryAcc, setMemoryAcc] = useState<number[]>([]);
  const [attentionAcc, setAttentionAcc] = useState<number[]>([]);
  const [memoryTime, setMemoryTime] = useState<number[]>([]);
  
  const loadData = useCallback(() => {
    setLoading(true);
    try {
      // Get last 7 sessions for trends
      const memorySessions = getRecentSessionsForDomain('memory', patient.id, 7).reverse();
      const attentionSessions = getRecentSessionsForDomain('attention', patient.id, 7).reverse();
      
      const mAcc = memorySessions.map(s => s.itemsCount > 0 ? (s.correctCount / s.itemsCount) * 100 : 0);
      const aAcc = attentionSessions.map(s => s.itemsCount > 0 ? (s.correctCount / s.itemsCount) * 100 : 0);
      
      const mTime = memorySessions.map(s => s.avgResponseMs / 1000); // seconds
      
      setMemoryAcc(mAcc.length > 0 ? mAcc : [0]);
      setAttentionAcc(aAcc.length > 0 ? aAcc : [0]);
      setMemoryTime(mTime.length > 0 ? mTime : [0]);
    } catch (err) {
      console.error('Error loading trend data', err);
    } finally {
      setLoading(false);
    }
  }, [patient.id]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const chartConfig = {
    backgroundGradientFrom: Colors.caregiverNavyLight,
    backgroundGradientTo: Colors.caregiverNavyLight,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    strokeWidth: 3,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: Colors.gold
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Trends</Text>
        <Text style={styles.subtitle}>Cognitive Performance Over Time</Text>
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={Colors.gold} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          
          <Text style={styles.sectionLabel}>ACCURACY (%)</Text>
          <View style={styles.chartCard}>
            <LineChart
              data={{
                labels: Array.from({length: memoryAcc.length}, (_, i) => `${i+1}`),
                datasets: [
                  {
                    data: memoryAcc,
                    color: (opacity = 1) => Colors.domainMemory,
                  },
                  {
                    data: attentionAcc,
                    color: (opacity = 1) => Colors.domainAttention,
                  }
                ],
                legend: ['Memory', 'Attention']
              }}
              width={screenWidth - Spacing.lg * 2 - Spacing.lg * 2} // minus padding
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chartStyle}
            />
          </View>

          <Text style={styles.sectionLabel}>RESPONSE TIME (Seconds)</Text>
          <View style={styles.chartCard}>
            <BarChart
              data={{
                labels: Array.from({length: memoryTime.length}, (_, i) => `${i+1}`),
                datasets: [
                  {
                    data: memoryTime
                  }
                ]
              }}
              width={screenWidth - Spacing.lg * 2 - Spacing.lg * 2}
              height={220}
              yAxisLabel=""
              yAxisSuffix="s"
              chartConfig={{
                ...chartConfig,
                color: (opacity = 1) => `rgba(240, 185, 11, ${opacity})`, // Gold
              }}
              style={styles.chartStyle}
            />
          </View>

          <Text style={styles.sectionLabel}>REMINDER ADHERENCE</Text>
          <View style={styles.adherenceCard}>
            <View style={styles.adherenceCircle}>
              <Text style={styles.adherencePct}>85%</Text>
              <Text style={styles.adherenceSub}>Completed</Text>
            </View>
            <View style={styles.adherenceInfo}>
              <Text style={styles.adherenceText}>High adherence this week!</Text>
              <Text style={styles.adherenceDesc}>The patient has completed 17 out of 20 scheduled reminders.</Text>
            </View>
          </View>

        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.caregiverNavy },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  title: {
    fontFamily: Typography.fontFamily.display,
    fontSize: Typography.size.xxl,
    color: Colors.textOnDark,
  },
  subtitle: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
  },
  scroll: { paddingHorizontal: Spacing.lg, paddingBottom: 80 },
  loadingBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionLabel: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.xs,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1.2,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  chartCard: {
    backgroundColor: Colors.caregiverNavyLight,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    ...Shadow.card,
  },
  chartStyle: {
    borderRadius: Radius.md,
  },
  adherenceCard: {
    flexDirection: 'row',
    backgroundColor: Colors.caregiverNavyLight,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.lg,
    ...Shadow.card,
  },
  adherenceCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: Colors.successTeal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adherencePct: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.lg,
    color: Colors.textOnDark,
  },
  adherenceSub: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
  },
  adherenceInfo: {
    flex: 1,
  },
  adherenceText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.md,
    color: Colors.textOnDark,
  },
  adherenceDesc: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
    lineHeight: 18,
  },
});
