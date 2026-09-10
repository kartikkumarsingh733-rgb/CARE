import { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '@/constants/theme';
import { useAppStore } from '@/store/appStore';
import i18n from '@/services/i18n';
import { audioService } from '@/services/AudioService';
import FloatingChatButton from '@/components/FloatingChatButton';
// Exact colors from Figma
const F = {
  headerBg: '#24402E',
  headerGreenText: '#A6C4AE',
  bgCream: '#F9F7F3', // Light, neutral cream matching Figma for screen background
  cardCream: '#FDF7EB', // Warm cream for tile backgrounds
  sectionTitle: '#9A7249',
  
  upNextBg: '#E2EFE3',
  upNextDark: '#1B3624',

  tileBlue: '#3B627A',
  tileBrown: '#893528',
  tileGreen: '#4C6A32',
  tileRed: '#B02A24',
};

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const patient = useAppStore((s) => s.patient);
  const scrollY = useRef(new Animated.Value(0)).current;

  i18n.locale = patient.preferredLanguage || 'en';

  useEffect(() => {
    const hour = new Date().getHours();
    let greetingKey = 'greeting_morning';
    if (hour >= 12 && hour < 17) greetingKey = 'greeting_afternoon';
    else if (hour >= 17) greetingKey = 'greeting_evening';
    
    setTimeout(() => {
      audioService.playKey(greetingKey);
    }, 500);
  }, [patient.preferredLanguage]);

  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? i18n.t('greeting_morning')
      : hour < 17
      ? i18n.t('greeting_afternoon')
      : i18n.t('greeting_evening');

  const handleTilePress = (route: string, audioKey: string) => {
    audioService.playKey(audioKey);
    router.push(route as any);
  };

  const tiles = [
    {
      icon: 'puzzle-piece',
      label: i18n.t('btn_play_games'),
      sub: i18n.t('btn_play_sub'),
      color: F.tileBlue,
      iconSize: 34,
      onPress: () => handleTilePress('/(elder)/play', 'btn_play_games'),
    },
    {
      icon: 'calendar-alt',
      label: i18n.t('btn_my_day'),
      sub: i18n.t('btn_my_day_sub'),
      color: F.tileBrown,
      iconSize: 30,
      onPress: () => handleTilePress('/(elder)/myday', 'btn_my_day'),
    },
    {
      icon: 'image',
      label: i18n.t('btn_memories'),
      sub: i18n.t('btn_memories_sub'),
      color: F.tileGreen,
      iconSize: 28,
      onPress: () => handleTilePress('/(elder)/memories', 'btn_memories'),
    },
    {
      icon: 'phone-alt',
      label: i18n.t('btn_help'),
      sub: i18n.t('btn_help_sub'),
      color: F.tileRed,
      iconSize: 32,
      onPress: () => handleTilePress('/(elder)/help', 'btn_help'),
    },
  ];

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -50],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <View style={[styles.container, { backgroundColor: F.bgCream }]}>
      {/* Header */}
      <Animated.View 
        style={[
          styles.header, 
          { 
            backgroundColor: F.headerBg, 
            paddingTop: insets.top + Spacing.lg,
            opacity: headerOpacity,
            transform: [{ translateY: headerTranslateY }]
          }
        ]}
      >
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>{greeting}</Text>
          <Text style={[styles.name, { color: F.headerGreenText }]}>{patient.name.split(' ')[0]}{i18n.t('honorific')}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <View style={styles.timeBox}>
            <Text style={styles.timeText}>
              {new Date().toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              }).toLowerCase()}
            </Text>
            <Text style={[styles.dateText, { color: F.headerGreenText }]}>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
              })}
              {',\n'}
              {new Date().toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'long',
              })}
            </Text>
          </View>
          
          <TouchableOpacity 
            style={styles.caregiverToggle}
            onPress={() => router.push('/settings')}
            accessible={true}
            accessibilityLabel="Settings"
          >
            <FontAwesome5 name="cog" size={24} color={F.headerGreenText} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <Animated.ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 120, paddingTop: insets.top + 160 }]}
        showsVerticalScrollIndicator={false}
        bounces={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* UP NEXT */}
        <Text style={[styles.sectionLabel, { color: F.sectionTitle }]}>{i18n.t('up_next_title')}</Text>
        
        {/* Hard Shadow Wrapper for UP NEXT */}
        <View style={styles.mascotWrapper}>
          {/* Shadow element */}
          <View style={[styles.mascotShadow, { backgroundColor: F.upNextDark }]} />
          {/* Main card */}
          <View style={[styles.mascotBox, { backgroundColor: F.upNextBg, borderColor: F.upNextDark }]}>
            <View style={[styles.mascotLeftBar, { backgroundColor: F.upNextDark }]} />
            <View style={styles.mascotTextContainer}>
              <Text style={[styles.mascotText, { color: F.upNextDark }]}>{i18n.t('up_next_done_title')}</Text>
              <Text style={styles.mascotSubtext}>
                {i18n.t('up_next_done_desc')}
              </Text>
            </View>
          </View>
        </View>

        {/* WHAT WOULD YOU LIKE TO DO? */}
        <Text style={[styles.sectionLabel, { color: F.sectionTitle, marginTop: Spacing.xs }]}>{i18n.t('what_to_do')}</Text>

        {/* Tiles */}
        <View style={styles.list}>
          {tiles.map((tile) => (
            <View key={tile.label} style={styles.tileWrapper}>
              {/* Shadow element */}
              <View style={[styles.tileShadow, { backgroundColor: tile.color }]} />
              
              {/* Main tile */}
              <TouchableOpacity
                style={[styles.tile, { borderColor: tile.color, backgroundColor: F.cardCream }]}
                onPress={tile.onPress}
                activeOpacity={0.9}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`${tile.label}. ${tile.sub}`}
              >
                <View style={[styles.tileIconBox, { backgroundColor: tile.color }]}>
                  <FontAwesome5 name={tile.icon} size={tile.iconSize} color="#FFF" />
                </View>
                <View style={styles.tileContent}>
                  <Text style={styles.tileLabel}>{tile.label}</Text>
                  <Text style={styles.tileSub}>{tile.sub}</Text>
                </View>
                <View style={styles.tileArrow}>
                  <FontAwesome5 name="chevron-right" size={14} color="#C4B4A4" />
                </View>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </Animated.ScrollView>

      {/* Floating Chat Button */}
      <FloatingChatButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
  },
  scroll: { 
    paddingHorizontal: Spacing.lg, 
    paddingTop: Spacing.lg 
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center', // Changed from flex-start to center for better alignment
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  headerLeft: { 
    flex: 1 
  },
  greeting: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 28, // Increased from 22
    color: '#FFFFFF',
    letterSpacing: 0,
    lineHeight: 36, // Added lineHeight to prevent text clipping
  },
  name: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 32, // Increased from 28
    marginTop: 0, // Removed negative margin to prevent overlap and text clipping
    lineHeight: 40, // Added lineHeight
  },
  timeBox: {
    alignItems: 'flex-end',
    paddingTop: 4,
  },
  caregiverToggle: {
    padding: 8,
    backgroundColor: '#1E3526', 
    borderRadius: 20,
    marginTop: 8, // Added margin to space out from date
  },
  timeText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.xl,
    color: '#FFFFFF',
  },
  dateText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    textAlign: 'right',
    marginTop: 2,
    lineHeight: 14,
  },
  sectionLabel: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 11,
    letterSpacing: 1.5,
    marginBottom: Spacing.sm,
    marginLeft: 2,
  },
  // Up Next Card
  mascotWrapper: {
    marginBottom: Spacing.xl,
    position: 'relative',
  },
  mascotShadow: {
    position: 'absolute',
    top: 5,
    left: 5,
    right: -5,
    bottom: -5,
  },
  mascotBox: {
    flexDirection: 'row',
    borderWidth: 1.5,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  mascotLeftBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 6,
  },
  mascotTextContainer: { 
    flex: 1,
    paddingLeft: Spacing.sm,
  },
  mascotText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.lg,
    marginBottom: 6,
  },
  mascotSubtext: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.md,
    color: '#556555',
    lineHeight: 20,
  },
  // Tiles
  list: {
    flexDirection: 'column',
    gap: Spacing.lg,
  },
  tileWrapper: {
    position: 'relative',
  },
  tileShadow: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: -4,
    bottom: -4,
  },
  tile: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderWidth: 1.5,
    padding: 0,
    minHeight: 85,
  },
  tileIconBox: {
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileContent: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  tileLabel: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 18,
    color: '#000000',
    marginBottom: 2,
  },
  tileSub: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: 13,
    color: '#7C6C5E',
  },
  tileArrow: {
    paddingRight: Spacing.lg,
    justifyContent: 'center', // Added to vertically center the arrow
  },
});
