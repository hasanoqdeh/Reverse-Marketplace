import React, {useCallback, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../../types/navigation';
import {Bid, FulfillmentStatus, MarketRequest} from '../../../types/api';
import {getBid, getMyBids, updateFulfillmentStatus, withdrawBid} from '../../../api/bids';
import {getRequest} from '../../../api/requests';
import {createRoom} from '../../../api/chat';
import {getMyNotifications, markNotificationRead} from '../../../api/notifications';
import {NotificationItem} from '../../../api/notifications';
import AppHeader from '../../../components/AppHeader';
import {Colors} from '../../../theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const {height: SCREEN_HEIGHT} = Dimensions.get('window');

// ─── Fulfillment helpers ──────────────────────────────────────────────────────

const FULFILLMENT_ORDER: FulfillmentStatus[] = [
  'AWAITING', 'PREPARING', 'IN_DELIVERY', 'DELIVERED', 'CONFIRMED',
];

const FULFILLMENT_LABELS: Record<FulfillmentStatus, string> = {
  AWAITING:    'Awaiting',
  PREPARING:   'Preparing',
  IN_DELIVERY: 'In Delivery',
  DELIVERED:   'Delivered',
  CONFIRMED:   'Confirmed',
};

const NEXT_ACTION: Partial<Record<FulfillmentStatus, {label: string; next: FulfillmentStatus}>> = {
  AWAITING:    {label: 'Start Preparing', next: 'PREPARING'},
  PREPARING:   {label: 'Mark as Shipped', next: 'IN_DELIVERY'},
  IN_DELIVERY: {label: 'Mark as Delivered', next: 'DELIVERED'},
};

// ─── Status meta ─────────────────────────────────────────────────────────────

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
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ─── Notification helpers ─────────────────────────────────────────────────────

function notifIcon(type: string): string {
  if (type === 'NEW_MESSAGE')        return '💬';
  if (type === 'BID_ACCEPTED')       return '🎉';
  if (type === 'DELIVERY_CONFIRMED') return '✅';
  return '🔔';
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({title, count}: {title: string; count?: number}) {
  return (
    <View style={sh.row}>
      <Text style={sh.title}>{title}</Text>
      {count !== undefined && (
        <View style={sh.badge}>
          <Text style={sh.badgeText}>{count}</Text>
        </View>
      )}
    </View>
  );
}

function FulfillmentBar({status}: {status: FulfillmentStatus}) {
  const idx = FULFILLMENT_ORDER.indexOf(status);
  return (
    <View style={fb.wrap}>
      {FULFILLMENT_ORDER.slice(0, 4).map((s, i) => (
        <React.Fragment key={s}>
          <View style={[fb.dot, i <= idx && fb.dotActive]}>
            {i < idx && <Text style={fb.check}>✓</Text>}
          </View>
          {i < 3 && <View style={[fb.line, i < idx && fb.lineActive]} />}
        </React.Fragment>
      ))}
    </View>
  );
}

interface OrderCardProps {
  bid: Bid;
  request: MarketRequest | undefined;
  updating: boolean;
  onFulfillment: (bidId: string, next: FulfillmentStatus) => void;
  onMessage: (bid: Bid, request: MarketRequest | undefined) => void;
  onViewRequest: (requestId: string) => void;
}

function OrderCard({bid, request, updating, onFulfillment, onMessage, onViewRequest}: OrderCardProps) {
  const status = bid.fulfillmentStatus ?? 'AWAITING';
  const action = NEXT_ACTION[status];
  return (
    <View style={oc.wrap}>
      <View style={oc.top}>
        <View style={oc.tag}><Text style={oc.tagText}>ACTIVE ORDER</Text></View>
        <Text style={oc.status}>{FULFILLMENT_LABELS[status]}</Text>
      </View>

      <TouchableOpacity onPress={() => onViewRequest(bid.requestId)} activeOpacity={0.8}>
        <Text style={oc.title} numberOfLines={2}>
          {request?.title ?? `Request #${bid.requestId.slice(-6)}`}
        </Text>
      </TouchableOpacity>
      <Text style={oc.meta}>
        ${parseFloat(bid.amount).toFixed(2)} · {bid.deliveryDays}d delivery
      </Text>

      <FulfillmentBar status={status} />

      <View style={oc.actions}>
        {action && (
          <TouchableOpacity
            style={[oc.btn, oc.btnPrimary, updating && oc.btnDisabled]}
            onPress={() => onFulfillment(bid.id, action.next)}
            disabled={updating}
            activeOpacity={0.8}>
            {updating
              ? <ActivityIndicator size="small" color="#FFF" />
              : <Text style={oc.btnPrimaryText}>{action.label}</Text>}
          </TouchableOpacity>
        )}
        {status === 'DELIVERED' && (
          <View style={[oc.btn, oc.btnWaiting]}>
            <Text style={oc.btnWaitingText}>⏳ Awaiting buyer confirmation</Text>
          </View>
        )}
        {status === 'CONFIRMED' && (
          <View style={[oc.btn, oc.btnDone]}>
            <Text style={oc.btnDoneText}>🎉 Complete!</Text>
          </View>
        )}
        <TouchableOpacity
          style={[oc.btn, oc.btnSecondary]}
          onPress={() => onMessage(bid, request)}
          activeOpacity={0.8}>
          <Text style={oc.btnSecondaryText}>💬 Message Buyer</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[oc.btn, oc.btnOutline]}
          onPress={() => onViewRequest(bid.requestId)}
          activeOpacity={0.8}>
          <Text style={oc.btnOutlineText}>View Request →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

interface PendingCardProps {
  bid: Bid;
  request: MarketRequest | undefined;
  onViewBid: (bid: Bid) => void;
}

function PendingCard({bid, request, onViewBid}: PendingCardProps) {
  return (
    <TouchableOpacity style={pc.wrap} onPress={() => onViewBid(bid)} activeOpacity={0.8}>
      <View style={pc.row}>
        <View style={pc.left}>
          <Text style={pc.title} numberOfLines={2}>
            {request?.title ?? `Request #${bid.requestId.slice(-6)}`}
          </Text>
          <Text style={pc.meta}>
            ${parseFloat(bid.amount).toFixed(2)} · {bid.deliveryDays}d · Pending
          </Text>
        </View>
        <View style={pc.right}>
          <View style={[pc.statusDot, {backgroundColor: '#FCD34D'}]} />
          <Text style={pc.chevron}>›</Text>
        </View>
      </View>
      <View style={pc.waitNote}>
        <Text style={pc.waitText}>⏳ Waiting for buyer to accept · Tap to view details</Text>
      </View>
    </TouchableOpacity>
  );
}

function ActivityRow({item, onPress}: {item: NotificationItem; onPress: (item: NotificationItem) => void}) {
  return (
    <TouchableOpacity style={ar.wrap} onPress={() => onPress(item)} activeOpacity={0.75}>
      <Text style={ar.icon}>{notifIcon(item.type)}</Text>
      <View style={ar.body}>
        <Text style={ar.title} numberOfLines={2}>{item.title}</Text>
        <Text style={ar.msg} numberOfLines={1}>{item.body}</Text>
        <Text style={ar.time}>{formatRelative(item.createdAt)}</Text>
      </View>
      {!item.isRead && <View style={ar.dot} />}
    </TouchableOpacity>
  );
}

// ─── Bid Detail Sheet ─────────────────────────────────────────────────────────

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

interface BidDetailSheetProps {
  bid: Bid;
  request: MarketRequest | undefined;
  visible: boolean;
  onClose: () => void;
  onMessage: (bid: Bid, request: MarketRequest | undefined) => void;
  onWithdraw: (bidId: string) => void;
  onFulfillment: (bidId: string, next: FulfillmentStatus) => void;
  updating: boolean;
}

function BidDetailSheet({bid, request, visible, onClose, onMessage, onWithdraw, onFulfillment, updating}: BidDetailSheetProps) {
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {toValue: 0, useNativeDriver: true, bounciness: 0, speed: 14}).start();
    } else {
      Animated.timing(slideAnim, {toValue: SCREEN_HEIGHT, duration: 200, useNativeDriver: true}).start();
    }
  }, [visible, slideAnim]);

  const meta = STATUS_META[bid.status] ?? STATUS_META.PENDING;
  const fulfillmentStatus = bid.fulfillmentStatus ?? 'AWAITING';
  const action = NEXT_ACTION[fulfillmentStatus as FulfillmentStatus];

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <TouchableOpacity style={bs.overlay} activeOpacity={1} onPress={onClose} />
      <Animated.View style={[bs.sheet, {transform: [{translateY: slideAnim}]}]}>
        <View style={bs.handleWrap}>
          <View style={bs.handle} />
        </View>

        <ScrollView
          contentContainerStyle={bs.content}
          showsVerticalScrollIndicator={false}
          bounces={false}>

          {/* Header */}
          <View style={bs.header}>
            <Text style={bs.headerTitle}>Bid Details</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}>
              <Text style={bs.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Request title */}
          {request && (
            <Text style={bs.requestTitle} numberOfLines={2}>{request.title}</Text>
          )}

          {/* Status badge */}
          <View style={[bs.statusBadge, {backgroundColor: meta.bg}]}>
            <View style={[bs.statusDot, {backgroundColor: meta.text}]} />
            <Text style={[bs.statusText, {color: meta.text}]}>{meta.label}</Text>
          </View>

          {/* Amount + delivery */}
          <View style={bs.amountRow}>
            <View style={bs.amountBox}>
              <Text style={bs.amountLabel}>Your Bid</Text>
              <Text style={bs.amount}>${parseFloat(bid.amount).toFixed(2)}</Text>
            </View>
            <View style={bs.deliveryBox}>
              <Text style={bs.amountLabel}>Delivery</Text>
              <Text style={bs.deliveryDays}>{bid.deliveryDays}d</Text>
            </View>
          </View>

          {/* Timeline */}
          <View style={bs.section}>
            <Text style={bs.sectionTitle}>Timeline</Text>
            <TimelineRow label="Submitted" value={formatDate(bid.createdAt)} />
            {bid.expiresAt   && <TimelineRow label="Expires"   value={formatDate(bid.expiresAt)}   />}
            {bid.acceptedAt  && <TimelineRow label="Accepted"  value={formatDate(bid.acceptedAt)}  highlight={Colors.success} />}
            {bid.rejectedAt  && <TimelineRow label="Rejected"  value={formatDate(bid.rejectedAt)}  highlight={Colors.error} />}
            {bid.withdrawnAt && <TimelineRow label="Withdrawn" value={formatDate(bid.withdrawnAt)} highlight={Colors.textSecondary} />}
          </View>

          {/* Notes */}
          {(bid.deliveryNotes || bid.specialTerms) && (
            <View style={bs.section}>
              <Text style={bs.sectionTitle}>Your Notes</Text>
              {bid.deliveryNotes && <NoteCard label="Delivery Notes" value={bid.deliveryNotes} />}
              {bid.specialTerms  && <NoteCard label="Special Terms"  value={bid.specialTerms} />}
            </View>
          )}

          {/* Accepted banner */}
          {bid.status === 'ACCEPTED' && (
            <View style={bs.acceptedBanner}>
              <Text style={bs.acceptedIcon}>🎉</Text>
              <Text style={bs.acceptedTitle}>Bid Accepted!</Text>
              <Text style={bs.acceptedDesc}>The buyer has accepted your bid.</Text>
            </View>
          )}

          {/* Fulfillment (accepted bids) */}
          {bid.status === 'ACCEPTED' && (
            <View style={bs.section}>
              <Text style={bs.sectionTitle}>Fulfillment</Text>
              <FulfillmentBar status={fulfillmentStatus} />
              <Text style={bs.fulfillLabel}>{FULFILLMENT_LABELS[fulfillmentStatus]}</Text>
              {action && (
                <TouchableOpacity
                  style={[bs.actionBtn, updating && {opacity: 0.6}]}
                  onPress={() => onFulfillment(bid.id, action.next)}
                  disabled={updating}
                  activeOpacity={0.8}>
                  {updating
                    ? <ActivityIndicator size="small" color="#FFF" />
                    : <Text style={bs.actionBtnText}>{action.label}</Text>}
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Chat button */}
          {bid.status === 'ACCEPTED' && bid.chatRoomId && (
            <TouchableOpacity
              style={bs.chatBtn}
              onPress={() => { onClose(); onMessage(bid, request); }}
              activeOpacity={0.8}>
              <Text style={bs.chatBtnText}>💬  Message Buyer</Text>
            </TouchableOpacity>
          )}

          {/* Withdraw button */}
          {bid.status === 'PENDING' && (
            <TouchableOpacity
              style={bs.withdrawBtn}
              onPress={() => onWithdraw(bid.id)}
              activeOpacity={0.8}>
              <Text style={bs.withdrawBtnText}>Withdraw Bid</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function MerchantActivityScreen() {
  const navigation = useNavigation<Nav>();

  const [activeBids,    setActiveBids]    = useState<Bid[]>([]);
  const [pendingBids,   setPendingBids]   = useState<Bid[]>([]);
  const [requestMap,    setRequestMap]    = useState<Record<string, MarketRequest>>({});
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [refreshing,    setRefreshing]    = useState(false);
  const [updatingBidId, setUpdatingBidId] = useState<string | null>(null);
  const [sheetBid,      setSheetBid]      = useState<Bid | null>(null);

  const load = useCallback(async () => {
    try {
      const [bidsRes, notifsRes] = await Promise.all([
        getMyBids({limit: 100}),
        getMyNotifications({limit: 20}),
      ]);

      const all     = bidsRes.bids;
      const active  = all.filter(b => b.status === 'ACCEPTED');
      const pending = all.filter(b => b.status === 'PENDING');

      setActiveBids(active);
      setPendingBids(pending);
      setNotifications(notifsRes.notifications ?? []);

      const uniqueRequestIds = [...new Set(all.map(b => b.requestId))];
      const fetched = await Promise.all(
        uniqueRequestIds.map(id => getRequest(id).catch(() => null)),
      );
      const map: Record<string, MarketRequest> = {};
      fetched.forEach(res => { if (res?.request) map[res.request.id] = res.request; });
      setRequestMap(map);
    } catch {
      // silently ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { setLoading(true); load(); }, [load]));

  const handleRefresh = useCallback(() => { setRefreshing(true); load(); }, [load]);

  const handleFulfillment = useCallback(async (bidId: string, next: FulfillmentStatus) => {
    setUpdatingBidId(bidId);
    try {
      await updateFulfillmentStatus(bidId, next);
      const update = (b: Bid) => b.id === bidId ? {...b, fulfillmentStatus: next} : b;
      setActiveBids(prev => prev.map(update));
      setSheetBid(prev => prev?.id === bidId ? {...prev, fulfillmentStatus: next} : prev);
    } catch {
      // silently ignore
    } finally {
      setUpdatingBidId(null);
    }
  }, []);

  const openChat = useCallback(async (bid: Bid, request: MarketRequest | undefined) => {
    if (bid.chatRoomId) {
      navigation.navigate('ChatRoom', {roomId: bid.chatRoomId, roomName: request?.title ?? 'Buyer'});
      return;
    }
    try {
      const buyerId = request?.buyerId;
      if (!buyerId) return;
      const room = await createRoom({
        name: request?.title ?? 'Bid discussion',
        type: 'BID',
        participantIds: [buyerId],
        relatedBidId: bid.id,
        relatedRequestId: bid.requestId,
      });
      navigation.navigate('ChatRoom', {roomId: room.id, roomName: request?.title ?? 'Buyer'});
    } catch {
      // silently ignore
    }
  }, [navigation]);

  const handleViewRequest = useCallback((requestId: string) => {
    navigation.navigate('RequestDetail', {requestId});
  }, [navigation]);

  const openBidSheet = useCallback((bid: Bid) => {
    setSheetBid(bid);
  }, []);

  const closeBidSheet = useCallback(() => {
    setSheetBid(null);
  }, []);

  const handleWithdraw = useCallback((bidId: string) => {
    Alert.alert('Withdraw Bid', 'Are you sure you want to withdraw this bid?', [
      {text: 'Cancel'},
      {
        text: 'Withdraw',
        style: 'destructive',
        onPress: async () => {
          try {
            await withdrawBid(bidId);
            closeBidSheet();
            setPendingBids(prev => prev.filter(b => b.id !== bidId));
          } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.message ?? 'Failed to withdraw bid.');
          }
        },
      },
    ]);
  }, [closeBidSheet]);

  const handleNotifPress = useCallback(async (item: NotificationItem) => {
    if (!item.isRead) markNotificationRead(item.id).catch(() => {});
    if (item.data?.chatRoomId) {
      navigation.navigate('ChatRoom', {roomId: item.data.chatRoomId, roomName: 'Buyer'});
    } else if (item.data?.bidId) {
      const bidId = item.data.bidId;
      const found = [...activeBids, ...pendingBids].find(b => b.id === bidId);
      if (found) {
        openBidSheet(found);
      } else {
        try {
          const data = await getBid(bidId);
          openBidSheet(data);
        } catch {
          // silently ignore
        }
      }
    }
  }, [navigation, activeBids, pendingBids, openBidSheet]);

  const empty = !loading && activeBids.length === 0 && pendingBids.length === 0 && notifications.length === 0;

  return (
    <View style={styles.root}>
      <AppHeader />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.primary} colors={[Colors.primary]} />
          }>

          {/* ── Active Orders ── */}
          {activeBids.length > 0 && (
            <View style={styles.section}>
              <SectionHeader title="Active Orders" count={activeBids.length} />
              {activeBids.map(bid => (
                <OrderCard
                  key={bid.id}
                  bid={bid}
                  request={requestMap[bid.requestId]}
                  updating={updatingBidId === bid.id}
                  onFulfillment={handleFulfillment}
                  onMessage={openChat}
                  onViewRequest={handleViewRequest}
                />
              ))}
            </View>
          )}

          {/* ── Pending Bids ── */}
          {pendingBids.length > 0 && (
            <View style={styles.section}>
              <SectionHeader title="Pending Bids" count={pendingBids.length} />
              {pendingBids.map(bid => (
                <PendingCard
                  key={bid.id}
                  bid={bid}
                  request={requestMap[bid.requestId]}
                  onViewBid={openBidSheet}
                />
              ))}
            </View>
          )}

          {/* ── Recent Activity ── */}
          {notifications.length > 0 && (
            <View style={styles.section}>
              <SectionHeader title="Recent Activity" />
              {notifications.map(n => (
                <ActivityRow key={n.id} item={n} onPress={handleNotifPress} />
              ))}
            </View>
          )}

          {empty && (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyTitle}>No activity yet</Text>
              <Text style={styles.emptyMsg}>
                Submit bids on the Discover tab and your active orders and activity will appear here.
              </Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* ── Bid Detail Sheet ── */}
      {sheetBid && (
        <BidDetailSheet
          bid={sheetBid}
          request={requestMap[sheetBid.requestId]}
          visible={!!sheetBid}
          onClose={closeBidSheet}
          onMessage={openChat}
          onWithdraw={handleWithdraw}
          onFulfillment={handleFulfillment}
          updating={updatingBidId === sheetBid.id}
        />
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const sh = StyleSheet.create({
  row:       {flexDirection: 'row', alignItems: 'center', marginBottom: 10},
  title:     {fontSize: 15, fontWeight: '700', color: Colors.textSecondary, flex: 1},
  badge:     {backgroundColor: Colors.primary, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2},
  badgeText: {fontSize: 12, color: Colors.textOnPrimary, fontWeight: '700'},
});

const fb = StyleSheet.create({
  wrap:       {flexDirection: 'row', alignItems: 'center', marginVertical: 12},
  dot:        {width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.divider, alignItems: 'center', justifyContent: 'center'},
  dotActive:  {backgroundColor: Colors.primary},
  check:      {fontSize: 7, color: Colors.textOnPrimary, fontWeight: '800'},
  line:       {flex: 1, height: 2, backgroundColor: Colors.divider},
  lineActive: {backgroundColor: Colors.primary},
});

const oc = StyleSheet.create({
  wrap:           {backgroundColor: Colors.surface, borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.08, shadowRadius: 2, elevation: 2},
  top:            {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8},
  tag:            {backgroundColor: Colors.successLight, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3},
  tagText:        {fontSize: 10, fontWeight: '800', color: Colors.success, letterSpacing: 0.5},
  status:         {fontSize: 12, fontWeight: '600', color: Colors.textSecondary},
  title:          {fontSize: 16, fontWeight: '700', color: Colors.textPrimary, lineHeight: 22, marginBottom: 4},
  meta:           {fontSize: 13, color: Colors.textSecondary, marginBottom: 4},
  actions:        {gap: 8, marginTop: 4},
  btn:            {borderRadius: 10, paddingVertical: 12, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center'},
  btnPrimary:     {backgroundColor: Colors.primary},
  btnPrimaryText: {color: Colors.textOnPrimary, fontWeight: '700', fontSize: 14},
  btnSecondary:     {backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E4E6EA'},
  btnSecondaryText: {color: Colors.textPrimary, fontWeight: '600', fontSize: 14},
  btnDisabled:    {opacity: 0.6},
  btnWaiting:     {backgroundColor: Colors.warningLight},
  btnWaitingText: {color: '#92400E', fontWeight: '600', fontSize: 13, textAlign: 'center'},
  btnDone:        {backgroundColor: Colors.successLight},
  btnDoneText:    {color: Colors.success, fontWeight: '700', fontSize: 14, textAlign: 'center'},
  btnOutline:     {backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.divider},
  btnOutlineText: {color: Colors.textPrimary, fontWeight: '600', fontSize: 13},
});

const pc = StyleSheet.create({
  wrap:      {backgroundColor: Colors.surface, borderRadius: 16, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.08, shadowRadius: 2, elevation: 2},
  row:       {flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10},
  left:      {flex: 1},
  right:     {alignItems: 'center', gap: 4},
  title:     {fontSize: 15, fontWeight: '700', color: Colors.textPrimary, lineHeight: 20, marginBottom: 3},
  meta:      {fontSize: 12, color: Colors.textSecondary},
  statusDot: {width: 10, height: 10, borderRadius: 5, marginTop: 4},
  chevron:   {fontSize: 20, color: Colors.textSecondary, fontWeight: '300'},
  waitNote:  {backgroundColor: Colors.warningLight, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7},
  waitText:  {fontSize: 12, color: '#92400E', fontWeight: '500'},
});

const ar = StyleSheet.create({
  wrap:  {flexDirection: 'row', alignItems: 'flex-start', backgroundColor: Colors.surface, borderRadius: 14, padding: 12, marginBottom: 8, shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.06, shadowRadius: 2, elevation: 1},
  icon:  {fontSize: 22, marginRight: 12, width: 30, textAlign: 'center'},
  body:  {flex: 1},
  title: {fontSize: 14, fontWeight: '700', color: Colors.textPrimary, marginBottom: 2},
  msg:   {fontSize: 13, color: Colors.textSecondary, marginBottom: 3},
  time:  {fontSize: 11, color: Colors.textSecondary},
  dot:   {width: 9, height: 9, borderRadius: 5, backgroundColor: Colors.primary, marginTop: 4, marginLeft: 6},
});

const bs = StyleSheet.create({
  overlay:       {flex: 1, backgroundColor: 'rgba(0,0,0,0.4)'},
  sheet:         {position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: Colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: SCREEN_HEIGHT * 0.9},
  handleWrap:    {alignItems: 'center', paddingTop: 12, paddingBottom: 4},
  handle:        {width: 36, height: 4, borderRadius: 2, backgroundColor: Colors.divider},
  content:       {paddingHorizontal: 20, paddingBottom: 40},
  header:        {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, marginBottom: 4},
  headerTitle:   {fontSize: 17, fontWeight: '700', color: Colors.textPrimary},
  closeBtn:      {fontSize: 16, color: Colors.textSecondary, fontWeight: '600'},
  requestTitle:  {fontSize: 15, fontWeight: '600', color: Colors.textSecondary, marginBottom: 12, lineHeight: 20},
  statusBadge:   {flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, marginBottom: 16, gap: 6},
  statusDot:     {width: 8, height: 8, borderRadius: 4},
  statusText:    {fontSize: 13, fontWeight: '700'},
  amountRow:     {flexDirection: 'row', gap: 12, marginBottom: 20},
  amountBox:     {flex: 1, backgroundColor: Colors.primaryLight, borderRadius: 14, padding: 16, alignItems: 'center'},
  deliveryBox:   {flex: 1, backgroundColor: Colors.feedBackground, borderRadius: 14, padding: 16, alignItems: 'center'},
  amountLabel:   {fontSize: 11, fontWeight: '600', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4},
  amount:        {fontSize: 28, fontWeight: '800', color: Colors.primary},
  deliveryDays:  {fontSize: 28, fontWeight: '800', color: Colors.textPrimary},
  section:       {backgroundColor: Colors.feedBackground, borderRadius: 14, padding: 14, marginBottom: 12},
  sectionTitle:  {fontSize: 12, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10},
  fulfillLabel:  {fontSize: 13, color: Colors.textSecondary, textAlign: 'center', marginTop: 4},
  actionBtn:     {marginTop: 12, borderRadius: 10, backgroundColor: Colors.primary, paddingVertical: 12, alignItems: 'center'},
  actionBtnText: {fontSize: 14, fontWeight: '700', color: Colors.textOnPrimary},
  acceptedBanner:{backgroundColor: Colors.successLight, borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#BBF7D0', marginBottom: 12},
  acceptedIcon:  {fontSize: 28, marginBottom: 6},
  acceptedTitle: {fontSize: 16, fontWeight: '800', color: Colors.success, marginBottom: 4},
  acceptedDesc:  {fontSize: 13, color: '#166534', textAlign: 'center'},
  chatBtn:       {borderRadius: 10, backgroundColor: Colors.primaryLight, borderWidth: 1, borderColor: Colors.primary, paddingVertical: 12, alignItems: 'center', marginBottom: 10},
  chatBtnText:   {fontSize: 14, fontWeight: '700', color: Colors.primary},
  withdrawBtn:   {borderWidth: 1, borderColor: '#FCA5A5', backgroundColor: Colors.errorLight, borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginBottom: 10},
  withdrawBtnText:{fontSize: 14, fontWeight: '700', color: Colors.error},
});

const tl = StyleSheet.create({
  row:   {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: Colors.divider},
  label: {fontSize: 13, color: Colors.textSecondary},
  value: {fontSize: 13, color: Colors.textPrimary, textAlign: 'right', flex: 1, paddingLeft: 16},
});

const nc = StyleSheet.create({
  card:  {backgroundColor: Colors.surface, borderRadius: 10, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: Colors.divider},
  label: {fontSize: 11, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4},
  text:  {fontSize: 14, color: Colors.textPrimary, lineHeight: 20},
});

const styles = StyleSheet.create({
  root:      {flex: 1, backgroundColor: Colors.feedBackground},
  center:    {flex: 1, alignItems: 'center', justifyContent: 'center'},
  scroll:    {padding: 14, paddingBottom: 40},
  section:   {marginBottom: 22},
  emptyWrap: {flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 80},
  emptyIcon: {fontSize: 52, marginBottom: 16},
  emptyTitle:{fontSize: 18, fontWeight: '700', color: Colors.textPrimary, marginBottom: 8},
  emptyMsg:  {fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, paddingHorizontal: 24},
});
