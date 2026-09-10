// Caregiver PIN Gate — switches app from Elder to Caregiver mode
// Stage 1: simple 4-digit PIN (1234 default). Stage 6 adds biometric auth.
import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/constants/theme';

const CAREGIVER_PIN = '1234';  // Stage 6: replace with secure storage

export default function CaregiverPinScreen() {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', '✓'];

  const handleDigit = (d: string) => {
    if (d === '⌫') {
      setPin((p) => p.slice(0, -1));
      setError(false);
      return;
    }
    if (d === '✓') {
      if (pin === CAREGIVER_PIN) {
        router.replace('/(caregiver)');
      } else {
        setError(true);
        setPin('');
      }
      return;
    }
    if (pin.length < 4) {
      setPin((p) => p + d);
      setError(false);
    }
  };

  // Auto-submit when 4 digits entered
  if (pin.length === 4 && !error) {
    if (pin === CAREGIVER_PIN) {
      router.replace('/(caregiver)');
    } else {
      setError(true);
      setPin('');
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <TouchableOpacity style={styles.backRow} onPress={() => router.back()}>
        <Text style={styles.back}>← Cancel</Text>
      </TouchableOpacity>

      <View style={styles.body}>
        <Text style={styles.lockEmoji}>🔐</Text>
        <Text style={styles.title}>Caregiver Mode</Text>
        <Text style={styles.subtitle}>Enter your PIN to continue</Text>

        {/* PIN dots */}
        <View style={styles.dotsRow}>
          {[0, 1, 2, 3].map((i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i < pin.length && { backgroundColor: error ? Colors.alertRed : Colors.caregiverPrimary },
              ]}
            />
          ))}
        </View>

        {error && (
          <Text style={styles.errorText}>Incorrect PIN. Please try again.</Text>
        )}

        {/* Keypad */}
        <View style={styles.keypad}>
          {digits.map((d) => (
            <TouchableOpacity
              key={d}
              style={[
                styles.key,
                d === '✓' && { backgroundColor: Colors.caregiverPrimary },
              ]}
              onPress={() => handleDigit(d)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.keyText,
                  d === '✓' && { color: Colors.textOnDark },
                ]}
              >
                {d}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.hint}>Default PIN: 1234</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bgCream },
  backRow: { padding: Spacing.lg },
  back: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.md,
    color: Colors.textSecondary,
  },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  lockEmoji: { fontSize: 52, marginBottom: Spacing.lg },
  title: {
    fontFamily: Typography.fontFamily.display,
    fontSize: Typography.size.xxl,
    color: Colors.caregiverPrimary,
  },
  subtitle: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.md,
    color: Colors.textSecondary,
    marginTop: 4,
    marginBottom: Spacing.xl,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginBottom: Spacing.md,
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.borderMedium,
    borderWidth: 2,
    borderColor: Colors.caregiverPrimary,
  },
  errorText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.sm,
    color: Colors.alertRed,
    marginBottom: Spacing.md,
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 270,
    gap: Spacing.sm,
    marginTop: Spacing.lg,
    justifyContent: 'center',
  },
  key: {
    width: 80,
    height: 64,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.card,
  },
  keyText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.xxl,
    color: Colors.textPrimary,
  },
  hint: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    marginTop: Spacing.xl,
  },
});

