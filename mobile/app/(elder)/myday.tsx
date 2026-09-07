// My Day Tab — daily schedule / reminders timeline (PRD §5e)
// Shows time-ordered items, highlights "next", completed with strikethrough
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/constants/theme';
import FloatingChatButton from '@/components/FloatingChatButton';

interface ScheduleItem {
  id: string;
  time: string;
  title: string;
  subtitle: string;
  emoji: string;
  color: string;
  done: boolean;
  isNext?: boolean;
}

const INITIAL_SCHEDULE: ScheduleItem[] = [
  { id: '1', time: '8:00 AM',  title: 'Morning Medicine', subtitle: '2 tablets with water',       emoji: '💊', color: Colors.domainAttention, done: true  },
  { id: '2', time: '9:00 AM',  title: 'Breakfast',        subtitle: 'Idli and sambar',            emoji: '🍽️', color: Colors.domainPatterns,  done: true  },
  { id: '3', time: '11:00 AM', title: 'Drink Water',      subtitle: 'A full glass of water',      emoji: '💧', color: Colors.textLink,         done: true  },
  { id: '4', time: '1:00 PM',  title: 'Afternoon Medicine', subtitle: '2 tablets with water',    emoji: '💊', color: Colors.domainAttention, done: false, isNext: true },
  { id: '5', time: '1:30 PM',  title: 'Lunch',            subtitle: 'Dal, rice and sabzi',        emoji: '🍛', color: Colors.domainPatterns,  done: false },
  { id: '6', time: '4:00 PM',  title: 'Evening Walk',     subtitle: '15 minutes in the garden',  emoji: '🚶', color: Colors.successTeal,      done: false },
  { id: '7', time: '5:00 PM',  title: 'Priya Visits',     subtitle: 'Your daughter will come home', emoji: '👨‍👩‍👧', color: Colors.domainPatterns, done: false },
  { id: '8', time: '9:00 PM',  title: 'Night Medicine',   subtitle: '1 tablet before sleep',     emoji: '💊', color: Colors.domainAttention, done: false },
];

const TASK_CATEGORIES = [
  { label: 'Medicine',       emoji: '💊' },
  { label: 'Meal',           emoji: '🍽️' },
  { label: 'Drink Water',    emoji: '💧' },
  { label: 'Walk',           emoji: '🚶' },
  { label: 'Doctor Visit',   emoji: '⭐' },
  { label: 'Temple / Prayer', emoji: '🛕' },
  { label: 'Call Family',    emoji: '📞' },
  { label: 'Rest / Nap',     emoji: '🛌' },
];

const TIME_SLOTS = [
  { label: 'Morning',   time: '8:00 AM'  },
  { label: 'Midday',    time: '12:00 PM' },
  { label: 'Afternoon', time: '3:00 PM'  },
  { label: 'Evening',   time: '6:00 PM'  },
  { label: 'Night',     time: '9:00 PM'  },
];

export default function MyDayScreen() {
  const [schedule, setSchedule] = useState<ScheduleItem[]>(INITIAL_SCHEDULE);
  const [showAddTask, setShowAddTask] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const toggleDone = (id: string) => {
    setSchedule((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, done: !item.done } : item
      )
    );
  };

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Day</Text>
        <Text style={styles.date}>{today}</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionLabel}>TODAY'S SCHEDULE</Text>

        {schedule.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => toggleDone(item.id)}
            activeOpacity={0.8}
            style={[
              styles.scheduleRow,
              item.isNext && styles.scheduleRowNext,
            ]}
          >
            <Text style={styles.timeText}>{item.time}</Text>
            <View
              style={[
                styles.iconSquare,
                { backgroundColor: item.done ? '#DDD' : item.color },
              ]}
            >
              {item.done ? (
                <Text style={styles.checkmark}>✓</Text>
              ) : (
                <Text style={styles.rowEmoji}>{item.emoji}</Text>
              )}
            </View>
            <View style={styles.rowInfo}>
              <Text
                style={[
                  styles.rowTitle,
                  item.done && styles.strikethrough,
                ]}
              >
                {item.title}
              </Text>
              <Text
                style={[
                  styles.rowSubtitle,
                  item.done && styles.strikethrough,
                ]}
              >
                {item.subtitle}
              </Text>
            </View>
            {item.isNext && !item.done && (
              <View style={styles.nextBadge}>
                <Text style={styles.nextBadgeText}>NEXT</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}

        {/* Add Task */}
        <TouchableOpacity
          style={styles.addTaskBtn}
          onPress={() => setShowAddTask(true)}
        >
          <Text style={styles.addTaskText}>+ Add a Task to Today</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Add Task Modal */}
      <Modal
        visible={showAddTask}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAddTask(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Add a Task</Text>

            {/* Voice button */}
            <TouchableOpacity style={styles.speakBtn}>
              <Text style={styles.speakBtnText}>🎤  Speak Your Task</Text>
            </TouchableOpacity>

            <View style={styles.orDivider}>
              <View style={styles.divLine} />
              <Text style={styles.orText}>OR CHOOSE A TASK</Text>
              <View style={styles.divLine} />
            </View>

            {/* Category grid */}
            <View style={styles.categoryGrid}>
              {TASK_CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.label}
                  style={[
                    styles.catTile,
                    selectedCategory === cat.label && styles.catTileSelected,
                  ]}
                  onPress={() => setSelectedCategory(cat.label)}
                >
                  <Text style={styles.catEmoji}>{cat.emoji}</Text>
                  <Text style={styles.catLabel}>{cat.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.whenLabel}>WHEN?</Text>
            {TIME_SLOTS.map((slot) => (
              <TouchableOpacity
                key={slot.label}
                style={[
                  styles.timeSlot,
                  selectedTime === slot.label && styles.timeSlotSelected,
                ]}
                onPress={() => setSelectedTime(slot.label)}
              >
                <Text style={styles.timeSlotLabel}>{slot.label}</Text>
                <Text style={styles.timeSlotTime}>{slot.time}</Text>
              </TouchableOpacity>
            ))}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => {
                  // TODO: add item to schedule
                  setShowAddTask(false);
                  setSelectedCategory(null);
                  setSelectedTime(null);
                }}
              >
                <Text style={styles.addBtnText}>✓  Add to My Day</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowAddTask(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
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
    backgroundColor: Colors.domainAttention,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  title: {
    fontFamily: Typography.fontFamily.extraBold,
    fontSize: Typography.size.xxxl,
    color: Colors.textOnDark,
  },
  date: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  scroll: { paddingHorizontal: Spacing.lg, paddingBottom: 80 },
  sectionLabel: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    letterSpacing: 1.2,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  scheduleRowNext: {
    borderColor: Colors.gold,
    borderWidth: 2,
    backgroundColor: Colors.goldLight,
  },
  timeText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    width: 58,
  },
  iconSquare: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: { fontSize: 18, color: Colors.textOnDark },
  rowEmoji: { fontSize: 20 },
  rowInfo: { flex: 1 },
  rowTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.md,
    color: Colors.textPrimary,
  },
  rowSubtitle: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  strikethrough: {
    textDecorationLine: 'line-through',
    color: Colors.textMuted,
  },
  nextBadge: {
    backgroundColor: Colors.gold,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
  },
  nextBadgeText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 10,
    color: Colors.textOnDark,
  },
  addTaskBtn: {
    marginTop: Spacing.lg,
    borderWidth: 1.5,
    borderColor: Colors.gold,
    borderStyle: 'dashed',
    borderRadius: Radius.md,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  addTaskText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.md,
    color: Colors.gold,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Colors.bgCream,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing.lg,
    paddingBottom: 40,
    maxHeight: '90%',
  },
  modalTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.xl,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  speakBtn: {
    backgroundColor: Colors.textPrimary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  speakBtnText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.md,
    color: Colors.textOnDark,
  },
  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  divLine: { flex: 1, height: 1, backgroundColor: Colors.borderLight },
  orText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    letterSpacing: 1,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginVertical: Spacing.md,
  },
  catTile: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: Radius.md,
    padding: Spacing.md,
    backgroundColor: Colors.bgCard,
  },
  catTileSelected: {
    borderColor: Colors.gold,
    backgroundColor: Colors.goldLight,
  },
  catEmoji: { fontSize: 20 },
  catLabel: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.sm,
    color: Colors.textPrimary,
  },
  whenLabel: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    letterSpacing: 1.2,
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  timeSlot: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.bgCard,
  },
  timeSlotSelected: {
    borderColor: Colors.successTeal,
    backgroundColor: Colors.successTealLight,
  },
  timeSlotLabel: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.md,
    color: Colors.textPrimary,
  },
  timeSlotTime: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.md,
    color: Colors.textSecondary,
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  addBtn: {
    flex: 1,
    backgroundColor: Colors.successTeal,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  addBtnText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.md,
    color: Colors.textOnDark,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.borderMedium,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
  },
  cancelBtnText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.md,
    color: Colors.textSecondary,
  },
});

