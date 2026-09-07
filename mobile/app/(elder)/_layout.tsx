// Elder Mode tab navigator — 5 tabs matching the screenshots exactly
// Tab colors use domain gold for active state, dark background
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '@/constants/theme';

function TabIcon({
  icon,
  label,
  focused,
}: {
  icon: string;
  label: string;
  focused: boolean;
}) {
  return (
    <View style={[styles.tabItem, focused && styles.tabItemFocused]}>
      <FontAwesome5 
        name={icon} 
        size={22} 
        color={focused ? '#FFFFFF' : '#D4C5B9'} 
      />
      <Text
        style={[
          styles.tabLabel,
          { color: focused ? '#FFFFFF' : '#D4C5B9' },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

export default function ElderTabLayout() {
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
            <TabIcon icon="home" label="Home" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="play"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="puzzle-piece" label="Play" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="myday"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="calendar-alt" label="My Day" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="memories"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="image" label="Memories" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="help"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="exclamation-circle" label="Help" focused={focused} />
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
    height: 70,
    paddingBottom: 0,
    paddingHorizontal: 0,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
  },
  tabItemFocused: {
    backgroundColor: '#24402E', // Active green background from header
  },
  tabLabel: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 13,
    marginTop: 4,
  },
});

