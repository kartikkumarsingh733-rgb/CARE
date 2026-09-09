// Elder Mode tab navigator — 5 tabs matching the screenshots exactly
// Tab colors use domain gold for active state, dark background
import { Tabs } from 'expo-router';
import { StyleSheet, Platform } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '@/constants/theme';

export default function ElderTabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#D4C5B9',
        tabBarLabelStyle: styles.tabLabel,
        tabBarActiveBackgroundColor: '#24402E', // Active green background
        tabBarItemStyle: styles.tabItem,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="home" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="play"
        options={{
          tabBarLabel: 'Play',
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="puzzle-piece" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="myday"
        options={{
          tabBarLabel: 'My Day',
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="calendar-alt" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="memories"
        options={{
          tabBarLabel: 'Memories',
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="image" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="help"
        options={{
          tabBarLabel: 'Help',
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="exclamation-circle" size={22} color={color} />
          ),
        }}
      />
      {/* Hide game screens from the tab bar */}
      <Tabs.Screen name="games/mera-din" options={{ href: null }} />
      <Tabs.Screen name="games/milan" options={{ href: null }} />
      <Tabs.Screen name="games/nazar-tez" options={{ href: null }} />
      <Tabs.Screen name="games/yaad-rakho" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#2C1E14', // Lighter brown
    borderTopWidth: 0,
    height: Platform.OS === 'ios' ? 90 : 70,
    paddingBottom: Platform.OS === 'ios' ? 28 : 8,
    paddingTop: 8,
  },
  tabItem: {
    paddingVertical: 4,
    marginHorizontal: 4,
    borderRadius: 8,
  },
  tabLabel: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 12,
    marginTop: 2,
  },
});

