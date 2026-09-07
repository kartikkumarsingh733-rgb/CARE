// Caregiver Mode tab navigator — navy theme (matches screenshots)
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography } from '@/constants/theme';

function TabIcon({
  emoji,
  label,
  focused,
}: {
  emoji: string;
  label: string;
  focused: boolean;
}) {
  return (
    <View style={styles.tabItem}>
      <Text style={styles.tabEmoji}>{emoji}</Text>
      <Text
        style={[
          styles.tabLabel,
          { color: focused ? Colors.tabBarActive : Colors.tabBarInactive },
        ]}
      >
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
            <TabIcon emoji="🏠" label="Home" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="patients"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="👥" label="Patients" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🔔" label="Alerts" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="trends"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="📈" label="Trends" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="access"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="⚙️" label="Access" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.caregiverNavy,
    borderTopWidth: 0,
    height: 60,
    paddingBottom: 4,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 6,
  },
  tabEmoji: { fontSize: 22 },
  tabLabel: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: 10,
    marginTop: 2,
  },
});

