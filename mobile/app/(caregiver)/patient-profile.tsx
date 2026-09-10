import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/constants/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppStore, Task } from '@/store/appStore';

export default function PatientProfileScreen() {
  const router = useRouter();
  const patient = useAppStore((state) => state.patient);
  const healthHistory = useAppStore((state) => state.healthHistory) || { allergies: [], conditions: [], bloodType: '' };
  const tasks = useAppStore((state) => state.tasks);
  const addTask = useAppStore((state) => state.addTask);
  const updateTask = useAppStore((state) => state.updateTask);
  const deleteTask = useAppStore((state) => state.deleteTask);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');

  const patientTasks = tasks.filter(t => t.assignee === 'caregiver' || t.assignee === 'elder');

  const handleCreateTask = () => {
    if (!newTaskTitle.trim()) return;
    addTask({
      title: newTaskTitle.trim(),
      description: newTaskDesc.trim(),
      assignee: 'caregiver', // assigned by caregiver for elder
      status: 'pending',
      dueDate: new Date().toISOString()
    });
    setIsTaskModalOpen(false);
    setNewTaskTitle('');
    setNewTaskDesc('');
  };

  const toggleTaskStatus = (task: Task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    updateTask(task.id, { status: newStatus });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.textOnDark} />
        </TouchableOpacity>
        <Text style={styles.title}>Patient Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Basic Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>{patient.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Age:</Text>
            <Text style={styles.value}>{patient.age} years</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Language:</Text>
            <Text style={styles.value}>{patient.preferredLanguage.toUpperCase()}</Text>
          </View>
        </View>

        {/* Health History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Health History</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Blood Type:</Text>
            <Text style={styles.value}>{healthHistory.bloodType}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Allergies:</Text>
            <Text style={styles.value}>{healthHistory.allergies.join(', ') || 'None'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Conditions:</Text>
            <Text style={styles.value}>{healthHistory.conditions.join(', ') || 'None'}</Text>
          </View>
        </View>

        {/* Task Management */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Assigned Tasks</Text>
          <TouchableOpacity onPress={() => setIsTaskModalOpen(true)} style={styles.addBtn}>
            <MaterialIcons name="add" size={20} color={Colors.textOnDark} />
            <Text style={styles.addBtnText}>New Task</Text>
          </TouchableOpacity>
        </View>
        
        {patientTasks.length === 0 ? (
          <Text style={styles.emptyText}>No tasks assigned yet.</Text>
        ) : (
          patientTasks.map(t => (
            <View key={t.id} style={styles.taskCard}>
              <TouchableOpacity onPress={() => toggleTaskStatus(t)} style={styles.taskCheckbox}>
                <MaterialIcons 
                  name={t.status === 'completed' ? 'check-circle' : 'radio-button-unchecked'} 
                  size={28} 
                  color={t.status === 'completed' ? Colors.successTeal : 'rgba(255,255,255,0.5)'} 
                />
              </TouchableOpacity>
              <View style={styles.taskInfo}>
                <Text style={[styles.taskTitle, t.status === 'completed' && styles.taskCompleted]}>
                  {t.title}
                </Text>
                {t.description && t.description.trim().length > 0 ? <Text style={styles.taskDesc}>{t.description}</Text> : null}
              </View>
              <TouchableOpacity onPress={() => deleteTask(t.id)} style={styles.taskDelete}>
                <MaterialIcons name="delete-outline" size={24} color={Colors.alertRed} />
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      {/* Add Task Modal */}
      <Modal visible={isTaskModalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Assign New Task</Text>
              <TouchableOpacity onPress={() => setIsTaskModalOpen(false)}>
                <MaterialIcons name="close" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Task Title</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Do morning exercises"
                placeholderTextColor="rgba(0,0,0,0.3)"
                value={newTaskTitle}
                onChangeText={setNewTaskTitle}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Details..."
                placeholderTextColor="rgba(0,0,0,0.3)"
                value={newTaskDesc}
                onChangeText={setNewTaskDesc}
                multiline
              />
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleCreateTask}>
              <Text style={styles.saveBtnText}>Save Task</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.caregiverNavy },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    backgroundColor: Colors.caregiverNavy,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backButton: { padding: Spacing.xs },
  title: { fontSize: Typography.size.lg, fontFamily: Typography.fontFamily.bold, color: Colors.textOnDark },
  scroll: { padding: Spacing.lg, gap: Spacing.lg, paddingBottom: 80 },
  section: { 
    backgroundColor: Colors.caregiverNavyLight, 
    padding: Spacing.lg, 
    borderRadius: Radius.lg, 
    gap: Spacing.sm,
    ...Shadow.card
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
  },
  sectionTitle: { 
    fontSize: Typography.size.md, 
    fontFamily: Typography.fontFamily.bold, 
    color: Colors.textOnDark,
    marginBottom: Spacing.xs,
  },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.xs },
  label: { fontSize: Typography.size.sm, color: 'rgba(255,255,255,0.6)', fontFamily: Typography.fontFamily.regular },
  value: { fontSize: Typography.size.sm, color: Colors.textOnDark, fontFamily: Typography.fontFamily.semiBold },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.lg,
  },
  addBtnText: {
    color: Colors.textOnDark,
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.xs,
    marginLeft: 4,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.5)',
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    textAlign: 'center',
    padding: Spacing.xl,
  },
  taskCard: {
    backgroundColor: Colors.caregiverNavyLight,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...Shadow.card,
  },
  taskCheckbox: { marginRight: Spacing.md },
  taskInfo: { flex: 1 },
  taskTitle: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.md,
    color: Colors.textOnDark,
  },
  taskCompleted: {
    textDecorationLine: 'line-through',
    color: 'rgba(255,255,255,0.5)',
  },
  taskDesc: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  taskDelete: { padding: Spacing.sm },
  
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.bgCream,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing.xl,
    minHeight: 350,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  modalTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.lg,
    color: Colors.textPrimary,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.sm,
    color: Colors.textMuted,
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: Radius.md,
    padding: Spacing.md,
    fontSize: Typography.size.md,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textPrimary,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  saveBtn: {
    backgroundColor: Colors.domainMemory,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  saveBtnText: {
    color: Colors.textOnDark,
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.md,
  }
});

