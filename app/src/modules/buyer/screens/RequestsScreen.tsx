import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../../types/navigation';
import {MarketRequest, RequestStatus} from '../../../types/api';
import {getMyRequests} from '../../../api/requests';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const ACCENT = '#2563EB';

type Tab = {label: string; status: string | null};
const TABS: Tab[] = [
  {label: 'All', status: null},
  {label: 'Active', status: 'ACTIVE,HAS_BIDS'},
  {label: 'Draft', status: 'DRAFT'},
  {label: 'Completed', status: 'COMPLETED'},
  {label: 'Closed', status: 'CANCELLED,EXPIRED'},
];

const STATUS_META: Record<RequestStatus, {label: string; color: string}> = {
  DRAFT: {label: 'Draft', color: '#6B7280'},
  ACTIVE: {label: 'Active', color: '#16A34A'},
  HAS_BIDS: {label: 'Has Bids', color: '#2563EB'},
  COMPLETED: {label: 'Completed', color: '#15803D'},
  CANCELLED: {label: 'Cancelled', color: '#DC2626'},
  EXPIRED: {label: 'Expired', color: '#D97706'},
};

function formatBudget(min?: number | null, max?: number | null): string {
  if (!min && !max) return 'Open budget';
  if (max) return `Up to $${max.toLocaleString()}`;
  return `From $${min!.toLocaleString()}`;
}

function RequestCard({item, onPress}: {item: MarketRequest; onPress: () => void}) {
  const meta = STATUS_META[item.status] ?? STATUS_META.ACTIVE;
  const daysLeft = item.expiresAt
    ? Math.max(0, Math.ceil((new Date(item.expiresAt).getTime() - Date.now()) / 86400000))
    : null;

  return (
    <TouchableOpacity style={card.wrap} onPress={onPress} activeOpacity={0.7}>
      <View style={card.top}>
        <Text style={[card.status, {color: meta.color}]}>{meta.label}</Text>
        {item.category && <Text style={card.category}>{item.category.name}</Text>}
      </View>
      <Text style={card.title} numberOfLines={2}>{item.title}</Text>
      <View style={card.footer}>
        <Text style={card.budget}>{formatBudget(item.budgetMin, item.budgetMax)}</Text>
        <View style={card.metaRow}>
          <Text style={card.metaText}>{item.bidCount} bids</Text>
          {daysLeft !== null && item.status === 'ACTIVE' && (
            <Text style={[card.metaText, daysLeft <= 1 && {color: '#DC2626'}]}>
              {daysLeft === 0 ? 'Expires today' : `${daysLeft}d left`}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function RequestsScreen() {
  const navigation = useNavigation<Nav>();
  const [activeTab, setActiveTab] = useState(0);
  const [requests, setRequests] = useState<MarketRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchRequests = useCallback(async (p: number, tab: number, refresh = false) => {
    const status = TABS[tab].status ?? undefined;
    try {
      const res = await getMyRequests({status: status ?? undefined, page: p, limit: 20});
      const newItems = res.requests;
      setRequests(prev => (p === 1 ? newItems : [...prev, ...newItems]));
      setHasMore(p < res.pagination.totalPages);
    } catch {
      // silently ignore — list stays empty
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    setPage(1);
    setHasMore(true);
    fetchRequests(1, activeTab);
  }, [activeTab, fetchRequests]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    fetchRequests(1, activeTab, true);
  }, [activeTab, fetchRequests]);

  const handleLoadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    const next = page + 1;
    setLoadingMore(true);
    setPage(next);
    fetchRequests(next, activeTab);
  }, [loadingMore, hasMore, page, activeTab, fetchRequests]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Requests</Text>
        <TouchableOpacity
          style={styles.newBtn}
          onPress={() => navigation.navigate('CreateRequest')}
          activeOpacity={0.8}>
          <Text style={styles.newBtnText}>+ New</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabBarWrap}>
        <FlatList
          data={TABS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_item, i) => String(i)}
          contentContainerStyle={styles.tabBar}
          renderItem={({item: tab, index}) => (
            <TouchableOpacity
              style={[styles.tab, activeTab === index && styles.tabActive]}
              onPress={() => setActiveTab(index)}
              activeOpacity={0.7}>
              <Text style={[styles.tabText, activeTab === index && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={ACCENT} />
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={item => item.id}
          contentContainerStyle={{padding: 16, paddingBottom: 32, flexGrow: 1}}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={ACCENT} colors={[ACCENT]} />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            loadingMore ? <ActivityIndicator style={{marginVertical: 16}} color={ACCENT} /> : null
          }
          renderItem={({item}) => (
            <RequestCard
              item={item}
              onPress={() => navigation.navigate('RequestDetail', {requestId: item.id})}
            />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>📦</Text>
              <Text style={styles.emptyTitle}>No requests yet</Text>
              <Text style={styles.emptySubtitle}>Post your first request and let merchants bid.</Text>
              <TouchableOpacity
                style={styles.emptyBtn}
                onPress={() => navigation.navigate('CreateRequest')}
                activeOpacity={0.8}>
                <Text style={styles.emptyBtnText}>Post a Request</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const card = StyleSheet.create({
  wrap: {
    backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  top: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6},
  status: {fontSize: 12, fontWeight: '700'},
  category: {fontSize: 12, color: '#6B7280', backgroundColor: '#F3F4F6', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8},
  title: {fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10, lineHeight: 22},
  footer: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  budget: {fontSize: 14, fontWeight: '600', color: ACCENT},
  metaRow: {flexDirection: 'row', gap: 10},
  metaText: {fontSize: 12, color: '#9CA3AF'},
});

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: '#F3F4F6'},
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
  },
  headerTitle: {fontSize: 20, fontWeight: '700', color: '#111827'},
  newBtn: {backgroundColor: ACCENT, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6},
  newBtnText: {fontSize: 13, fontWeight: '700', color: '#FFFFFF'},
  tabBarWrap: {backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB'},
  tabBar: {paddingHorizontal: 12, paddingVertical: 8, gap: 6},
  tab: {paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: '#F3F4F6'},
  tabActive: {backgroundColor: '#DBEAFE'},
  tabText: {fontSize: 13, fontWeight: '500', color: '#6B7280'},
  tabTextActive: {color: ACCENT, fontWeight: '700'},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  empty: {flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 80},
  emptyIcon: {fontSize: 52, marginBottom: 16},
  emptyTitle: {fontSize: 18, fontWeight: '700', color: '#374151', marginBottom: 8},
  emptySubtitle: {fontSize: 14, color: '#9CA3AF', textAlign: 'center', marginBottom: 20},
  emptyBtn: {backgroundColor: ACCENT, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 12},
  emptyBtnText: {fontSize: 14, fontWeight: '700', color: '#FFFFFF'},
});
