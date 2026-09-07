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
    backgroundGradientFrom: Colors.caregiverCardBg,
    backgroundGradientTo: Colors.caregiverCardBg,
    color: (opacity = 1) => `rgba(30, 136, 229, ${opacity})`,
    labelColor: (opacity = 1) => Colors.caregiverTextMuted,
    strokeWidth: 3,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: Colors.caregiverPrimary
    },
    decimalPlaces: 0,
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Trends</Text>
        <Text style={styles.subtitle}>Cognitive Performance Over Time</Text>
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={Colors.caregiverPrimary} />
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
              width={screenWidth - 32 - 32} // minus padding (16*2) and inner padding (16*2)
              height={220}
              chartConfig={{
                ...chartConfig,
                color: (opacity = 1) => `rgba(30, 136, 229, ${opacity})`,
              }}
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
              width={screenWidth - 32 - 32}
              height={220}
              yAxisLabel=""
              yAxisSuffix="s"
              chartConfig={{
                ...chartConfig,
                color: (opacity = 1) => Colors.caregiverPrimary,
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
  safe: { flex: 1, backgroundColor: Colors.caregiverSecondary },
  header: {
    paddingHorizontal: 16,
    paddingTop: 32,
    paddingBottom: 16,
    backgroundColor: Colors.caregiverBg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.caregiverBorder,
  },
  title: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 24,
    color: Colors.caregiverText,
  },
  subtitle: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: 16,
    color: Colors.caregiverTextMuted,
    marginTop: 4,
  },
  scroll: { paddingHorizontal: 16, paddingBottom: 80 },
  loadingBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionLabel: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 12,
    color: Colors.caregiverTextMuted,
    letterSpacing: 1.2,
    marginTop: 24,
    marginBottom: 12,
  },
  chartCard: {
    backgroundColor: Colors.caregiverCardBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.caregiverBorder,
    padding: 16,
    alignItems: 'center',
    ...Shadow.caregiverCard,
  },
  chartStyle: {
    borderRadius: 8,
  },
  adherenceCard: {
    flexDirection: 'row',
    backgroundColor: Colors.caregiverCardBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.caregiverBorder,
    padding: 16,
    alignItems: 'center',
    gap: 16,
    ...Shadow.caregiverCard,
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
    fontSize: 20,
    color: Colors.caregiverText,
  },
  adherenceSub: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: 10,
    color: Colors.caregiverTextMuted,
  },
  adherenceInfo: {
    flex: 1,
  },
  adherenceText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: 16,
    color: Colors.caregiverText,
  },
  adherenceDesc: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: 14,
    color: Colors.caregiverTextMuted,
    marginTop: 4,
    lineHeight: 20,
  },
});
