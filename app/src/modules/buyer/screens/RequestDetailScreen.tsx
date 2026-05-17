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
import {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../../types/navigation';
import {MarketRequest} from '../../../types/api';
import {cancelRequest, extendRequest, getRequest} from '../../../api/requests';
import {useAuth} from '../../../context/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'RequestDetail'>;

const BUYER_ACCENT = '#2563EB';
const MERCHANT_ACCENT = '#16A34A';

const STATUS_META: Record<string, {label: string; bg: string; text: string}> = {
  DRAFT: {label: 'Draft', bg: '#F3F4F6', text: '#6B7280'},
  ACTIVE: {label: 'Active', bg: '#DCFCE7', text: '#16A34A'},
  HAS_BIDS: {label: 'Has Bids', bg: '#DBEAFE', text: '#2563EB'},
  COMPLETED: {label: 'Completed', bg: '#F0FDF4', text: '#15803D'},
  CANCELLED: {label: 'Cancelled', bg: '#FEF2F2', text: '#DC2626'},
  EXPIRED: {label: 'Expired', bg: '#FEF3C7', text: '#D97706'},
};

function formatBudget(min?: number | null, max?: number | null): string {
  if (!min && !max) return 'Open budget';
  if (min && max) return `$${min.toLocaleString()} – $${max.toLocaleString()}`;
  if (max) return `Up to $${max.toLocaleString()}`;
  return `From $${min!.toLocaleString()}`;
}

function formatDate(iso?: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'});
}

export default function RequestDetailScreen({route, navigation}: Props) {
  const {requestId} = route.params;
  const {user} = useAuth();
  const isBuyer = user?.role === 'BUYER';
  const ACCENT = isBuyer ? BUYER_ACCENT : MERCHANT_ACCENT;

  const [request, setRequest] = useState<MarketRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await getRequest(requestId);
      setRequest(data);
    } catch {
      Alert.alert('Error', 'Could not load request.', [{text: 'OK', onPress: () => navigation.goBack()}]);
    } finally {
      setLoading(false);
    }
  }, [requestId, navigation]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCancel = useCallback(() => {
    Alert.alert('Cancel Request', 'Are you sure you want to cancel this request?', [
      {text: 'No'},
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          setActionLoading(true);
          try {
            await cancelRequest(requestId, 'Buyer cancelled');
            Alert.alert('Cancelled', 'Your request has been cancelled.', [
              {text: 'OK', onPress: () => navigation.goBack()},
            ]);
          } catch {
            Alert.alert('Error', 'Could not cancel request.');
          } finally {
            setActionLoading(false);
          }
        },
      },
    ]);
  }, [requestId, navigation]);

  const handleExtend = useCallback(async () => {
    setActionLoading(true);
    try {
      const res = await extendRequest(requestId);
      Alert.alert('Extended', `Request extended until ${formatDate(res.newExpiresAt)}.`);
      load();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Could not extend request.';
      Alert.alert('Error', msg);
    } finally {
      setActionLoading(false);
    }
  }, [requestId, load]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={ACCENT} />
        </View>
      </SafeAreaView>
    );
  }

  if (!request) return null;

  const status = STATUS_META[request.status] ?? STATUS_META.ACTIVE;
  const isOwner = user?.id === request.buyerId;
  const canCancel = isOwner && ['ACTIVE', 'HAS_BIDS', 'DRAFT'].includes(request.status);
  const canExtend = isOwner && ['ACTIVE', 'HAS_BIDS'].includes(request.status);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}>
          <Text style={styles.backBtn}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Request Detail</Text>
        <View style={{width: 28}} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status badge */}
        <View style={styles.topRow}>
          <View style={[styles.badge, {backgroundColor: status.bg}]}>
            <Text style={[styles.badgeText, {color: status.text}]}>{status.label}</Text>
          </View>
          {request.category && (
            <Text style={[styles.categoryChip, {color: ACCENT}]}>{request.category.name}</Text>
          )}
        </View>

        <Text style={styles.title}>{request.title}</Text>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <StatChip icon="👁" label={`${request.viewCount} views`} />
          <StatChip icon="📋" label={`${request.bidCount} bids`} />
          {request.expiresAt && (
            <StatChip icon="⏰" label={`Expires ${formatDate(request.expiresAt)}`} />
          )}
        </View>

        {/* Budget */}
        <InfoCard label="Budget" value={formatBudget(request.budgetMin, request.budgetMax)} />

        {/* Location */}
        {(request.locationCity || request.locationAddress) && (
          <InfoCard
            label="Location"
            value={[request.locationAddress, request.locationCity, request.locationCountry]
              .filter(Boolean)
              .join(', ')}
          />
        )}

        {/* Dates */}
        <View style={styles.datesRow}>
          <View style={styles.dateItem}>
            <Text style={styles.dateLabel}>Posted</Text>
            <Text style={styles.dateValue}>{formatDate(request.publishedAt ?? request.createdAt)}</Text>
          </View>
          {request.expiresAt && (
            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>Expires</Text>
              <Text style={styles.dateValue}>{formatDate(request.expiresAt)}</Text>
            </View>
          )}
        </View>

        {/* Description */}
        <View style={styles.descCard}>
          <Text style={styles.descLabel}>Description</Text>
          <Text style={styles.descText}>{request.description}</Text>
        </View>

        {/* Merchant: bid CTA */}
        {!isBuyer && ['ACTIVE', 'HAS_BIDS'].includes(request.status) && (
          <TouchableOpacity
            style={styles.merchantCTA}
            onPress={() => navigation.navigate('SubmitBid', {requestId: request.id, requestTitle: request.title})}
            activeOpacity={0.8}>
            <Text style={styles.merchantCTATitle}>Interested in this request?</Text>
            <Text style={styles.merchantCTADesc}>Tap to submit your bid</Text>
            <View style={styles.merchantCTABtn}>
              <Text style={styles.merchantCTABtnText}>Submit Bid</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Buyer: view bids CTA */}
        {isBuyer && request.status === 'HAS_BIDS' && (
          <TouchableOpacity
            style={styles.viewBidsCTA}
            onPress={() => navigation.navigate('RequestBids', {requestId: request.id, requestTitle: request.title})}
            activeOpacity={0.8}>
            <Text style={styles.viewBidsTitle}>
              {request.bidCount} Bid{request.bidCount !== 1 ? 's' : ''} Received
            </Text>
            <Text style={styles.viewBidsDesc}>Tap to review and accept a bid</Text>
            <View style={styles.viewBidsBtn}>
              <Text style={styles.viewBidsBtnText}>View Bids</Text>
            </View>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Buyer actions */}
      {isBuyer && (canCancel || canExtend) && (
        <View style={styles.actions}>
          {canExtend && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.extendBtn]}
              onPress={handleExtend}
              disabled={actionLoading}
              activeOpacity={0.8}>
              {actionLoading ? (
                <ActivityIndicator color={BUYER_ACCENT} />
              ) : (
                <Text style={[styles.actionBtnText, {color: BUYER_ACCENT}]}>Extend</Text>
              )}
            </TouchableOpacity>
          )}
          {canCancel && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.cancelBtn, canExtend && {flex: 1}]}
              onPress={handleCancel}
              disabled={actionLoading}
              activeOpacity={0.8}>
              <Text style={[styles.actionBtnText, {color: '#DC2626'}]}>Cancel Request</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

function StatChip({icon, label}: {icon: string; label: string}) {
  return (
    <View style={sc.wrap}>
      <Text style={sc.icon}>{icon}</Text>
      <Text style={sc.label}>{label}</Text>
    </View>
  );
}

function InfoCard({label, value}: {label: string; value: string}) {
  return (
    <View style={ic.card}>
      <Text style={ic.label}>{label}</Text>
      <Text style={ic.value}>{value}</Text>
    </View>
  );
}

const sc = StyleSheet.create({
  wrap: {flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6},
  icon: {fontSize: 14, marginRight: 4},
  label: {fontSize: 12, color: '#6B7280'},
});

const ic = StyleSheet.create({
  card: {backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#F3F4F6'},
  label: {fontSize: 11, fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4},
  value: {fontSize: 15, fontWeight: '600', color: '#111827'},
});

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: '#F9FAFB'},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
  },
  backBtn: {fontSize: 20, color: '#374151', fontWeight: '600'},
  headerTitle: {fontSize: 17, fontWeight: '700', color: '#111827', flex: 1, textAlign: 'center'},
  content: {padding: 16, paddingBottom: 32},
  topRow: {flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8, flexWrap: 'wrap'},
  badge: {borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4},
  badgeText: {fontSize: 12, fontWeight: '700'},
  categoryChip: {fontSize: 13, fontWeight: '600'},
  title: {fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 12, lineHeight: 28},
  statsRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16},
  datesRow: {flexDirection: 'row', gap: 10, marginBottom: 10},
  dateItem: {flex: 1, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#F3F4F6'},
  dateLabel: {fontSize: 11, fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2},
  dateValue: {fontSize: 14, fontWeight: '600', color: '#374151'},
  descCard: {backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, marginTop: 4, borderWidth: 1, borderColor: '#F3F4F6'},
  descLabel: {fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 8},
  descText: {fontSize: 15, color: '#374151', lineHeight: 24},
  merchantCTA: {
    backgroundColor: '#F0FDF4', borderRadius: 14, padding: 18, marginTop: 16,
    borderWidth: 1, borderColor: '#BBF7D0', alignItems: 'center',
  },
  merchantCTATitle: {fontSize: 16, fontWeight: '700', color: '#15803D', marginBottom: 4},
  merchantCTADesc: {fontSize: 13, color: '#166534', textAlign: 'center', marginBottom: 14},
  merchantCTABtn: {
    backgroundColor: MERCHANT_ACCENT, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 28,
  },
  merchantCTABtnText: {fontSize: 15, fontWeight: '700', color: '#FFFFFF'},
  viewBidsCTA: {
    backgroundColor: '#EFF6FF', borderRadius: 14, padding: 18, marginTop: 16,
    borderWidth: 1, borderColor: '#BFDBFE', alignItems: 'center',
  },
  viewBidsTitle: {fontSize: 16, fontWeight: '700', color: '#1D4ED8', marginBottom: 4},
  viewBidsDesc: {fontSize: 13, color: '#3B82F6', textAlign: 'center', marginBottom: 14},
  viewBidsBtn: {
    backgroundColor: BUYER_ACCENT, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 28,
  },
  viewBidsBtnText: {fontSize: 15, fontWeight: '700', color: '#FFFFFF'},
  actions: {
    flexDirection: 'row', gap: 12,
    backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingVertical: 14,
    borderTopWidth: 1, borderTopColor: '#E5E7EB',
  },
  actionBtn: {
    flex: 1, borderRadius: 12, paddingVertical: 14, alignItems: 'center',
    borderWidth: 1.5,
  },
  extendBtn: {borderColor: BUYER_ACCENT, backgroundColor: '#EFF6FF'},
  cancelBtn: {borderColor: '#FCA5A5', backgroundColor: '#FEF2F2'},
  actionBtnText: {fontSize: 15, fontWeight: '700'},
});
