// FloatingChatButton — SmritiSaathi companion FAB
// Appears on all Elder Mode screens. Opens a stub chat screen (Stage 3).
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Shadow } from '../constants/theme';

export default function FloatingChatButton() {
  const router = useRouter();
  return (
    <TouchableOpacity
      style={styles.fab}
      onPress={() => router.push('/chat')}
      activeOpacity={0.85}
    >
      <Text style={styles.fabEmoji}>🤗</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 80,  // above tab bar
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.chatGreen,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.cardStrong,
  },
  fabEmoji: { fontSize: 26 },
});
