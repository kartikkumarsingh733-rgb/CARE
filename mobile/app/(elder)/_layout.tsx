// Elder Mode tab navigator — 5 tabs matching the screenshots exactly
// Tab colors use domain gold for active state, dark background
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '@/constants/theme';

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
            <TabIcon emoji="🏠" label="Home" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="play"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🧩" label="Play" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="myday"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="📅" label="My Day" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="memories"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🖼️" label="Memories" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="help"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="❓" label="Help" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.tabBarBg,
    borderTopWidth: 0,
    height: 60,
    paddingBottom: 4,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 6,
  },
  tabEmoji: {
    fontSize: 22,
  },
  tabLabel: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.xs,
    marginTop: 2,
  },
});

