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
import { MaterialIcons } from '@expo/vector-icons';

const TASK_CATEGORIES = [
  { label: 'Medicine',       icon: 'medication', color: '#C4822A' },
  { label: 'Meal',           icon: 'restaurant', color: '#366184' },
  { label: 'Drink Water',    icon: 'local-drink', color: '#366184' },
  { label: 'Walk',           icon: 'directions-walk', color: '#366184' },
  { label: 'Doctor Visit',   icon: 'local-hospital', color: '#C4822A' },
  { label: 'Temple / Prayer', icon: 'temple-hindu', color: '#C4822A' },
  { label: 'Call Family',    icon: 'phone', color: '#586C32' },
  { label: 'Rest / Nap',     icon: 'bed', color: '#586C32' },
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
    NotificationService.requestPermissionsAsync();
  }, []);

  const handleAddReminder = async () => {
    if (!selectedCategory || !selectedTime) return;

    let notificationId: string | undefined;

    try {
      if (selectedTime.label === 'Test Now') {
        notificationId = await NotificationService.scheduleReminderInSeconds(
          selectedCategory.label,
          'Time to do your task!',
          10,
          { category: selectedCategory.label }
        );
      } else {
        notificationId = await NotificationService.scheduleReminderInSeconds(
          selectedCategory.label,
          'Time for your scheduled task!',
          120, // 2 mins
          { category: selectedCategory.label }
        );
      }
    } catch (e) {
      console.warn("Notifications may not work in Expo Go, adding task anyway");
    }

    addReminder({
      title: selectedCategory.label,
      subtitle: `Scheduled for ${selectedTime.label}`,
      time: selectedTime.time,
      icon: selectedCategory.icon,
      color: selectedCategory.color,
      notificationId,
    });

    setShowAddTask(false);
    setSelectedCategory(null);
    setSelectedTime(null);
  };

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const nextTaskIndex = reminders.findIndex(r => !r.done);

  return (
    <View style={styles.container}>
      {/* Header outside SafeArea to reach top, or wrapped in SafeArea with bg color */}
      <View style={styles.header}>
        <SafeAreaView edges={['top']}>
          <Text style={styles.title}>My Day</Text>
          <Text style={styles.date}>{today}</Text>
        </SafeAreaView>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionLabel}>TODAY'S SCHEDULE</Text>

        {reminders.map((item, index) => {
          const isNext = index === nextTaskIndex;
          
          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => toggleReminderDone(item.id)}
              activeOpacity={0.8}
              style={[
                styles.scheduleRow,
                isNext && styles.scheduleRowNext,
                item.done && styles.scheduleRowDone,
              ]}
            >
              {/* Left Accent Line */}
              <View style={[
                styles.accentLine, 
                { backgroundColor: item.color },
                item.done && { opacity: 0.3 }
              ]} />
              
              <Text style={[styles.timeText, item.done && { opacity: 0.5 }]}>{item.time}</Text>
              
              <View
                style={[
                  styles.iconSquare,
                  { backgroundColor: item.color },
                  item.done && { backgroundColor: '#C8C1B5', opacity: 0.8 } // Faded gray for done items
                ]}
              >
                <MaterialIcons 
                  name={item.done ? "check" : (item.icon as any)} 
                  size={32} 
                  color="#FFFFFF" 
                />
              </View>
              
              <View style={styles.rowInfo}>
                <Text
                  style={[
                    styles.rowTitle,
                    item.done && styles.strikethroughTitle,
                  ]}
                >
                  {item.title}
                </Text>
                <Text
                  style={[
                    styles.rowSubtitle,
                    item.done && styles.strikethroughSubtitle,
                  ]}
                >
                  {item.subtitle}
                </Text>
              </View>
              
              {isNext && (
                <View style={styles.nextBadge}>
                  <Text style={styles.nextBadgeText}>NEXT</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        {/* Add Task UI, retained but re-styled */}
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
                  <MaterialIcons name={cat.icon as any} size={24} color={selectedCategory?.label === cat.label ? '#FFF' : cat.color} />
                  <Text style={[styles.catLabel, selectedCategory?.label === cat.label && {color: '#FFF'}]}>{cat.label}</Text>
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
                <Text style={[styles.timeSlotLabel, selectedTime?.label === slot.label && {color: '#FFF'}]}>{slot.label}</Text>
                <Text style={[styles.timeSlotTime, selectedTime?.label === slot.label && {color: 'rgba(255,255,255,0.8)'}]}>{slot.time}</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgCream },
  header: {
    backgroundColor: Colors.domainRecall, // #8C4031 brown
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  title: {
    fontFamily: Typography.fontFamily.display,
    fontSize: 40,
    color: '#FFFFFF',
    marginTop: Spacing.xl,
  },
  date: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: 18,
    color: '#F0D6C1', // Light beige text matching design
    marginTop: 8,
  },
  scroll: { paddingHorizontal: Spacing.lg, paddingBottom: 120 },
  sectionLabel: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 14,
    color: '#7C6746', // Brownish
    letterSpacing: 1.5,
    marginTop: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDFCF7', // Off-white
    borderWidth: 1,
    borderColor: '#E8DFCC',
    paddingVertical: 18,
    paddingHorizontal: 12,
    marginBottom: Spacing.md,
    gap: 12,
  },
  scheduleRowNext: {
    backgroundColor: '#FFF9ED', // Golden tint for NEXT
    borderColor: '#602A1A',
    borderBottomWidth: 3,
    borderRightWidth: 3,
    shadowColor: '#4A2A1A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  scheduleRowDone: {
    backgroundColor: '#FDFBF5',
    opacity: 0.8,
  },
  accentLine: {
    position: 'absolute',
    left: -1,
    top: 8,
    bottom: 8,
    width: 6,
    borderRadius: 3,
  },
  timeText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 14,
    color: '#6A5638',
    width: 70,
    textAlign: 'center',
  },
  iconSquare: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  },
  rowInfo: { flex: 1, marginLeft: 4 },
  rowTitle: {
    fontFamily: Typography.fontFamily.display,
    fontSize: 22,
    color: '#000000',
    marginBottom: 4,
  },
  rowSubtitle: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: 16,
    color: '#6A5638',
  },
  strikethroughTitle: {
    textDecorationLine: 'line-through',
    color: '#B8A692',
  },
  strikethroughSubtitle: {
    color: '#B8A692',
  },
  nextBadge: {
    backgroundColor: '#B57C2A', // Golden
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 4,
  },
  nextBadgeText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 12,
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  addTaskBtn: {
    marginTop: Spacing.lg,
    borderWidth: 2,
    borderColor: Colors.borderLight,
    backgroundColor: '#FFFFFF',
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    ...Shadow.card,
    shadowOffset: { width: 3, height: 3 },
  },
  addTaskText: {
    fontFamily: Typography.fontFamily.display,
    fontSize: Typography.size.md,
    color: Colors.textPrimary,
  },
  // Modal (Retained similar styling)
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
    backgroundColor: Colors.domainRecall, // #8C4031
    shadowOffset: { width: 0, height: 0 },
  },
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
    backgroundColor: Colors.domainRecall, // #8C4031
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


