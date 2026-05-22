import React, {useCallback, useState} from 'react';
import {
  ActivityIndicator,
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
import {getMyBids, updateFulfillmentStatus} from '../../../api/bids';
import {getRequest} from '../../../api/requests';
import {createRoom} from '../../../api/chat';
import {getMyNotifications, markNotificationRead} from '../../../api/notifications';
import {NotificationItem} from '../../../api/notifications';
import AppHeader from '../../../components/AppHeader';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const ACCENT = '#16A34A';

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

// ─── Notification helpers ─────────────────────────────────────────────────────

function notifIcon(type: string): string {
  if (type === 'NEW_MESSAGE')       return '💬';
  if (type === 'BID_ACCEPTED')      return '🎉';
  if (type === 'DELIVERY_CONFIRMED') return '✅';
  return '🔔';
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1)   return 'just now';
  if (mins < 60)  return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)   return `${hrs}h ago`;
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
  onViewRequest: (requestId: string) => void;
}

function PendingCard({bid, request, onViewRequest}: PendingCardProps) {
  return (
    <View style={pc.wrap}>
      <TouchableOpacity style={pc.row} onPress={() => onViewRequest(bid.requestId)} activeOpacity={0.8}>
        <View style={pc.left}>
          <Text style={pc.title} numberOfLines={2}>
            {request?.title ?? `Request #${bid.requestId.slice(-6)}`}
          </Text>
          <Text style={pc.meta}>
            ${parseFloat(bid.amount).toFixed(2)} · {bid.deliveryDays}d · Pending
          </Text>
        </View>
        <View style={[pc.statusDot, {backgroundColor: '#FCD34D'}]} />
      </TouchableOpacity>

      {/* Messaging only unlocked after bid is accepted */}
      <View style={pc.waitNote}>
        <Text style={pc.waitText}>⏳ Waiting for buyer to accept your bid</Text>
      </View>

      <View style={pc.actions}>
        <TouchableOpacity style={pc.viewBtn} onPress={() => onViewRequest(bid.requestId)} activeOpacity={0.8}>
          <Text style={pc.viewBtnText}>View Request →</Text>
        </TouchableOpacity>
      </View>
    </View>
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

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function MerchantActivityScreen() {
  const navigation = useNavigation<Nav>();

  const [activeBids,  setActiveBids]  = useState<Bid[]>([]);
  const [pendingBids, setPendingBids] = useState<Bid[]>([]);
  const [requestMap,  setRequestMap]  = useState<Record<string, MarketRequest>>({});
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);

  const [updatingBidId, setUpdatingBidId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [bidsRes, notifsRes] = await Promise.all([
        getMyBids({limit: 100}),
        getMyNotifications({limit: 20}),
      ]);

      const all = bidsRes.bids;
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
      setActiveBids(prev => prev.map(b =>
        b.id === bidId ? {...b, fulfillmentStatus: next} : b,
      ));
    } catch {
      // silently ignore
    } finally {
      setUpdatingBidId(null);
    }
  }, []);

  const openChat = useCallback(async (bid: Bid, request: MarketRequest | undefined) => {
    if (bid.chatRoomId) {
      navigation.navigate('ChatRoom', {
        roomId: bid.chatRoomId,
        roomName: request?.title ?? 'Buyer',
      });
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

  const handleNotifPress = useCallback(async (item: NotificationItem) => {
    if (!item.isRead) markNotificationRead(item.id).catch(() => {});
    if (item.data?.chatRoomId) {
      navigation.navigate('ChatRoom', {roomId: item.data.chatRoomId, roomName: 'Buyer'});
    } else if (item.data?.bidId) {
      navigation.navigate('BidDetail', {bidId: item.data.bidId});
    }
  }, [navigation]);

  const empty = !loading && activeBids.length === 0 && pendingBids.length === 0 && notifications.length === 0;

  return (
    <View style={styles.root}>
      <AppHeader accentColor={ACCENT} />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={ACCENT} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={ACCENT} colors={[ACCENT]} />
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
                  onViewRequest={handleViewRequest}
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
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const sh = StyleSheet.create({
  row:       {flexDirection: 'row', alignItems: 'center', marginBottom: 10},
  title:     {fontSize: 15, fontWeight: '700', color: '#374151', flex: 1},
  badge:     {backgroundColor: ACCENT, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2},
  badgeText: {fontSize: 12, color: '#FFF', fontWeight: '700'},
});

const fb = StyleSheet.create({
  wrap:       {flexDirection: 'row', alignItems: 'center', marginVertical: 12},
  dot:        {width: 12, height: 12, borderRadius: 6, backgroundColor: '#D1D5DB', alignItems: 'center', justifyContent: 'center'},
  dotActive:  {backgroundColor: ACCENT},
  check:      {fontSize: 7, color: '#FFF', fontWeight: '800'},
  line:       {flex: 1, height: 2, backgroundColor: '#D1D5DB'},
  lineActive: {backgroundColor: ACCENT},
});

const oc = StyleSheet.create({
  wrap:     {backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3},
  top:      {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8},
  tag:      {backgroundColor: '#DCFCE7', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3},
  tagText:  {fontSize: 10, fontWeight: '800', color: ACCENT, letterSpacing: 0.5},
  status:   {fontSize: 12, fontWeight: '600', color: '#6B7280'},
  title:    {fontSize: 16, fontWeight: '700', color: '#111827', lineHeight: 22, marginBottom: 4},
  meta:     {fontSize: 13, color: '#6B7280', marginBottom: 4},
  actions:  {gap: 8, marginTop: 4},
  btn:      {borderRadius: 10, paddingVertical: 11, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center'},
  btnPrimary:     {backgroundColor: ACCENT},
  btnPrimaryText: {color: '#FFF', fontWeight: '700', fontSize: 14},
  btnSecondary:     {backgroundColor: '#F0FDF4', borderWidth: 1, borderColor: '#BBF7D0'},
  btnSecondaryText: {color: ACCENT, fontWeight: '600', fontSize: 14},
  btnDisabled:   {opacity: 0.6},
  btnWaiting:    {backgroundColor: '#FEF3C7'},
  btnWaitingText:{color: '#92400E', fontWeight: '600', fontSize: 13, textAlign: 'center'},
  btnDone:       {backgroundColor: '#DCFCE7'},
  btnDoneText:   {color: '#15803D', fontWeight: '700', fontSize: 14, textAlign: 'center'},
  btnOutline:    {backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E5E7EB'},
  btnOutlineText:{color: '#374151', fontWeight: '600', fontSize: 13},
});

const pc = StyleSheet.create({
  wrap:      {backgroundColor: '#FFF', borderRadius: 16, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2},
  row:       {flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10},
  left:      {flex: 1},
  title:     {fontSize: 15, fontWeight: '700', color: '#111827', lineHeight: 20, marginBottom: 3},
  meta:      {fontSize: 12, color: '#6B7280'},
  statusDot: {width: 10, height: 10, borderRadius: 5, marginTop: 4, marginLeft: 8},
  actions:   {flexDirection: 'row', gap: 8},
  msgBtn:    {flex: 1, borderRadius: 9, paddingVertical: 9, backgroundColor: '#F0FDF4', borderWidth: 1, borderColor: '#BBF7D0', alignItems: 'center'},
  msgBtnText:{fontSize: 13, fontWeight: '600', color: ACCENT},
  replyBtn:  {flex: 1, borderRadius: 9, paddingVertical: 9, backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#BFDBFE', alignItems: 'center'},
  replyBtnText:{fontSize: 13, fontWeight: '600', color: '#2563EB'},
  replyBox:  {marginTop: 10, gap: 8},
  input:     {borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, padding: 10, fontSize: 14, color: '#111827', minHeight: 72, textAlignVertical: 'top'},
  chips:     {flexDirection: 'row', gap: 6, flexWrap: 'wrap'},
  chip:      {borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: '#F3F4F6'},
  chipText:  {fontSize: 12, color: '#374151'},
  waitNote:  {backgroundColor: '#FEF9C3', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7, marginBottom: 10},
  waitText:  {fontSize: 12, color: '#92400E', fontWeight: '500'},
  viewBtn:   {flex: 1, borderRadius: 9, paddingVertical: 9, backgroundColor: '#F3F4F6', alignItems: 'center'},
  viewBtnText:{fontSize: 13, fontWeight: '600', color: '#374151'},
});

const ar = StyleSheet.create({
  wrap:  {flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#FFF', borderRadius: 14, padding: 12, marginBottom: 8, shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1},
  icon:  {fontSize: 22, marginRight: 12, width: 30, textAlign: 'center'},
  body:  {flex: 1},
  title: {fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 2},
  msg:   {fontSize: 13, color: '#6B7280', marginBottom: 3},
  time:  {fontSize: 11, color: '#9CA3AF'},
  dot:   {width: 9, height: 9, borderRadius: 5, backgroundColor: '#2563EB', marginTop: 4, marginLeft: 6},
});

const styles = StyleSheet.create({
  root:      {flex: 1, backgroundColor: '#F9FAFB'},
  center:    {flex: 1, alignItems: 'center', justifyContent: 'center'},
  scroll:    {padding: 14, paddingBottom: 40},
  section:   {marginBottom: 22},
  emptyWrap: {flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 80},
  emptyIcon: {fontSize: 52, marginBottom: 16},
  emptyTitle:{fontSize: 18, fontWeight: '700', color: '#374151', marginBottom: 8},
  emptyMsg:  {fontSize: 14, color: '#9CA3AF', textAlign: 'center', lineHeight: 22, paddingHorizontal: 24},
});
