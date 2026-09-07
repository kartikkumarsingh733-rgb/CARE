// Caregiver Mode tab navigator — Material Design Redesign
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography } from '@/constants/theme';
import { MaterialIcons } from '@expo/vector-icons';

function TabIcon({
  iconName,
  label,
  focused,
}: {
  iconName: keyof typeof MaterialIcons.glyphMap;
  label: string;
  focused: boolean;
}) {
  const color = focused ? Colors.caregiverPrimary : Colors.caregiverTextMuted;
  return (
    <View style={styles.tabItem}>
      <MaterialIcons name={iconName} size={24} color={color} />
      <Text style={[styles.tabLabel, { color }]}>
        {label}
      </Text>
    </View>
  );
}

export default function CaregiverTabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon iconName="dashboard" label="Home" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="patients"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon iconName="people" label="Patients" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon iconName="notifications" label="Alerts" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="trends"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon iconName="trending-up" label="Trends" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="access"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon iconName="settings" label="Settings" focused={focused} />
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
    height: 64,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: 12,
    marginTop: 4,
  },
});

