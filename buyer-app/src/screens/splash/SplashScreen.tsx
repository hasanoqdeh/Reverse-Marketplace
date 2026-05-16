import React, {useEffect, useRef, useState} from 'react';
import {Animated, View, Text, StyleSheet} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useAuth} from '../../context/AuthContext';
import {RootStackParamList} from '../../types/navigation';

type SplashNavProp = NativeStackNavigationProp<RootStackParamList, 'Splash'>;

const MIN_SPLASH_MS = 2000;

export default function SplashScreen() {
  const navigation = useNavigation<SplashNavProp>();
  const {isAuthenticated, isLoading} = useAuth();
  const [timerDone, setTimerDone] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.75)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 80,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  useEffect(() => {
    const t = setTimeout(() => setTimerDone(true), MIN_SPLASH_MS);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!timerDone || isLoading) {
      return;
    }
    AsyncStorage.getItem('onboardingSeen').then(seen => {
      if (!seen) {
        navigation.reset({index: 0, routes: [{name: 'Onboarding'}]});
      } else if (isAuthenticated) {
        navigation.reset({index: 0, routes: [{name: 'App'}]});
      } else {
        navigation.reset({index: 0, routes: [{name: 'Auth'}]});
      }
    });
  }, [timerDone, isLoading, isAuthenticated, navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.topDecor} />
      <Animated.View
        style={[
          styles.content,
          {opacity: fadeAnim, transform: [{scale: scaleAnim}]},
        ]}>
        <View style={styles.logoRing}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoLetter}>M</Text>
          </View>
        </View>
        <Text style={styles.appName}>Marketplace</Text>
        <Text style={styles.tagline}>Your requests, their best offers</Text>
      </Animated.View>
      <Animated.View style={[styles.loadingDots, {opacity: fadeAnim}]}>
        <View style={styles.dot} />
        <View style={[styles.dot, styles.dotMid]} />
        <View style={styles.dot} />
      </Animated.View>
      <View style={styles.bottomDecor} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E3A8A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topDecor: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  bottomDecor: {
    position: 'absolute',
    bottom: -100,
    left: -60,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  content: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logoRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 12,
  },
  logoLetter: {
    fontSize: 44,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  appName: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  tagline: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 0.2,
  },
  loadingDots: {
    position: 'absolute',
    bottom: 64,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  dotMid: {
    width: 6,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.7)',
    marginHorizontal: 6,
  },
});
