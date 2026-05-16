import React, {useState} from 'react';
import {View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

const ACCENT = '#16A34A';
const FILTERS = ['All', 'Near Me', 'My Category'] as const;
type FilterType = (typeof FILTERS)[number];

export default function BrowseRequestsScreen() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [refreshing, setRefreshing] = useState(false);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Available Requests</Text>
        <Text style={styles.subtitle}>Browse and bid on buyer requests</Text>
      </View>

      <View style={styles.filterBar}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.chip, activeFilter === f && styles.chipActive]}
            onPress={() => setActiveFilter(f)}
            activeOpacity={0.7}>
            <Text style={[styles.chipText, activeFilter === f && styles.chipTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={[]}
        keyExtractor={() => 'empty'}
        renderItem={() => null}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 800); }}
            tintColor={ACCENT}
            colors={[ACCENT]}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>No requests available</Text>
            <Text style={styles.emptySubtitle}>No requests at this time.{'\n'}Pull down to refresh.</Text>
          </View>
        }
        contentContainerStyle={{flexGrow: 1}}
      />
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
  subtitle: {fontSize: 13, color: '#6B7280', marginTop: 2},
  filterBar: {
    flexDirection: 'row', backgroundColor: '#FFFFFF', paddingHorizontal: 16,
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#E5E7EB', gap: 8,
  },
  chip: {paddingVertical: 6, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB'},
  chipActive: {backgroundColor: '#DCFCE7', borderColor: ACCENT},
  chipText: {fontSize: 13, fontWeight: '500', color: '#6B7280'},
  chipTextActive: {color: ACCENT, fontWeight: '700'},
  empty: {flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, paddingTop: 80},
  emptyIcon: {fontSize: 56, marginBottom: 20},
  emptyTitle: {fontSize: 18, fontWeight: '700', color: '#374151', marginBottom: 10},
  emptySubtitle: {fontSize: 14, color: '#9CA3AF', textAlign: 'center', lineHeight: 22},
});
