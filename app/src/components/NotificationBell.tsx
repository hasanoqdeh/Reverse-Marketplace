import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Svg, {Path} from 'react-native-svg';
import {useNotificationBadge} from '../context/NotificationBadgeContext';

// Material Design "notifications" icon — 24×24 viewBox
const BELL_PATH =
  'M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5' +
  'c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5' +
  's-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z';

interface Props {
  size?: number;
  color?: string;
}

export default function NotificationBell({size = 24, color = '#FFFFFF'}: Props) {
  const {unreadCount} = useNotificationBadge();
  const label = unreadCount > 99 ? '99+' : String(unreadCount);
  const wide  = unreadCount > 9;

  return (
    <View style={{width: size, height: size}}>
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path d={BELL_PATH} fill={color} />
      </Svg>

      {unreadCount > 0 && (
        <View style={[b.wrap, wide && b.wrapWide]}>
          <Text style={b.text} numberOfLines={1}>{label}</Text>
        </View>
      )}
    </View>
  );
}

const b = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: -5,
    right: -6,
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  wrapWide: {
    minWidth: 22,
    borderRadius: 9,
  },
  text: {
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: -0.3,
    lineHeight: 12,
  },
});
