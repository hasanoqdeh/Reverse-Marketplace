import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

export default function MyBidsScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>My Bids</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.icon}>⊙</Text>
        <Text style={styles.name}>My Bids</Text>
        <Text style={styles.soon}>Coming Soon</Text>
        <Text style={styles.desc}>
          Track all your submitted bids, monitor their status, and manage your offers — all in one place.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: '#F9FAFB'},
  header: {
    backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
  },
  title: {fontSize: 22, fontWeight: '700', color: '#111827'},
  body: {flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32},
  icon: {fontSize: 60, marginBottom: 20, color: '#9CA3AF'},
  name: {fontSize: 22, fontWeight: '700', color: '#374151', marginBottom: 8},
  soon: {fontSize: 16, fontWeight: '600', color: '#16A34A', marginBottom: 16},
  desc: {fontSize: 14, color: '#9CA3AF', textAlign: 'center', lineHeight: 22},
});
