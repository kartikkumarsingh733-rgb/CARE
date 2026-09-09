// Caregiver Mode tab navigator — Material Design Redesign
import { Tabs } from 'expo-router';
import { StyleSheet, Platform } from 'react-native';
import { Colors, Typography } from '@/constants/theme';
import { MaterialIcons } from '@expo/vector-icons';

export default function CaregiverTabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.caregiverPrimary,
        tabBarInactiveTintColor: Colors.caregiverTextMuted,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="dashboard" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="patients"
        options={{
          tabBarLabel: "Patients",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="people" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          tabBarLabel: "Alerts",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="notifications" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="trends"
        options={{
          tabBarLabel: "Trends",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="trending-up" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="access"
        options={{
          tabBarLabel: "Settings",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.caregiverBg,
    borderTopWidth: 1,
    borderTopColor: Colors.caregiverBorder,
    height: Platform.OS === 'ios' ? 88 : 68,
    paddingBottom: Platform.OS === 'ios' ? 28 : 8,
    paddingTop: 8,
  },
  tabLabel: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: 12,
    marginTop: 4,
  },
});

