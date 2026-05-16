import React from 'react';
import {View, Text, ScrollView, TouchableOpacity, StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {MerchantTabParamList} from '../../../types/navigation';
import {useAuth} from '../../../context/AuthContext';

type Props = {navigation: BottomTabNavigationProp<MerchantTabParamList, 'Dashboard'>};

const ACCENT = '#16A34A';

function StatCard({label, value, accent = '#111827'}: {label: string; value: string; accent?: string}) {
  return (
    <View style={styles.statCard}>
      <Text style={[styles.statValue, {color: accent}]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function DashboardScreen({navigation}: Props) {
  const {user} = useAuth();
  const firstName = user?.profile?.firstName ?? 'Merchant';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header card */}
        <View style={styles.headerCard}>
          <View>
            <Text style={styles.greeting}>Hello, {firstName}</Text>
            <Text style={styles.phone}>{user?.phone}</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{firstName[0].toUpperCase()}</Text>
          </View>
        </View>

        {/* Stats */}
        <Text style={styles.section}>Overview</Text>
        <View style={styles.statsRow}>
          <StatCard label="Active Bids" value="0" accent={ACCENT} />
          <StatCard label="Won This Month" value="0" accent="#2563EB" />
          <StatCard label="Rating" value="N/A" accent="#D97706" />
        </View>

        {/* Quick action */}
        <Text style={styles.section}>Quick Actions</Text>
        <TouchableOpacity style={styles.actionCard} activeOpacity={0.8} onPress={() => navigation.navigate('Requests')}>
          <View style={styles.actionIcon}>
            <Text style={styles.actionIconText}>☰</Text>
          </View>
          <View style={styles.actionBody}>
            <Text style={styles.actionTitle}>Browse Requests</Text>
            <Text style={styles.actionSubtitle}>Find buyer requests that match your business</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        {/* Recent bids */}
        <Text style={styles.section}>My Recent Bids</Text>
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>⊙</Text>
          <Text style={styles.emptyTitle}>No bids yet</Text>
          <Text style={styles.emptySubtitle}>Browse available requests and submit your first bid.</Text>
          <TouchableOpacity style={styles.emptyBtn} activeOpacity={0.8} onPress={() => navigation.navigate('Requests')}>
            <Text style={styles.emptyBtnText}>Browse Requests</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: '#F9FAFB'},
  content: {padding: 20, paddingBottom: 32},
  headerCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 24,
    shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  greeting: {fontSize: 20, fontWeight: '700', color: '#111827'},
  phone: {fontSize: 13, color: '#6B7280', marginTop: 2},
  avatar: {width: 44, height: 44, borderRadius: 22, backgroundColor: ACCENT, alignItems: 'center', justifyContent: 'center'},
  avatarText: {fontSize: 20, fontWeight: '700', color: '#FFFFFF'},
  section: {fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12, marginTop: 4},
  statsRow: {flexDirection: 'row', gap: 10, marginBottom: 24},
  statCard: {
    flex: 1, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, alignItems: 'center',
    shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  statValue: {fontSize: 22, fontWeight: '700', marginBottom: 4},
  statLabel: {fontSize: 11, color: '#6B7280', textAlign: 'center'},
  actionCard: {
    backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, flexDirection: 'row',
    alignItems: 'center', marginBottom: 24,
    shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  actionIcon: {width: 44, height: 44, borderRadius: 12, backgroundColor: '#DCFCE7', alignItems: 'center', justifyContent: 'center', marginRight: 14},
  actionIconText: {fontSize: 20},
  actionBody: {flex: 1},
  actionTitle: {fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 2},
  actionSubtitle: {fontSize: 12, color: '#6B7280', lineHeight: 17},
  chevron: {fontSize: 22, color: '#9CA3AF'},
  emptyCard: {
    backgroundColor: '#FFFFFF', borderRadius: 14, padding: 28, alignItems: 'center',
    shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  emptyIcon: {fontSize: 40, marginBottom: 12},
  emptyTitle: {fontSize: 17, fontWeight: '700', color: '#374151', marginBottom: 8},
  emptySubtitle: {fontSize: 13, color: '#6B7280', textAlign: 'center', lineHeight: 19, marginBottom: 20},
  emptyBtn: {backgroundColor: ACCENT, borderRadius: 8, paddingVertical: 10, paddingHorizontal: 24},
  emptyBtnText: {fontSize: 14, fontWeight: '700', color: '#FFFFFF'},
});
