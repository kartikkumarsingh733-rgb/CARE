// Memories Tab — family photo album (PRD §5f)
// Stage 1: uses placeholder memory cards. Stage 5 loads from Cloudflare R2.
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/constants/theme';
import FloatingChatButton from '@/components/FloatingChatButton';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - Spacing.lg * 2 - Spacing.md) / 2;

interface MemoryCard {
  id: string;
  title: string;
  description: string;
  emoji: string;
  color: string;
  category: string;
}

const MEMORY_CARDS: MemoryCard[] = [
  { id: '1', title: 'Priya\'s Wedding', description: 'February 12, 2019',       emoji: '💒', color: Colors.domainRecall,    category: 'Family' },
  { id: '2', title: 'Varanasi Trip',   description: 'October 2022',             emoji: '🕌', color: Colors.domainMemory,    category: 'Travel' },
  { id: '3', title: 'Grandson Arjun',  description: 'Born March 15, 2021',     emoji: '👶', color: Colors.gold,            category: 'Family' },
  { id: '4', title: 'Diwali 2023',     description: 'With the whole family',    emoji: '🪔', color: Colors.alertYellow,     category: 'Festival' },
  { id: '5', title: 'Old Home',        description: 'Our home in Lucknow',      emoji: '🏡', color: Colors.domainAttention, category: 'Home' },
  { id: '6', title: 'Rohan\'s Birthday', description: 'June 4, 2023',          emoji: '🎂', color: Colors.domainPatterns,  category: 'Family' },
];

const CATEGORIES = ['All', 'Family', 'Travel', 'Festival', 'Home'];

export default function MemoriesScreen() {
  const [filter, setFilter] = useState('All');
  const [selected, setSelected] = useState<MemoryCard | null>(null);

  const filtered = filter === 'All'
    ? MEMORY_CARDS
    : MEMORY_CARDS.filter((m) => m.category === filter);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Memories</Text>
        <Text style={styles.subtitle}>Your family album · यादें</Text>
      </View>

      {/* Category filter pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.filterPill,
              filter === cat && styles.filterPillActive,
            ]}
            onPress={() => setFilter(cat)}
          >
            <Text
              style={[
                styles.filterPillText,
                filter === cat && styles.filterPillTextActive,
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      >
        {filtered.map((card) => (
          <TouchableOpacity
            key={card.id}
            style={styles.card}
            onPress={() => setSelected(card)}
            activeOpacity={0.85}
          >
            <View style={[styles.cardImage, { backgroundColor: card.color }]}>
              <Text style={styles.cardEmoji}>{card.emoji}</Text>
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{card.title}</Text>
              <Text style={styles.cardDesc}>{card.description}</Text>
              <View style={styles.categoryPill}>
                <Text style={styles.categoryText}>{card.category}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {/* Add memory card */}
        <TouchableOpacity style={styles.addCard}>
          <Text style={styles.addCardEmoji}>+</Text>
          <Text style={styles.addCardText}>Add a Memory</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Memory detail modal */}
      <Modal
        visible={!!selected}
        animationType="fade"
        transparent
        onRequestClose={() => setSelected(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.detailCard}>
            <View
              style={[
                styles.detailImage,
                { backgroundColor: selected?.color },
              ]}
            >
              <Text style={styles.detailEmoji}>{selected?.emoji}</Text>
            </View>
            <Text style={styles.detailTitle}>{selected?.title}</Text>
            <Text style={styles.detailDesc}>{selected?.description}</Text>
            <Text style={styles.detailCat}>{selected?.category}</Text>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setSelected(null)}
            >
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <FloatingChatButton />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bgCream },
  header: {
    backgroundColor: Colors.domainPatterns,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  title: {
    fontFamily: Typography.fontFamily.extraBold,
    fontSize: Typography.size.xxxl,
    color: Colors.textOnDark,
  },
  subtitle: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  filterRow: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    flexDirection: 'row',
  },
  filterPill: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.borderMedium,
    backgroundColor: Colors.bgCard,
  },
  filterPillActive: {
    backgroundColor: Colors.domainPatterns,
    borderColor: Colors.domainPatterns,
  },
  filterPillText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
  },
  filterPillTextActive: { color: Colors.textOnDark },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    paddingBottom: 80,
    gap: Spacing.md,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    ...Shadow.card,
  },
  cardImage: {
    height: CARD_WIDTH * 0.75,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardEmoji: { fontSize: 48 },
  cardBody: { padding: Spacing.md },
  cardTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.md,
    color: Colors.textPrimary,
  },
  cardDesc: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  categoryPill: {
    marginTop: Spacing.sm,
    alignSelf: 'flex-start',
    backgroundColor: Colors.goldLight,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  categoryText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: 10,
    color: Colors.gold,
  },
  addCard: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.3,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.gold,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  addCardEmoji: {
    fontSize: 32,
    color: Colors.gold,
    fontFamily: Typography.fontFamily.bold,
  },
  addCardText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.sm,
    color: Colors.gold,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  detailCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    width: '100%',
    alignItems: 'center',
    padding: Spacing.xl,
    ...Shadow.cardStrong,
  },
  detailImage: {
    width: 160,
    height: 160,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  detailEmoji: { fontSize: 72 },
  detailTitle: {
    fontFamily: Typography.fontFamily.extraBold,
    fontSize: Typography.size.xxl,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  detailDesc: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.md,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  detailCat: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.sm,
    color: Colors.gold,
    marginTop: Spacing.sm,
  },
  closeBtn: {
    marginTop: Spacing.xl,
    backgroundColor: Colors.domainPatterns,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xxl,
  },
  closeBtnText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.md,
    color: Colors.textOnDark,
  },
});

