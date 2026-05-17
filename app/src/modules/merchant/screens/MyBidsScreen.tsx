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
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../../types/navigation';
import {Bid} from '../../../types/api';
import {getMyBids} from '../../../api/bids';
import AppHeader from '../../../components/AppHeader';

type RootNav = NativeStackNavigationProp<RootStackParamList>;

const ACCENT = '#16A34A';

const STATUS_META: Record<string, {label: string; bg: string; text: string}> = {
  PENDING:   {label: 'Pending',   bg: '#FEF9C3', text: '#854D0E'},
  ACCEPTED:  {label: 'Accepted',  bg: '#DCFCE7', text: '#15803D'},
  REJECTED:  {label: 'Rejected',  bg: '#FEF2F2', text: '#B91C1C'},
  EXPIRED:   {label: 'Expired',   bg: '#FEF3C7', text: '#B45309'},
  WITHDRAWN: {label: 'Withdrawn', bg: '#F3F4F6', text: '#6B7280'},
};

const FILTERS: {label: string; value: string | undefined}[] = [
  {label: 'All',      value: undefined},
  {label: 'Pending',  value: 'PENDING'},
  {label: 'Accepted', value: 'ACCEPTED'},
  {label: 'Rejected', value: 'REJECTED'},
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {month: 'short', day: 'numeric'});
}

function BidRow({bid, onPress}: {bid: Bid; onPress: () => void}) {
  const meta = STATUS_META[bid.status] ?? STATUS_META.PENDING;
  return (
    <TouchableOpacity style={row.wrap} onPress={onPress} activeOpacity={0.75}>
      <View style={row.left}>
        <Text style={row.amount}>${parseFloat(bid.amount).toFixed(2)}</Text>
        <Text style={row.delivery} numberOfLines={1}>
          {bid.deliveryDays} day{bid.deliveryDays !== 1 ? 's' : ''} delivery
        </Text>
        <Text style={row.date}>{formatDate(bid.createdAt)}</Text>
      </View>
      <View style={[row.badge, {backgroundColor: meta.bg}]}>
        <Text style={[row.badgeText, {color: meta.text}]}>{meta.label}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function MyBidsScreen() {
  const navigation = useNavigation<RootNav>();

  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | undefined>(undefined);
  const [total, setTotal] = useState(0);

  const load = useCallback(async (refresh = false) => {
    try {
      const res = await getMyBids({status: activeFilter, limit: 50});
      setBids(res.bids);
      setTotal(res.pagination.total);
    } catch {
      // silently ignore on refresh; initial error leaves empty state
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    load(true);
  }, [load]);

  return (
    <View style={styles.safe}>
      <AppHeader accentColor={ACCENT} />

      {/* Filter tabs */}
      <View style={styles.filterBar}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.label}
            style={[styles.filterTab, activeFilter === f.value && styles.filterTabActive]}
            onPress={() => setActiveFilter(f.value)}
            activeOpacity={0.7}>
            <Text style={[styles.filterText, activeFilter === f.value && styles.filterTextActive]}>
              {f.label}
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
          data={bids}
          keyExtractor={item => item.id}
          contentContainerStyle={{padding: 14, paddingBottom: 40, flexGrow: 1}}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={ACCENT} colors={[ACCENT]} />
          }
          renderItem={({item}) => (
            <BidRow
              bid={item}
              onPress={() => navigation.navigate('BidDetail', {bidId: item.id})}
            />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyTitle}>No bids yet</Text>
              <Text style={styles.emptySubtitle}>
                {activeFilter
                  ? `No ${activeFilter.toLowerCase()} bids. Try a different filter.`
                  : 'Browse requests and submit your first bid.'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const row = StyleSheet.create({
  wrap: {
    backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, marginBottom: 10,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  left: {flex: 1},
  amount: {fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 2},
  delivery: {fontSize: 13, color: '#6B7280', marginBottom: 2},
  date: {fontSize: 11, color: '#9CA3AF'},
  badge: {borderRadius: 16, paddingHorizontal: 10, paddingVertical: 5, marginLeft: 12},
  badgeText: {fontSize: 12, fontWeight: '700'},
});

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: '#F9FAFB'},
  filterBar: {
    flexDirection: 'row', backgroundColor: '#FFFFFF', paddingHorizontal: 14, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: '#E5E7EB', gap: 8,
  },
  filterTab: {
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7,
    backgroundColor: '#F3F4F6',
  },
  filterTabActive: {backgroundColor: '#DCFCE7'},
  filterText: {fontSize: 13, fontWeight: '600', color: '#6B7280'},
  filterTextActive: {color: ACCENT},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  empty: {flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 80},
  emptyIcon: {fontSize: 52, marginBottom: 16},
  emptyTitle: {fontSize: 18, fontWeight: '700', color: '#374151', marginBottom: 8},
  emptySubtitle: {fontSize: 14, color: '#9CA3AF', textAlign: 'center', lineHeight: 22, paddingHorizontal: 24},
});
