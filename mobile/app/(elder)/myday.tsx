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
import i18n from '@/services/i18n';
import { TouchableWithoutFeedback, Alert } from 'react-native';

const TASK_CATEGORIES = [
  { i18nKey: 'cat_medicine',       icon: 'medication', color: '#C4822A' },
  { i18nKey: 'cat_meal',           icon: 'restaurant', color: '#366184' },
  { i18nKey: 'cat_water',          icon: 'local-drink', color: '#366184' },
  { i18nKey: 'cat_walk',           icon: 'directions-walk', color: '#366184' },
  { i18nKey: 'cat_doctor',         icon: 'local-hospital', color: '#C4822A' },
  { i18nKey: 'cat_temple',         icon: 'temple-hindu', color: '#C4822A' },
  { i18nKey: 'cat_call_family',    icon: 'phone', color: '#586C32' },
  { i18nKey: 'cat_rest',           icon: 'bed', color: '#586C32' },
];

const TIME_SLOTS = [
  { i18nKey: 'slot_morning',   time: '8:00 AM'  },
  { i18nKey: 'slot_midday',    time: '12:00 PM' },
  { i18nKey: 'slot_afternoon', time: '3:00 PM'  },
  { i18nKey: 'slot_evening',   time: '6:00 PM'  },
  { i18nKey: 'slot_night',     time: '9:00 PM'  },
  { i18nKey: 'slot_test',      time: 'In 10 sec' },
];

export default function MyDayScreen() {
  const { reminders, toggleReminderDone, addReminder, removeReminder, updateReminder } = useAppStore();
  const [showAddTask, setShowAddTask] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<typeof TASK_CATEGORIES[0] | null>(null);
  const [selectedTime, setSelectedTime] = useState<typeof TIME_SLOTS[0] | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const language = useAppStore(state => state.patient.preferredLanguage);
  i18n.locale = language || 'en';

  useEffect(() => {
    NotificationService.requestPermissionsAsync();
  }, []);

  const handleAddReminder = async () => {
    if (!selectedCategory || !selectedTime) {
      setErrorMsg('Please select both a category and a time slot.');
      return;
    }
    setErrorMsg('');

    let notificationId: string | undefined;

    try {
      if (selectedTime.i18nKey === 'slot_test') {
        notificationId = await NotificationService.scheduleReminderInSeconds(
          i18n.t(selectedCategory.i18nKey),
          i18n.t('time_task_msg'),
          10,
          { category: i18n.t(selectedCategory.i18nKey) }
        );
      } else {
        notificationId = await NotificationService.scheduleReminderInSeconds(
          i18n.t(selectedCategory.i18nKey),
          i18n.t('time_scheduled_msg'),
          120, // 2 mins
          { category: i18n.t(selectedCategory.i18nKey) }
        );
      }
    } catch (e) {
      console.warn("Notifications may not work in Expo Go, adding task anyway");
    }

    if (editingId && updateReminder) {
      updateReminder(editingId, {
        title: i18n.t(selectedCategory.i18nKey),
        subtitle: i18n.t('scheduled_for', { time: i18n.t(selectedTime.i18nKey) }),
        time: selectedTime.time,
        icon: selectedCategory.icon,
        color: selectedCategory.color,
      });
    } else {
      addReminder({
        title: i18n.t(selectedCategory.i18nKey),
        subtitle: i18n.t('scheduled_for', { time: i18n.t(selectedTime.i18nKey) }),
        time: selectedTime.time,
        icon: selectedCategory.icon,
        color: selectedCategory.color,
        notificationId,
      });
    }

    setShowAddTask(false);
    setSelectedCategory(null);
    setSelectedTime(null);
    setEditingId(null);
    setErrorMsg('');
  };

  const handleCloseModal = () => {
    setShowAddTask(false);
    setSelectedCategory(null);
    setSelectedTime(null);
    setEditingId(null);
    setErrorMsg('');
  };

  const openEditModal = (item: Reminder) => {
    const matchedCategory = TASK_CATEGORIES.find(c => c.icon === item.icon) || null;
    const matchedTime = TIME_SLOTS.find(t => t.time === item.time) || null;
    setSelectedCategory(matchedCategory);
    setSelectedTime(matchedTime);
    setEditingId(item.id);
    setErrorMsg('');
    setShowAddTask(true);
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
          <Text style={styles.title}>{i18n.t('myday_title')}</Text>
          <Text style={styles.date}>{today}</Text>
        </SafeAreaView>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionLabel}>{i18n.t('myday_today').toUpperCase()}</Text>

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

              <View style={{ flexDirection: 'row', gap: 4 }}>
                <TouchableOpacity
                  style={{ padding: Spacing.sm }}
                  onPress={(e) => {
                    e.stopPropagation();
                    openEditModal(item);
                  }}
                >
                  <MaterialIcons name="edit" size={24} color="#6A5638" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={{ padding: Spacing.sm }}
                  onPress={(e) => {
                    e.stopPropagation();
                    Alert.alert('Delete Task', 'Are you sure you want to delete this task?', [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Delete', style: 'destructive', onPress: () => removeReminder(item.id) }
                    ]);
                  }}
                >
                  <MaterialIcons name="delete-outline" size={24} color="#8C4031" />
                </TouchableOpacity>
              </View>
              
              {isNext && (
                <View style={styles.nextBadge}>
                  <Text style={styles.nextBadgeText}>{i18n.t('next_badge')}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        {reminders.length === 0 && (
          <View style={{ padding: Spacing.xl, alignItems: 'center' }}>
            <MaterialIcons name="event-available" size={64} color={Colors.borderLight} />
            <Text style={{ marginTop: Spacing.md, fontFamily: Typography.fontFamily.semiBold, color: Colors.textMuted, fontSize: 16 }}>No tasks for today. Enjoy your day!</Text>
          </View>
        )}

        {/* Add Task UI, retained but re-styled */}
        <TouchableOpacity
          style={styles.addTaskBtn}
          onPress={() => setShowAddTask(true)}
        >
          <Text style={styles.addTaskText}>{i18n.t('add_task_btn')}</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={showAddTask}
        animationType="slide"
        transparent
        onRequestClose={handleCloseModal}
      >
        <TouchableOpacity activeOpacity={1} onPress={handleCloseModal} style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalSheet}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg }}>
                <Text style={[styles.modalTitle, { marginBottom: 0 }]}>{editingId ? 'Edit Task' : i18n.t('add_task_modal_title')}</Text>
                <TouchableOpacity onPress={handleCloseModal} style={{ padding: 4 }}>
                  <MaterialIcons name="close" size={28} color={Colors.textPrimary} />
                </TouchableOpacity>
              </View>

              {errorMsg ? <Text style={{ color: Colors.caregiverAccent, marginBottom: Spacing.md, fontFamily: Typography.fontFamily.semiBold }}>{errorMsg}</Text> : null}

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Spacing.md }}>
                {/* Category grid */}
                <View style={styles.categoryGrid}>
                  {TASK_CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat.i18nKey}
                      style={[
                        styles.catTile,
                        selectedCategory?.i18nKey === cat.i18nKey && styles.catTileSelected,
                      ]}
                      onPress={() => setSelectedCategory(cat)}
                    >
                      <MaterialIcons name={cat.icon as any} size={24} color={selectedCategory?.i18nKey === cat.i18nKey ? '#FFF' : cat.color} />
                      <Text style={[styles.catLabel, selectedCategory?.i18nKey === cat.i18nKey && {color: '#FFF'}]}>{i18n.t(cat.i18nKey)}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.whenLabel}>{i18n.t('when_label')}</Text>
                {TIME_SLOTS.map((slot) => (
                  <TouchableOpacity
                    key={slot.i18nKey}
                    style={[
                      styles.timeSlot,
                      selectedTime?.i18nKey === slot.i18nKey && styles.timeSlotSelected,
                    ]}
                    onPress={() => setSelectedTime(slot)}
                  >
                    <Text style={[styles.timeSlotLabel, selectedTime?.i18nKey === slot.i18nKey && {color: '#FFF'}]}>{i18n.t(slot.i18nKey)}</Text>
                    <Text style={[styles.timeSlotTime, selectedTime?.i18nKey === slot.i18nKey && {color: 'rgba(255,255,255,0.8)'}]}>{slot.time}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.addBtn}
                onPress={handleAddReminder}
              >
                <Text style={styles.addBtnText}>{editingId ? 'Save Changes' : i18n.t('add_to_my_day')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={handleCloseModal}
              >
                <Text style={styles.cancelBtnText}>{i18n.t('cancel')}</Text>
              </TouchableOpacity>
            </View>
          </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
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
    paddingTop: Spacing.md,
    marginTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
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


