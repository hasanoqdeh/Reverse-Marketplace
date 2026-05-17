import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../../types/navigation';
import {Bid} from '../../../types/api';
import {getBid, withdrawBid} from '../../../api/bids';

type Props = NativeStackScreenProps<RootStackParamList, 'BidDetail'>;

const ACCENT = '#16A34A';

const STATUS_META: Record<string, {label: string; bg: string; text: string}> = {
  PENDING:   {label: 'Pending',   bg: '#FEF9C3', text: '#854D0E'},
  ACCEPTED:  {label: 'Accepted',  bg: '#DCFCE7', text: '#15803D'},
  REJECTED:  {label: 'Rejected',  bg: '#FEF2F2', text: '#B91C1C'},
  EXPIRED:   {label: 'Expired',   bg: '#FEF3C7', text: '#B45309'},
  WITHDRAWN: {label: 'Withdrawn', bg: '#F3F4F6', text: '#6B7280'},
};

function formatDate(iso?: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export default function BidDetailScreen({route, navigation}: Props) {
  const {bidId} = route.params;
  const [bid, setBid] = useState<Bid | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await getBid(bidId);
      setBid(data);
    } catch {
      Alert.alert('Error', 'Could not load bid.', [{text: 'OK', onPress: () => navigation.goBack()}]);
    } finally {
      setLoading(false);
    }
  }, [bidId, navigation]);

  useEffect(() => { load(); }, [load]);

  function handleWithdraw() {
    Alert.alert('Withdraw Bid', 'Are you sure you want to withdraw this bid?', [
      {text: 'Cancel'},
      {
        text: 'Withdraw',
        style: 'destructive',
        onPress: async () => {
          setActionLoading(true);
          try {
            await withdrawBid(bidId);
            Alert.alert('Withdrawn', 'Your bid has been withdrawn.', [
              {text: 'OK', onPress: () => navigation.goBack()},
            ]);
          } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.message ?? 'Failed to withdraw bid.');
          } finally {
            setActionLoading(false);
          }
        },
      },
    ]);
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={ACCENT} />
        </View>
      </SafeAreaView>
    );
  }

  if (!bid) return null;

  const meta = STATUS_META[bid.status] ?? STATUS_META.PENDING;
  const canWithdraw = bid.status === 'PENDING';

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bid Detail</Text>
        <View style={{width: 28}} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status */}
        <View style={[styles.statusBadge, {backgroundColor: meta.bg}]}>
          <View style={[styles.statusDot, {backgroundColor: meta.text}]} />
          <Text style={[styles.statusText, {color: meta.text}]}>{meta.label}</Text>
        </View>

        {/* Amount hero */}
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Your Bid</Text>
          <Text style={styles.amount}>${parseFloat(bid.amount).toFixed(2)}</Text>
          <Text style={styles.deliveryLine}>
            {bid.deliveryDays} day{bid.deliveryDays !== 1 ? 's' : ''} delivery
          </Text>
        </View>

        {/* Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Timeline</Text>
          <TimelineRow label="Submitted" value={formatDate(bid.createdAt)} />
          {bid.expiresAt && <TimelineRow label="Expires" value={formatDate(bid.expiresAt)} />}
          {bid.acceptedAt && <TimelineRow label="Accepted" value={formatDate(bid.acceptedAt)} highlight="#15803D" />}
          {bid.rejectedAt && <TimelineRow label="Rejected" value={formatDate(bid.rejectedAt)} highlight="#B91C1C" />}
          {bid.withdrawnAt && <TimelineRow label="Withdrawn" value={formatDate(bid.withdrawnAt)} highlight="#6B7280" />}
        </View>

        {/* Notes */}
        {(bid.deliveryNotes || bid.specialTerms) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Notes</Text>
            {bid.deliveryNotes ? (
              <NoteCard label="Delivery Notes" value={bid.deliveryNotes} />
            ) : null}
            {bid.specialTerms ? (
              <NoteCard label="Special Terms" value={bid.specialTerms} />
            ) : null}
          </View>
        )}

        {/* Accepted message */}
        {bid.status === 'ACCEPTED' && (
          <View style={styles.acceptedBanner}>
            <Text style={styles.acceptedIcon}>🎉</Text>
            <Text style={styles.acceptedTitle}>Bid Accepted!</Text>
            <Text style={styles.acceptedDesc}>
              The buyer has accepted your bid. Get ready to deliver.
            </Text>
          </View>
        )}
      </ScrollView>

      {canWithdraw && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.withdrawBtn}
            onPress={handleWithdraw}
            disabled={actionLoading}
            activeOpacity={0.8}>
            {actionLoading ? (
              <ActivityIndicator color="#B91C1C" />
            ) : (
              <Text style={styles.withdrawBtnText}>Withdraw Bid</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

function TimelineRow({label, value, highlight}: {label: string; value: string; highlight?: string}) {
  return (
    <View style={tl.row}>
      <Text style={tl.label}>{label}</Text>
      <Text style={[tl.value, highlight ? {color: highlight, fontWeight: '600'} : null]}>{value}</Text>
    </View>
  );
}

function NoteCard({label, value}: {label: string; value: string}) {
  return (
    <View style={nc.card}>
      <Text style={nc.label}>{label}</Text>
      <Text style={nc.text}>{value}</Text>
    </View>
  );
}

const tl = StyleSheet.create({
  row: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F3F4F6'},
  label: {fontSize: 13, color: '#6B7280'},
  value: {fontSize: 13, color: '#374151', textAlign: 'right', flex: 1, paddingLeft: 16},
});

const nc = StyleSheet.create({
  card: {backgroundColor: '#F9FAFB', borderRadius: 10, padding: 12, marginBottom: 8},
  label: {fontSize: 11, fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4},
  text: {fontSize: 14, color: '#374151', lineHeight: 20},
});

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: '#F9FAFB'},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
  },
  back: {fontSize: 20, color: '#374151', fontWeight: '600'},
  headerTitle: {fontSize: 17, fontWeight: '700', color: '#111827', flex: 1, textAlign: 'center'},
  content: {padding: 16, paddingBottom: 40},
  statusBadge: {flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, marginBottom: 16, gap: 6},
  statusDot: {width: 8, height: 8, borderRadius: 4},
  statusText: {fontSize: 13, fontWeight: '700'},
  amountCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 20,
    shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  amountLabel: {fontSize: 12, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6},
  amount: {fontSize: 44, fontWeight: '800', color: ACCENT},
  deliveryLine: {fontSize: 14, color: '#6B7280', marginTop: 4},
  section: {
    backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  sectionTitle: {fontSize: 14, fontWeight: '700', color: '#374151', marginBottom: 12},
  acceptedBanner: {
    backgroundColor: '#F0FDF4', borderRadius: 14, padding: 20, alignItems: 'center',
    borderWidth: 1, borderColor: '#BBF7D0', marginTop: 4,
  },
  acceptedIcon: {fontSize: 36, marginBottom: 8},
  acceptedTitle: {fontSize: 18, fontWeight: '800', color: '#15803D', marginBottom: 6},
  acceptedDesc: {fontSize: 14, color: '#166534', textAlign: 'center', lineHeight: 20},
  footer: {
    backgroundColor: '#FFFFFF', padding: 16, paddingBottom: 24,
    borderTopWidth: 1, borderTopColor: '#E5E7EB',
  },
  withdrawBtn: {
    borderWidth: 1.5, borderColor: '#FCA5A5', backgroundColor: '#FEF2F2',
    borderRadius: 14, paddingVertical: 14, alignItems: 'center',
  },
  withdrawBtnText: {fontSize: 15, fontWeight: '700', color: '#B91C1C'},
});
