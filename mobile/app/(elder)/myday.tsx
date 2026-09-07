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
import { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/constants/theme';
import FloatingChatButton from '@/components/FloatingChatButton';
import { useAppStore, Reminder } from '@/store/appStore';
import { NotificationService } from '@/services/NotificationService';

const TASK_CATEGORIES = [
  { label: 'Medicine',       emoji: '💊', color: '#1B263B' },
  { label: 'Meal',           emoji: '🍽️', color: '#E07A5F' },
  { label: 'Drink Water',    emoji: '💧', color: '#005F73' },
  { label: 'Walk',           emoji: '🚶', color: Colors.successTeal },
  { label: 'Doctor Visit',   emoji: '⭐', color: Colors.domainAttention },
  { label: 'Temple / Prayer', emoji: '🛕', color: Colors.domainPatterns },
  { label: 'Call Family',    emoji: '📞', color: Colors.domainMemory },
  { label: 'Rest / Nap',     emoji: '🛌', color: Colors.textMuted },
];

const TIME_SLOTS = [
  { label: 'Morning',   time: '8:00 AM'  },
  { label: 'Midday',    time: '12:00 PM' },
  { label: 'Afternoon', time: '3:00 PM'  },
  { label: 'Evening',   time: '6:00 PM'  },
  { label: 'Night',     time: '9:00 PM'  },
  { label: 'Test Now',  time: 'In 10 sec' },
];

export default function MyDayScreen() {
  const { reminders, toggleReminderDone, addReminder } = useAppStore();
  const [showAddTask, setShowAddTask] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<typeof TASK_CATEGORIES[0] | null>(null);
  const [selectedTime, setSelectedTime] = useState<typeof TIME_SLOTS[0] | null>(null);

  useEffect(() => {
    // Request permissions when the screen loads
    NotificationService.requestPermissionsAsync();
  }, []);

  const handleAddReminder = async () => {
    if (!selectedCategory || !selectedTime) return;

    let notificationId: string | undefined;

    if (selectedTime.label === 'Test Now') {
      notificationId = await NotificationService.scheduleReminderInSeconds(
        selectedCategory.label,
        'Time to do your task!',
        10,
        { category: selectedCategory.label }
      );
    } else {
      // In a real app, parse `selectedTime.time` to the actual Date object
      // For now, we'll schedule it for 2 minutes from now as a demo if not 'Test Now'
      notificationId = await NotificationService.scheduleReminderInSeconds(
        selectedCategory.label,
        'Time for your scheduled task!',
        120, // 2 mins
        { category: selectedCategory.label }
      );
    }

    addReminder({
      title: selectedCategory.label,
      subtitle: `Scheduled for ${selectedTime.label}`,
      time: selectedTime.time,
      emoji: selectedCategory.emoji,
      color: selectedCategory.color,
      notificationId,
    });

    setShowAddTask(false);
    setSelectedCategory(null);
    setSelectedTime(null);
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

        {reminders.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => toggleReminderDone(item.id)}
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

            {/* Category grid */}
            <View style={styles.categoryGrid}>
              {TASK_CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.label}
                  style={[
                    styles.catTile,
                    selectedCategory?.label === cat.label && styles.catTileSelected,
                  ]}
                  onPress={() => setSelectedCategory(cat)}
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
                  selectedTime?.label === slot.label && styles.timeSlotSelected,
                ]}
                onPress={() => setSelectedTime(slot)}
              >
                <Text style={styles.timeSlotLabel}>{slot.label}</Text>
                <Text style={styles.timeSlotTime}>{slot.time}</Text>
              </TouchableOpacity>
            ))}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.addBtn}
                onPress={handleAddReminder}
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
    borderBottomWidth: 2,
    borderBottomColor: Colors.borderLight,
  },
  title: {
    fontFamily: Typography.fontFamily.display,
    fontSize: Typography.size.xxxl,
    color: Colors.textOnDark,
  },
  date: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: 'rgba(255,255,255,0.9)',
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
    backgroundColor: Colors.bgCardWarm,
    borderWidth: 2,
    borderColor: Colors.borderLight,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.md,
    ...Shadow.card,
    shadowOffset: { width: 3, height: 3 },
  },
  scheduleRowNext: {
    borderColor: Colors.domainPatterns,
    borderWidth: 2,
    backgroundColor: Colors.domainPatternsShadow,
  },
  timeText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    width: 65,
  },
  iconSquare: {
    width: 44,
    height: 44,
    borderWidth: 2,
    borderColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: { fontSize: 20, color: Colors.textOnDark },
  rowEmoji: { fontSize: 24 },
  rowInfo: { flex: 1 },
  rowTitle: {
    fontFamily: Typography.fontFamily.display,
    fontSize: Typography.size.lg,
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
    backgroundColor: Colors.domainPatterns,
    borderWidth: 2,
    borderColor: Colors.borderLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  nextBadgeText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 12,
    color: Colors.textOnDark,
  },
  addTaskBtn: {
    marginTop: Spacing.lg,
    borderWidth: 2,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.domainPatterns,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    ...Shadow.card,
    shadowOffset: { width: 3, height: 3 },
  },
  addTaskText: {
    fontFamily: Typography.fontFamily.display,
    fontSize: Typography.size.md,
    color: Colors.textOnDark,
  },
  // Modal (Neubrutalism styled)
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Colors.bgCream,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderColor: Colors.borderLight,
    padding: Spacing.lg,
    paddingBottom: 40,
    maxHeight: '90%',
  },
  modalTitle: {
    fontFamily: Typography.fontFamily.display,
    fontSize: Typography.size.xxl,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginVertical: Spacing.sm,
  },
  catTile: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 2,
    borderColor: Colors.borderLight,
    padding: Spacing.md,
    backgroundColor: Colors.bgCardWarm,
    ...Shadow.card,
    shadowOffset: { width: 2, height: 2 },
  },
  catTileSelected: {
    backgroundColor: Colors.domainPatterns,
    shadowOffset: { width: 0, height: 0 },
  },
  catEmoji: { fontSize: 24 },
  catLabel: {
    fontFamily: Typography.fontFamily.display,
    fontSize: Typography.size.sm,
    color: Colors.textPrimary,
  },
  whenLabel: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    letterSpacing: 1.2,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  timeSlot: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: Colors.borderLight,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.bgCardWarm,
    ...Shadow.card,
    shadowOffset: { width: 2, height: 2 },
  },
  timeSlotSelected: {
    backgroundColor: Colors.domainAttention,
    shadowOffset: { width: 0, height: 0 },
  },
  timeSlotLabel: {
    fontFamily: Typography.fontFamily.display,
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
    gap: Spacing.md,
    marginTop: Spacing.xl,
  },
  addBtn: {
    flex: 1,
    backgroundColor: Colors.successTeal,
    borderWidth: 2,
    borderColor: Colors.borderLight,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    ...Shadow.card,
    shadowOffset: { width: 3, height: 3 },
  },
  addBtnText: {
    fontFamily: Typography.fontFamily.display,
    fontSize: Typography.size.md,
    color: Colors.textOnDark,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 2,
    borderColor: Colors.borderLight,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    ...Shadow.card,
    shadowOffset: { width: 3, height: 3 },
  },
  cancelBtnText: {
    fontFamily: Typography.fontFamily.display,
    fontSize: Typography.size.md,
    color: Colors.textPrimary,
  },
});


