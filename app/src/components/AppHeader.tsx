import React, {useCallback, useRef, useState} from 'react';
import {
  Animated,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useAuth} from '../context/AuthContext';
import {RootStackParamList} from '../types/navigation';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const DRAWER_WIDTH = 280;

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) {return 'Good morning';}
  if (h < 18) {return 'Good afternoon';}
  return 'Good evening';
}

interface Props {
  accentColor?: string;
}

export default function AppHeader({accentColor = '#2563EB'}: Props) {
  const navigation = useNavigation<Nav>();
  const {user, logout} = useAuth();
  const insets = useSafeAreaInsets();

  const firstName = user?.profile?.firstName ?? '';
  const lastName  = user?.profile?.lastName ?? '';
  const fullName  = [firstName, lastName].filter(Boolean).join(' ') || (user?.phone ?? 'there');
  const initial   = (firstName[0] || user?.phone?.[0] || 'U').toUpperCase();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;

  const openDrawer = useCallback(() => {
    setDrawerOpen(true);
    Animated.spring(drawerAnim, {toValue: 0, useNativeDriver: true, tension: 80, friction: 12}).start();
  }, [drawerAnim]);

  const closeDrawer = useCallback(() => {
    Animated.timing(drawerAnim, {toValue: -DRAWER_WIDTH, duration: 220, useNativeDriver: true}).start(
      () => setDrawerOpen(false),
    );
  }, [drawerAnim]);

  const goToProfile = useCallback(() => {
    closeDrawer();
    setTimeout(() => navigation.navigate('Profile'), 240);
  }, [closeDrawer, navigation]);

  const handleSignOut = useCallback(() => {
    closeDrawer();
    setTimeout(() => logout?.(), 240);
  }, [closeDrawer, logout]);

  return (
    <>
      {/* ── Header bar ───────────────────────────────────────── */}
      <View style={[styles.header, {backgroundColor: accentColor, paddingTop: insets.top + 14}]}>
        {/* Burger */}
        <TouchableOpacity style={styles.btn} onPress={openDrawer} hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
          <View style={styles.burger}>
            <View style={styles.burgerLine} />
            <View style={styles.burgerLine} />
            <View style={styles.burgerLine} />
          </View>
        </TouchableOpacity>

        {/* Greeting + name */}
        <View style={styles.center}>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.name} numberOfLines={1}>{fullName}</Text>
        </View>

        {/* Bell */}
        <TouchableOpacity
          style={styles.btn}
          onPress={() => navigation.navigate('Notifications')}
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
          <Text style={styles.bell}>🔔</Text>
        </TouchableOpacity>
      </View>

      {/* ── Slide-in drawer ──────────────────────────────────── */}
      <Modal visible={drawerOpen} transparent animationType="none" onRequestClose={closeDrawer}>
        <TouchableWithoutFeedback onPress={closeDrawer}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>

        <Animated.View style={[styles.drawer, {transform: [{translateX: drawerAnim}]}]}>
          <SafeAreaView style={{flex: 1}} edges={['top', 'bottom']}>
            {/* Drawer header */}
            <View style={[styles.drawerHeader, {backgroundColor: accentColor}]}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initial}</Text>
              </View>
              <Text style={styles.drawerName} numberOfLines={1}>{fullName}</Text>
              {user?.phone && <Text style={styles.drawerPhone}>{user.phone}</Text>}
            </View>

            {/* Items */}
            <View style={styles.items}>
              <DrawerItem icon="👤" label="My Profile" onPress={goToProfile} />
            </View>

            {/* Sign out */}
            <TouchableOpacity style={styles.signOut} onPress={handleSignOut} activeOpacity={0.8}>
              <Text style={styles.signOutIcon}>🚪</Text>
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </Animated.View>
      </Modal>
    </>
  );
}

function DrawerItem({icon, label, onPress}: {icon: string; label: string; onPress: () => void}) {
  return (
    <TouchableOpacity style={di.row} onPress={onPress} activeOpacity={0.7}>
      <Text style={di.icon}>{icon}</Text>
      <Text style={di.label}>{label}</Text>
      <Text style={di.arrow}>›</Text>
    </TouchableOpacity>
  );
}

const di = StyleSheet.create({
  row:   {flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#F3F4F6'},
  icon:  {fontSize: 18, marginRight: 14, width: 24, textAlign: 'center'},
  label: {flex: 1, fontSize: 15, fontWeight: '600', color: '#111827'},
  arrow: {fontSize: 20, color: '#9CA3AF', fontWeight: '300'},
});

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingBottom: 20, gap: 12,
  },
  btn:        {width: 40, height: 40, alignItems: 'center', justifyContent: 'center'},
  center:     {flex: 1},
  greeting:   {fontSize: 13, color: '#BFDBFE', fontWeight: '500'},
  name:       {fontSize: 20, fontWeight: '700', color: '#FFFFFF'},
  bell:       {fontSize: 22},
  burger:     {gap: 5},
  burgerLine: {width: 22, height: 2.5, borderRadius: 2, backgroundColor: '#FFFFFF'},

  overlay: {...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)'},
  drawer: {
    position: 'absolute', top: 0, left: 0, bottom: 0, width: DRAWER_WIDTH,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000', shadowOffset: {width: 4, height: 0}, shadowOpacity: 0.15, shadowRadius: 16, elevation: 20,
  },
  drawerHeader: {paddingHorizontal: 20, paddingTop: 24, paddingBottom: 28},
  avatar:       {width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center', marginBottom: 12},
  avatarText:   {fontSize: 22, fontWeight: '700', color: '#FFFFFF'},
  drawerName:   {fontSize: 17, fontWeight: '700', color: '#FFFFFF', marginBottom: 2},
  drawerPhone:  {fontSize: 13, color: '#BFDBFE'},
  items:        {flex: 1, paddingTop: 8},
  signOut:      {flexDirection: 'row', alignItems: 'center', paddingVertical: 18, paddingHorizontal: 20, borderTopWidth: 1, borderTopColor: '#F3F4F6'},
  signOutIcon:  {fontSize: 18, marginRight: 14, width: 24, textAlign: 'center'},
  signOutText:  {fontSize: 15, fontWeight: '600', color: '#DC2626'},
});
