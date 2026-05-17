import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../../types/navigation';
import {Bid} from '../../../types/api';
import {getRequestBids, acceptBid, rejectBid} from '../../../api/bids';
import {getMerchantProfile} from '../../../api/reviews';

type Props = NativeStackScreenProps<RootStackParamList, 'RequestBids'>;

type MerchantStats = {avgRating: number | null; reviewCount: number; completedBids: number};

const ACCENT = '#2563EB';

const STATUS_META: Record<string, {label: string; bg: string; text: string}> = {
  PENDING:   {label: 'Pending',   bg: '#FEF9C3', text: '#854D0E'},
  ACCEPTED:  {label: 'Accepted',  bg: '#DCFCE7', text: '#15803D'},
  REJECTED:  {label: 'Rejected',  bg: '#FEF2F2', text: '#B91C1C'},
  EXPIRED:   {label: 'Expired',   bg: '#FEF3C7', text: '#B45309'},
  WITHDRAWN: {label: 'Withdrawn', bg: '#F3F4F6', text: '#6B7280'},
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {month: 'short', day: 'numeric'});
}

function BidCard({
  bid,
  merchantStats,
  onAccept,
  onReject,
  onChat,
  onViewMerchant,
  actionLoading,
}: {
  bid: Bid;
  merchantStats?: MerchantStats;
  onAccept: (bid: Bid) => void;
  onReject: (bid: Bid) => void;
  onChat: (bid: Bid) => void;
  onViewMerchant: (bid: Bid) => void;
  actionLoading: string | null;
}) {
  const meta = STATUS_META[bid.status] ?? STATUS_META.PENDING;
  const isPending = bid.status === 'PENDING';
  const isActing = actionLoading === bid.id;

  return (
    <View style={card.wrap}>
      {/* Merchant reputation row */}
      <TouchableOpacity style={card.merchantRow} onPress={() => onViewMerchant(bid)} activeOpacity={0.7}>
        <View style={card.avatarCircle}>
          <Text style={card.avatarText}>{bid.merchantId.slice(0, 2).toUpperCase()}</Text>
        </View>
        <View style={card.merchantInfo}>
          <Text style={card.merchantId} numberOfLines={1}>Merchant {bid.merchantId.slice(0, 6)}…</Text>
          {merchantStats ? (
            <Text style={card.merchantStats}>
              {merchantStats.avgRating != null ? `★ ${merchantStats.avgRating.toFixed(1)}` : '★ New'}
              {'  '}({merchantStats.reviewCount})
              {'  '}✓ {merchantStats.completedBids} done
            </Text>
          ) : null}
        </View>
      </TouchableOpacity>

      <View style={card.top}>
        <View style={[card.badge, {backgroundColor: meta.bg}]}>
          <Text style={[card.badgeText, {color: meta.text}]}>{meta.label}</Text>
        </View>
        <Text style={card.date}>{formatDate(bid.createdAt)}</Text>
      </View>

      <Text style={card.amount}>${parseFloat(bid.amount).toFixed(2)}</Text>
      <Text style={card.delivery}>{bid.deliveryDays} day{bid.deliveryDays !== 1 ? 's' : ''} delivery</Text>

      {bid.deliveryNotes ? (
        <Text style={card.notes} numberOfLines={2}>{bid.deliveryNotes}</Text>
      ) : null}

      {isPending && (
        <View style={card.actions}>
          <TouchableOpacity
            style={[card.rejectBtn, isActing && card.disabledBtn]}
            onPress={() => onReject(bid)}
            disabled={!!actionLoading}
            activeOpacity={0.8}>
            {isActing ? (
              <ActivityIndicator size="small" color="#B91C1C" />
            ) : (
              <Text style={card.rejectText}>Decline</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[card.acceptBtn, isActing && card.disabledBtn]}
            onPress={() => onAccept(bid)}
            disabled={!!actionLoading}
            activeOpacity={0.8}>
            {isActing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={card.acceptText}>Accept</Text>
            )}
          </TouchableOpacity>
          {bid.chatRoomId && (
            <TouchableOpacity
              style={card.chatBtn}
              onPress={() => onChat(bid)}
              activeOpacity={0.8}>
              <Text style={card.chatBtnText}>💬</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Chat button for accepted bids */}
      {bid.status === 'ACCEPTED' && bid.chatRoomId && (
        <TouchableOpacity style={card.chatFullBtn} onPress={() => onChat(bid)} activeOpacity={0.8}>
          <Text style={card.chatFullText}>💬  Open Chat</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function RequestBidsScreen({route, navigation}: Props) {
  const {requestId, requestTitle} = route.params;

  const [bids, setBids] = useState<Bid[]>([]);
  const [merchantStatsMap, setMerchantStatsMap] = useState<Record<string, MerchantStats>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [marketAnalysis, setMarketAnalysis] = useState<{
    totalBids: number; lowestAmount: number | null; averageAmount: number | null
  } | null>(null);

  const load = useCallback(async (refresh = false) => {
    try {
      const res = await getRequestBids(requestId, {limit: 50, sortBy: 'amount', sortOrder: 'asc'});
      setBids(res.bids);
      setMarketAnalysis(res.marketAnalysis);

      // Fetch merchant stats for unique merchants
      const uniqueIds = [...new Set(res.bids.map(b => b.merchantId))];
      const statsEntries = await Promise.all(
        uniqueIds.map(async id => {
          try {
            const profile = await getMerchantProfile(id);
            return [id, {avgRating: profile.avgRating, reviewCount: profile.reviewCount, completedBids: profile.completedBids}] as const;
          } catch {
            return null;
          }
        })
      );
      const map: Record<string, MerchantStats> = {};
      statsEntries.forEach(entry => { if (entry) map[entry[0]] = entry[1]; });
      setMerchantStatsMap(map);
    } catch {
      if (!refresh) {
        Alert.alert('Error', 'Could not load bids.', [{text: 'OK', onPress: () => navigation.goBack()}]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [requestId, navigation]);

  useEffect(() => { load(); }, [load]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    load(true);
  }, [load]);

  function handleAccept(bid: Bid) {
    Alert.alert(
      'Accept Bid',
      `Accept the $${parseFloat(bid.amount).toFixed(2)} bid with ${bid.deliveryDays}-day delivery? All other bids will be rejected.`,
      [
        {text: 'Cancel'},
        {
          text: 'Accept',
          onPress: async () => {
            setActionLoading(bid.id);
            try {
              await acceptBid(bid.id);
              Alert.alert('Accepted!', 'The bid has been accepted. The merchant will be notified.', [
                {text: 'OK', onPress: () => navigation.goBack()},
              ]);
            } catch (err: any) {
              Alert.alert('Error', err?.response?.data?.message ?? 'Failed to accept bid.');
            } finally {
              setActionLoading(null);
            }
          },
        },
      ],
    );
  }

  function handleReject(bid: Bid) {
    Alert.alert('Decline Bid', `Decline the $${parseFloat(bid.amount).toFixed(2)} bid?`, [
      {text: 'Cancel'},
      {
        text: 'Decline',
        style: 'destructive',
        onPress: async () => {
          setActionLoading(bid.id);
          try {
            await rejectBid(bid.id);
            load(true);
          } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.message ?? 'Failed to decline bid.');
          } finally {
            setActionLoading(null);
          }
        },
      },
    ]);
  }

  function handleChat(bid: Bid) {
    if (!bid.chatRoomId) return;
    navigation.navigate('ChatRoom', {roomId: bid.chatRoomId, roomName: `Bid ${bid.id.slice(0, 6)}…`});
  }

  function handleViewMerchant(bid: Bid) {
    navigation.navigate('MerchantStore', {merchantId: bid.merchantId});
  }

  const pendingCount = bids.filter(b => b.status === 'PENDING').length;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>Bids Received</Text>
          <Text style={styles.headerSub} numberOfLines={1}>{requestTitle}</Text>
        </View>
        <View style={{width: 28}} />
      </View>

      {/* Market summary */}
      {marketAnalysis && marketAnalysis.totalBids > 0 && (
        <View style={styles.summaryBar}>
          <SummaryChip label="Total" value={String(marketAnalysis.totalBids)} />
          <SummaryChip label="Pending" value={String(pendingCount)} accent />
          {marketAnalysis.lowestAmount != null && (
            <SummaryChip label="Lowest" value={`$${marketAnalysis.lowestAmount.toFixed(2)}`} />
          )}
          {marketAnalysis.averageAmount != null && (
            <SummaryChip label="Average" value={`$${marketAnalysis.averageAmount.toFixed(2)}`} />
          )}
        </View>
      )}

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
            <BidCard
              bid={item}
              merchantStats={merchantStatsMap[item.merchantId]}
              onAccept={handleAccept}
              onReject={handleReject}
              onChat={handleChat}
              onViewMerchant={handleViewMerchant}
              actionLoading={actionLoading}
            />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>📬</Text>
              <Text style={styles.emptyTitle}>No bids yet</Text>
              <Text style={styles.emptySubtitle}>Merchants haven't submitted bids yet. Pull to refresh.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

function SummaryChip({label, value, accent}: {label: string; value: string; accent?: boolean}) {
  return (
    <View style={[sc.chip, accent && sc.chipAccent]}>
      <Text style={[sc.label, accent && sc.labelAccent]}>{label}</Text>
      <Text style={[sc.value, accent && sc.valueAccent]}>{value}</Text>
    </View>
  );
}

const sc = StyleSheet.create({
  chip: {flex: 1, alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 10, paddingVertical: 8},
  chipAccent: {backgroundColor: '#DBEAFE'},
  label: {fontSize: 10, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5},
  labelAccent: {color: '#3B82F6'},
  value: {fontSize: 15, fontWeight: '700', color: '#111827', marginTop: 2},
  valueAccent: {color: ACCENT},
});

const card = StyleSheet.create({
  wrap: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  merchantRow: {flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10},
  avatarCircle: {width: 36, height: 36, borderRadius: 18, backgroundColor: '#DBEAFE', alignItems: 'center', justifyContent: 'center'},
  avatarText: {fontSize: 12, fontWeight: '700', color: ACCENT},
  merchantInfo: {flex: 1},
  merchantId: {fontSize: 13, fontWeight: '600', color: '#374151'},
  merchantStats: {fontSize: 12, color: '#F59E0B', marginTop: 1},
  top: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10},
  badge: {borderRadius: 16, paddingHorizontal: 10, paddingVertical: 4},
  badgeText: {fontSize: 11, fontWeight: '700'},
  date: {fontSize: 11, color: '#9CA3AF'},
  amount: {fontSize: 30, fontWeight: '800', color: '#111827', marginBottom: 2},
  delivery: {fontSize: 13, color: '#6B7280', marginBottom: 8},
  notes: {fontSize: 13, color: '#6B7280', lineHeight: 18, marginBottom: 10, fontStyle: 'italic'},
  actions: {flexDirection: 'row', gap: 10, marginTop: 4},
  rejectBtn: {
    flex: 1, borderRadius: 12, borderWidth: 1.5, borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2', paddingVertical: 11, alignItems: 'center',
  },
  acceptBtn: {
    flex: 1, borderRadius: 12, backgroundColor: ACCENT,
    paddingVertical: 11, alignItems: 'center',
  },
  chatBtn: {
    width: 44, borderRadius: 12, backgroundColor: '#F3F4F6',
    paddingVertical: 11, alignItems: 'center',
  },
  chatFullBtn: {
    marginTop: 10, borderRadius: 12, backgroundColor: '#EFF6FF',
    borderWidth: 1, borderColor: '#BFDBFE', paddingVertical: 11, alignItems: 'center',
  },
  chatFullText: {fontSize: 14, fontWeight: '700', color: ACCENT},
  chatBtnText: {fontSize: 16},
  rejectText: {fontSize: 14, fontWeight: '700', color: '#B91C1C'},
  acceptText: {fontSize: 14, fontWeight: '700', color: '#FFFFFF'},
  disabledBtn: {opacity: 0.6},
});

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: '#F3F4F6'},
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
  },
  back: {fontSize: 20, color: '#374151', fontWeight: '600'},
  headerCenter: {flex: 1, alignItems: 'center'},
  headerTitle: {fontSize: 17, fontWeight: '700', color: '#111827'},
  headerSub: {fontSize: 12, color: '#6B7280', marginTop: 1},
  summaryBar: {
    flexDirection: 'row', gap: 8, paddingHorizontal: 14, paddingVertical: 10,
    backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
  },
  center: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  empty: {flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 80},
  emptyIcon: {fontSize: 52, marginBottom: 16},
  emptyTitle: {fontSize: 18, fontWeight: '700', color: '#374151', marginBottom: 8},
  emptySubtitle: {fontSize: 14, color: '#9CA3AF', textAlign: 'center', lineHeight: 22},
});
