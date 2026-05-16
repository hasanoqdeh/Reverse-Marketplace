import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

export default function RequestsScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Requests</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.icon}>📦</Text>
        <Text style={styles.title}>My Requests</Text>
        <Text style={styles.subtitle}>Coming Soon</Text>
        <Text style={styles.description}>
          You'll be able to view and manage all your purchase requests here.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: '#F3F4F6'},
  header: {
    backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
  },
  headerTitle: {fontSize: 20, fontWeight: '700', color: '#111827'},
  body: {flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32},
  icon: {fontSize: 56, marginBottom: 16},
  title: {fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 8},
  subtitle: {fontSize: 16, fontWeight: '500', color: '#2563EB', marginBottom: 12},
  description: {fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 22},
});
