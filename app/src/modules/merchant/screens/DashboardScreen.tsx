import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {MerchantTabParamList} from '../../../types/navigation';
import {RootStackParamList} from '../../../types/navigation';
import {useAuth} from '../../../context/AuthContext';
import {MarketRequest} from '../../../types/api';
import {searchRequests} from '../../../api/requests';
import {getMyBids} from '../../../api/bids';

type TabNav = BottomTabNavigationProp<MerchantTabParamList, 'Dashboard'>;
type RootNav = NativeStackNavigationProp<RootStackParamList>;

const ACCENT = '#16A34A';

function StatCard({label, value, color = '#111827'}: {label: string; value: string; color?: string}) {
  return (
    <View style={styles.statCard}>
      <Text style={[styles.statValue, {color}]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function formatBudget(min?: number | null, max?: number | null): string {
  if (!min && !max) return 'Open';
  if (max) return `$${max.toLocaleString()}`;
  return `$${min!.toLocaleString()}+`;
}

export default function DashboardScreen() {
  const tabNavigation = useNavigation<TabNav>();
  const rootNavigation = useNavigation<RootNav>();
  const {user} = useAuth();
  const firstName = user?.profile?.firstName ?? 'Merchant';

  const [recentRequests, setRecentRequests] = useState<MarketRequest[]>([]);
  const [totalActive, setTotalActive] = useState<number | null>(null);
  const [activeBidCount, setActiveBidCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboard = useCallback(async () => {
    try {
      const [reqRes, bidsRes] = await Promise.allSettled([
        searchRequests({status: 'ACTIVE,HAS_BIDS', page: 1, limit: 5, sortBy: 'created_at', sortOrder: 'desc'}),
        getMyBids({status: 'PENDING', limit: 1}),
      ]);
      if (reqRes.status === 'fulfilled') {
        setRecentRequests(reqRes.value.requests);
        setTotalActive(reqRes.value.pagination.total);
      }
      if (bidsRes.status === 'fulfilled') {
        setActiveBidCount(bidsRes.value.pagination.total);
      }
    } catch {
      // silently ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadDashboard();
  }, [loadDashboard]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={ACCENT} colors={[ACCENT]} />
        }>
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
        <Text style={styles.section}>Marketplace Overview</Text>
        <View style={styles.statsRow}>
          <StatCard
            label="Open Requests"
            value={totalActive === null ? '…' : String(totalActive)}
            color={ACCENT}
          />
          <StatCard label="My Active Bids" value={activeBidCount === null ? '…' : String(activeBidCount)} color="#2563EB" />
          <StatCard label="Won This Month" value="0" color="#D97706" />
        </View>

        {/* Quick action */}
        <Text style={styles.section}>Quick Actions</Text>
        <TouchableOpacity
          style={styles.actionCard}
          activeOpacity={0.8}
          onPress={() => tabNavigation.navigate('Requests')}>
          <View style={styles.actionIcon}>
            <Text style={styles.actionIconText}>☰</Text>
          </View>
          <View style={styles.actionBody}>
            <Text style={styles.actionTitle}>Browse Requests</Text>
            <Text style={styles.actionSubtitle}>Find buyer requests that match your business</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        {/* Recent requests */}
        <Text style={styles.section}>Latest Requests</Text>
        {loading ? (
          <ActivityIndicator color={ACCENT} style={{marginVertical: 24}} />
        ) : recentRequests.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>⊙</Text>
            <Text style={styles.emptyTitle}>No open requests</Text>
            <Text style={styles.emptySubtitle}>Check back soon or pull to refresh.</Text>
          </View>
        ) : (
          <>
            {recentRequests.map(req => (
              <TouchableOpacity
                key={req.id}
                style={styles.requestCard}
                onPress={() => rootNavigation.navigate('RequestDetail', {requestId: req.id})}
                activeOpacity={0.75}>
                <View style={styles.requestTop}>
                  {req.category && <Text style={styles.reqCategory}>{req.category.name}</Text>}
                  <Text style={styles.reqBudget}>{formatBudget(req.budgetMin, req.budgetMax)}</Text>
                </View>
                <Text style={styles.reqTitle} numberOfLines={1}>{req.title}</Text>
                <View style={styles.requestBottom}>
                  <Text style={styles.reqBids}>
                    {req.bidCount > 0 ? `${req.bidCount} bids` : 'No bids yet'}
                  </Text>
                  <Text style={styles.reqStatus}>
                    {req.status === 'HAS_BIDS' ? 'Has Bids' : 'Active'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.viewAllBtn}
              onPress={() => tabNavigation.navigate('Requests')}
              activeOpacity={0.8}>
              <Text style={styles.viewAllText}>View All Requests</Text>
            </TouchableOpacity>
          </>
        )}
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
  emptyIcon: {fontSize: 40, marginBottom: 12, color: '#9CA3AF'},
  emptyTitle: {fontSize: 17, fontWeight: '700', color: '#374151', marginBottom: 8},
  emptySubtitle: {fontSize: 13, color: '#6B7280', textAlign: 'center', lineHeight: 19},
  requestCard: {
    backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, marginBottom: 10,
    shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  requestTop: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4},
  reqCategory: {fontSize: 12, color: ACCENT, fontWeight: '600'},
  reqBudget: {fontSize: 14, fontWeight: '700', color: '#111827'},
  reqTitle: {fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 8},
  requestBottom: {flexDirection: 'row', justifyContent: 'space-between'},
  reqBids: {fontSize: 12, color: '#6B7280'},
  reqStatus: {fontSize: 12, color: ACCENT, fontWeight: '600'},
  viewAllBtn: {
    marginTop: 4, borderRadius: 12, borderWidth: 1.5, borderColor: ACCENT,
    paddingVertical: 12, alignItems: 'center',
  },
  viewAllText: {fontSize: 14, fontWeight: '700', color: ACCENT},
});
