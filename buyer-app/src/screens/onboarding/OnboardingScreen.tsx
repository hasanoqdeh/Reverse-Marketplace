import React, {useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ViewToken,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../types/navigation';

const {width, height} = Dimensions.get('window');

type OnboardingNavProp = NativeStackNavigationProp<
  RootStackParamList,
  'Onboarding'
>;

const SLIDES = [
  {
    id: '1',
    emoji: '📝',
    title: 'Post Your Request',
    description:
      'Tell us what you need. From products to services — describe it and let merchants come to you.',
    bg: '#EFF6FF',
    accent: '#2563EB',
    circleBg: '#DBEAFE',
  },
  {
    id: '2',
    emoji: '💰',
    title: 'Get the Best Offers',
    description:
      'Merchants compete for your business by sending their best quotes directly to you.',
    bg: '#F0FDF4',
    accent: '#16A34A',
    circleBg: '#DCFCE7',
  },
  {
    id: '3',
    emoji: '✅',
    title: 'Choose & Buy',
    description:
      'Compare offers, chat with merchants, and pick the deal that works best for you.',
    bg: '#FFF7ED',
    accent: '#EA580C',
    circleBg: '#FED7AA',
  },
];

export default function OnboardingScreen() {
  const navigation = useNavigation<OnboardingNavProp>();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const finish = async () => {
    await AsyncStorage.setItem('onboardingSeen', 'true');
    navigation.reset({index: 0, routes: [{name: 'Auth'}]});
  };

  const handleNext = () => {
    if (activeIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({index: activeIndex + 1, animated: true});
    } else {
      finish();
    }
  };

  const onViewableItemsChanged = useRef(
    ({viewableItems}: {viewableItems: ViewToken[]}) => {
      if (viewableItems.length > 0) {
        setActiveIndex(viewableItems[0].index ?? 0);
      }
    },
  ).current;

  const active = SLIDES[activeIndex];
  const isLast = activeIndex === SLIDES.length - 1;

  return (
    <SafeAreaView style={styles.container}>
      {/* Skip */}
      {!isLast && (
        <TouchableOpacity style={styles.skipBtn} onPress={finish} activeOpacity={0.7}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{viewAreaCoveragePercentThreshold: 50}}
        renderItem={({item}) => (
          <View style={[styles.slide, {width}]}>
            {/* Illustration */}
            <View style={[styles.illustrationArea, {backgroundColor: item.bg}]}>
              <View style={[styles.decorCircleLg, {backgroundColor: item.accent, opacity: 0.08}]} />
              <View style={[styles.decorCircleSm, {backgroundColor: item.accent, opacity: 0.12}]} />
              <View style={[styles.emojiCircle, {backgroundColor: item.circleBg}]}>
                <Text style={styles.emoji}>{item.emoji}</Text>
              </View>
            </View>

            {/* Text */}
            <View style={styles.textArea}>
              <Text style={[styles.slideTitle, {color: item.accent}]}>
                {item.title}
              </Text>
              <Text style={styles.slideDesc}>{item.description}</Text>
            </View>
          </View>
        )}
      />

      {/* Controls */}
      <View style={styles.controls}>
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dotBase,
                i === activeIndex
                  ? [styles.dotActive, {backgroundColor: active.accent}]
                  : styles.dotInactive,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.nextBtn, {backgroundColor: active.accent}]}
          onPress={handleNext}
          activeOpacity={0.85}>
          <Text style={styles.nextBtnText}>
            {isLast ? 'Get Started' : 'Next →'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const ILLUSTRATION_HEIGHT = height * 0.52;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  skipBtn: {
    position: 'absolute',
    top: 52,
    right: 24,
    zIndex: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  skipText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  slide: {
    flex: 1,
  },
  illustrationArea: {
    height: ILLUSTRATION_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  decorCircleLg: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    bottom: -80,
    right: -60,
  },
  decorCircleSm: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    top: 20,
    left: -40,
  },
  emojiCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  emoji: {
    fontSize: 80,
  },
  textArea: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 32,
    alignItems: 'center',
  },
  slideTitle: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 14,
    letterSpacing: -0.3,
  },
  slideDesc: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 25,
  },
  controls: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    paddingTop: 8,
    alignItems: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dotBase: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  dotActive: {
    width: 28,
  },
  dotInactive: {
    width: 8,
    backgroundColor: '#E5E7EB',
  },
  nextBtn: {
    width: '100%',
    paddingVertical: 17,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  nextBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
