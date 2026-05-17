import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../../types/navigation';
import {MarketRequest} from '../../../types/api';
import {searchRequests} from '../../../api/requests';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const ACCENT = '#16A34A';

type SortOption = {label: string; field: string; order: string};
const SORT_OPTIONS: SortOption[] = [
  {label: 'Newest', field: 'created_at', order: 'desc'},
  {label: 'Highest Budget', field: 'budget_max', order: 'desc'},
  {label: 'Expiring Soon', field: 'expires_at', order: 'asc'},
];

function formatBudget(min?: number | null, max?: number | null): string {
  if (!min && !max) return 'Open budget';
  if (min && max) return `$${min.toLocaleString()} – $${max.toLocaleString()}`;
  if (max) return `Up to $${max.toLocaleString()}`;
  return `From $${min!.toLocaleString()}`;
}

function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function daysLeft(iso?: string | null): string | null {
  if (!iso) return null;
  const d = Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);
  if (d <= 0) return 'Expired';
  if (d === 1) return '1 day left';
  return `${d} days left`;
}

function RequestCard({item, onPress}: {item: MarketRequest; onPress: () => void}) {
  const expiry = daysLeft(item.expiresAt);
  const urgent = expiry && parseInt(expiry) <= 1;

  return (
    <TouchableOpacity style={card.wrap} onPress={onPress} activeOpacity={0.7}>
      <View style={card.header}>
        {item.category && (
          <View style={card.categoryBadge}>
            <Text style={card.categoryText}>{item.category.name}</Text>
          </View>
        )}
        {expiry && (
          <Text style={[card.expiry, urgent && card.expiryUrgent]}>{expiry}</Text>
        )}
      </View>

      <Text style={card.title} numberOfLines={2}>{item.title}</Text>
      <Text style={card.description} numberOfLines={2}>{item.description}</Text>

      <View style={card.footer}>
        <Text style={card.budget}>{formatBudget(item.budgetMin, item.budgetMax)}</Text>
        <View style={card.footerRight}>
          <Text style={card.bids}>
            {item.bidCount > 0 ? `${item.bidCount} bid${item.bidCount !== 1 ? 's' : ''}` : 'No bids yet'}
          </Text>
          <Text style={card.time}>{timeAgo(item.createdAt)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function BrowseRequestsScreen() {
  const navigation = useNavigation<Nav>();

  const [requests, setRequests] = useState<MarketRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sortIdx, setSortIdx] = useState(0);
  const [search, setSearch] = useState('');

  const fetchData = useCallback(async (p: number, sort: number, refresh = false) => {
    const {field, order} = SORT_OPTIONS[sort];
    try {
      const res = await searchRequests({
        status: 'ACTIVE,HAS_BIDS',
        page: p,
        limit: 20,
        sortBy: field,
        sortOrder: order,
      });
      setRequests(prev => (p === 1 ? res.requests : [...prev, ...res.requests]));
      setHasMore(p < res.pagination.totalPages);
    } catch {
      // silently ignore
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
    fetchData(1, sortIdx);
  }, [sortIdx, fetchData]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    fetchData(1, sortIdx, true);
  }, [sortIdx, fetchData]);

  const handleLoadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    const next = page + 1;
    setLoadingMore(true);
    setPage(next);
    fetchData(next, sortIdx);
  }, [loadingMore, hasMore, page, sortIdx, fetchData]);

  const displayedRequests = search.trim()
    ? requests.filter(r =>
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.description.toLowerCase().includes(search.toLowerCase()),
      )
    : requests;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Available Requests</Text>
        <Text style={styles.subtitle}>Browse and bid on buyer requests</Text>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search requests…"
          placeholderTextColor="#9CA3AF"
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')} hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
            <Text style={styles.clearBtn}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Sort chips */}
      <View style={styles.sortBar}>
        {SORT_OPTIONS.map((opt, i) => (
          <TouchableOpacity
            key={opt.label}
            style={[styles.sortChip, sortIdx === i && styles.sortChipActive]}
            onPress={() => setSortIdx(i)}
            activeOpacity={0.7}>
            <Text style={[styles.sortChipText, sortIdx === i && styles.sortChipTextActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={ACCENT} />
        </View>
      ) : (
        <FlatList
          data={displayedRequests}
          keyExtractor={item => item.id}
          contentContainerStyle={{padding: 14, paddingBottom: 32, flexGrow: 1}}
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
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyTitle}>
                {search ? 'No matching requests' : 'No requests available'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {search ? 'Try a different search term.' : 'Pull down to refresh.'}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const card = StyleSheet.create({
  wrap: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  header: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8},
  categoryBadge: {backgroundColor: '#DCFCE7', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3},
  categoryText: {fontSize: 12, fontWeight: '600', color: ACCENT},
  expiry: {fontSize: 11, color: '#D97706', fontWeight: '600'},
  expiryUrgent: {color: '#DC2626'},
  title: {fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 4, lineHeight: 22},
  description: {fontSize: 13, color: '#6B7280', marginBottom: 12, lineHeight: 19},
  footer: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  budget: {fontSize: 15, fontWeight: '700', color: ACCENT},
  footerRight: {alignItems: 'flex-end'},
  bids: {fontSize: 12, fontWeight: '600', color: '#374151'},
  time: {fontSize: 11, color: '#9CA3AF'},
});

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: '#F9FAFB'},
  header: {
    backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
  },
  title: {fontSize: 22, fontWeight: '700', color: '#111827'},
  subtitle: {fontSize: 13, color: '#6B7280', marginTop: 2},
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF',
    marginHorizontal: 14, marginTop: 12, marginBottom: 4,
    borderRadius: 12, paddingHorizontal: 12, borderWidth: 1, borderColor: '#E5E7EB',
  },
  searchIcon: {fontSize: 16, marginRight: 6},
  searchInput: {flex: 1, fontSize: 15, color: '#111827', paddingVertical: 10},
  clearBtn: {fontSize: 14, color: '#9CA3AF', paddingLeft: 8},
  sortBar: {
    flexDirection: 'row', paddingHorizontal: 14, paddingVertical: 8, gap: 8,
    backgroundColor: '#F9FAFB',
  },
  sortChip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB',
  },
  sortChipActive: {backgroundColor: '#DCFCE7', borderColor: ACCENT},
  sortChipText: {fontSize: 12, fontWeight: '500', color: '#6B7280'},
  sortChipTextActive: {color: ACCENT, fontWeight: '700'},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  empty: {flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, paddingTop: 80},
  emptyIcon: {fontSize: 52, marginBottom: 16},
  emptyTitle: {fontSize: 18, fontWeight: '700', color: '#374151', marginBottom: 8},
  emptySubtitle: {fontSize: 14, color: '#9CA3AF', textAlign: 'center', lineHeight: 22},
});
