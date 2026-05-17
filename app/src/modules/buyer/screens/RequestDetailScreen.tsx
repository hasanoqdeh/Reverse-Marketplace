import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../../types/navigation';
import {Bid, MarketRequest} from '../../../types/api';
import {cancelRequest, getRequest} from '../../../api/requests';
import {acceptBid, confirmDelivery, getRequestBids} from '../../../api/bids';
import {getMerchantProfile} from '../../../api/reviews';
import {useAuth} from '../../../context/AuthContext';

type MerchantStats = {avgRating: number | null; reviewCount: number; completedBids: number};
type Props = NativeStackScreenProps<RootStackParamList, 'RequestDetail'>;

const BUYER_ACCENT    = '#2563EB';
const MERCHANT_ACCENT = '#16A34A';

const STATUS_META: Record<string, {label: string; bg: string; text: string}> = {
  DRAFT:     {label: 'Draft',     bg: '#F3F4F6', text: '#6B7280'},
  ACTIVE:    {label: 'Active',    bg: '#DCFCE7', text: '#16A34A'},
  HAS_BIDS:  {label: 'Has Bids', bg: '#DBEAFE', text: '#2563EB'},
  COMPLETED: {label: 'Completed', bg: '#F0FDF4', text: '#15803D'},
  CANCELLED: {label: 'Cancelled', bg: '#FEF2F2', text: '#DC2626'},
  EXPIRED:   {label: 'Expired',   bg: '#FEF3C7', text: '#D97706'},
};

function formatBudget(min?: number | null, max?: number | null): string {
  if (!min && !max) return 'Open budget';
  if (min && max) return `$${Number(min).toLocaleString()} – $${Number(max).toLocaleString()}`;
  if (max) return `Up to $${Number(max).toLocaleString()}`;
  return `From $${Number(min!).toLocaleString()}`;
}
function formatDate(iso?: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'});
}
function starsDisplay(rating: number | null): string {
  if (rating === null) return '★ New';
  return '★ ' + rating.toFixed(1);
}

// ─── Smart badge logic ────────────────────────────────────────────────────────

type Badge = {label: string; color: string; bg: string};

function computeBadges(
  bid: Bid,
  bids: Bid[],
  statsMap: Record<string, MerchantStats>,
): Badge[] {
  const pending = bids.filter(b => b.status === 'PENDING');
  const amounts = pending.map(b => parseFloat(b.amount));
  const days    = pending.map(b => b.deliveryDays);
  const myAmt   = parseFloat(bid.amount);
  const badges: Badge[] = [];

  if (pending.length > 1) {
    if (myAmt === Math.min(...amounts))
      badges.push({label: '🏆 Best Value', color: '#854D0E', bg: '#FEF3C7'});
    if (bid.deliveryDays === Math.min(...days))
      badges.push({label: '⚡ Fastest',    color: '#1D4ED8', bg: '#DBEAFE'});
    const ratings = pending
      .map(b => statsMap[b.merchantId]?.avgRating ?? null)
      .filter(r => r !== null) as number[];
    const myRating = statsMap[bid.merchantId]?.avgRating ?? null;
    if (myRating !== null && ratings.length > 1 && myRating === Math.max(...ratings))
      badges.push({label: '⭐ Top Rated',  color: '#15803D', bg: '#DCFCE7'});
  }
  return badges;
}

// ─── Main screen ─────────────────────────────────────────────────────────────

export default function RequestDetailScreen({route, navigation}: Props) {
  const {requestId} = route.params;
  const {user} = useAuth();
  const insets = useSafeAreaInsets();
  const isBuyer  = user?.role === 'BUYER';
  const ACCENT   = isBuyer ? BUYER_ACCENT : MERCHANT_ACCENT;

  const [request,         setRequest]         = useState<MarketRequest | null>(null);
  const [bids,            setBids]            = useState<Bid[]>([]);
  const [acceptedBid,     setAcceptedBid]     = useState<Bid | null>(null);
  const [merchantStatsMap,setMerchantStatsMap]= useState<Record<string, MerchantStats>>({});
  const [marketAnalysis,  setMarketAnalysis]  = useState<{totalBids: number; lowestAmount: number | null; averageAmount: number | null} | null>(null);
  const [loading,         setLoading]         = useState(true);
  const [actionLoading,   setActionLoading]   = useState(false);

  // Sheet state
  const [sheetBid, setSheetBid] = useState<Bid | null>(null);
  const sheetAnim = useRef(new Animated.Value(0)).current;

  const openSheet = useCallback((bid: Bid) => {
    setSheetBid(bid);
    Animated.spring(sheetAnim, {toValue: 1, useNativeDriver: true, tension: 65, friction: 11}).start();
  }, [sheetAnim]);

  const closeSheet = useCallback(() => {
    Animated.timing(sheetAnim, {toValue: 0, duration: 200, useNativeDriver: true}).start(
      () => setSheetBid(null),
    );
  }, [sheetAnim]);

  const load = useCallback(async () => {
    try {
      const data = await getRequest(requestId);
      setRequest(data);
      if (user?.id === data.buyerId && ['ACTIVE', 'HAS_BIDS', 'COMPLETED'].includes(data.status)) {
        const bidsRes = await getRequestBids(requestId, {limit: 50, sortBy: 'amount', sortOrder: 'asc'});
        setBids(bidsRes.bids);
        setMarketAnalysis(bidsRes.marketAnalysis);
        setAcceptedBid(bidsRes.bids.find(b => b.status === 'ACCEPTED') ?? null);
        const ids = [...new Set(bidsRes.bids.map(b => b.merchantId))];
        const entries = await Promise.all(ids.map(async id => {
          try {
            const p = await getMerchantProfile(id);
            return [id, {avgRating: p.avgRating, reviewCount: p.reviewCount, completedBids: p.completedBids}] as const;
          } catch { return null; }
        }));
        const map: Record<string, MerchantStats> = {};
        entries.forEach(e => { if (e) map[e[0]] = e[1]; });
        setMerchantStatsMap(map);
      }
    } catch {
      Alert.alert('Error', 'Could not load request.', [{text: 'OK', onPress: () => navigation.goBack()}]);
    } finally {
      setLoading(false);
    }
  }, [requestId, navigation, user?.id]);

  useEffect(() => { load(); }, [load]);

  const handleCancel = useCallback(() => {
    Alert.alert('Cancel Request', 'Are you sure?', [
      {text: 'No'},
      {
        text: 'Yes, Cancel', style: 'destructive',
        onPress: async () => {
          setActionLoading(true);
          try {
            await cancelRequest(requestId, 'Buyer cancelled');
            navigation.goBack();
          } catch { Alert.alert('Error', 'Could not cancel request.'); }
          finally { setActionLoading(false); }
        },
      },
    ]);
  }, [requestId, navigation]);

  const handleAcceptBid = useCallback(async (bid: Bid) => {
    Alert.alert(
      'Accept this bid?',
      `$${parseFloat(bid.amount).toFixed(2)} · ${bid.deliveryDays}-day delivery\n\nAll other bids will be closed.`,
      [
        {text: 'Not yet'},
        {
          text: 'Accept', onPress: async () => {
            setActionLoading(true);
            closeSheet();
            try {
              await acceptBid(bid.id);
              await load();
            } catch (err: any) {
              Alert.alert('Error', err?.response?.data?.message ?? 'Failed to accept bid.');
            } finally { setActionLoading(false); }
          },
        },
      ],
    );
  }, [closeSheet, load]);

  const handleOpenChat = useCallback((bid: Bid) => {
    if (!bid.chatRoomId) return;
    closeSheet();
    setTimeout(() => {
      navigation.navigate('ChatRoom', {roomId: bid.chatRoomId!, roomName: 'Merchant Chat'});
    }, 220);
  }, [closeSheet, navigation]);

  if (loading) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.center}><ActivityIndicator size="large" color={ACCENT} /></View>
      </SafeAreaView>
    );
  }
  if (!request) return null;

  const statusMeta = STATUS_META[request.status] ?? STATUS_META.ACTIVE;
  const isOwner    = user?.id === request.buyerId;
  const canCancel  = isOwner && ['ACTIVE', 'HAS_BIDS', 'DRAFT'].includes(request.status);
  const showBids   = isOwner && ['ACTIVE', 'HAS_BIDS'].includes(request.status);
  const pending    = bids.filter(b => b.status === 'PENDING');

  return (
    <View style={[s.root, {paddingTop: insets.top}]}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}>
          <Text style={s.backBtn}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle} numberOfLines={1}>Request</Text>
        <View style={{width: 28}} />
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Status + category */}
        <View style={s.topRow}>
          <View style={[s.statusBadge, {backgroundColor: statusMeta.bg}]}>
            <Text style={[s.statusText, {color: statusMeta.text}]}>{statusMeta.label}</Text>
          </View>
          {request.category && (
            <Text style={[s.categoryPill, {color: ACCENT}]}>{request.category.name}</Text>
          )}
        </View>

        <Text style={s.title}>{request.title}</Text>

        {/* Meta chips */}
        <View style={s.metaRow}>
          <MetaChip icon="👁" label={`${request.viewCount}`} />
          <MetaChip icon="📋" label={`${request.bidCount} bids`} />
          {request.expiresAt && <MetaChip icon="⏰" label={`Exp. ${formatDate(request.expiresAt)}`} />}
          <MetaChip icon="💰" label={formatBudget(request.budgetMin, request.budgetMax)} />
        </View>

        {/* Description */}
        <View style={s.descCard}>
          <Text style={s.descText}>{request.description}</Text>
        </View>

        {/* Dates */}
        <View style={s.datesRow}>
          <View style={s.dateBox}>
            <Text style={s.dateLabel}>Posted</Text>
            <Text style={s.dateValue}>{formatDate(request.publishedAt ?? request.createdAt)}</Text>
          </View>
          {request.expiresAt && (
            <View style={s.dateBox}>
              <Text style={s.dateLabel}>Expires</Text>
              <Text style={s.dateValue}>{formatDate(request.expiresAt)}</Text>
            </View>
          )}
        </View>

        {/* Merchant CTA */}
        {!isBuyer && ['ACTIVE', 'HAS_BIDS'].includes(request.status) && (
          <TouchableOpacity
            style={s.merchantCTA}
            onPress={() => navigation.navigate('SubmitBid', {requestId: request.id, requestTitle: request.title})}
            activeOpacity={0.8}>
            <Text style={s.ctaTitle}>Interested?</Text>
            <Text style={s.ctaDesc}>Submit your best offer — the buyer is comparing proposals.</Text>
            <View style={s.ctaBtn}><Text style={s.ctaBtnText}>Submit Bid →</Text></View>
          </TouchableOpacity>
        )}

        {/* ── Proposals section ───────────────────────────── */}
        {showBids && (
          <View style={s.proposalsSection}>
            {/* Section header */}
            <View style={s.proposalsHeader}>
              <Text style={s.proposalsTitle}>
                {pending.length > 0 ? `${pending.length} Proposal${pending.length !== 1 ? 's' : ''}` : 'Proposals'}
              </Text>
              {marketAnalysis && marketAnalysis.totalBids > 0 && (
                <View style={s.marketRow}>
                  {marketAnalysis.lowestAmount != null && (
                    <Text style={s.marketStat}>From <Text style={s.marketStatBold}>${marketAnalysis.lowestAmount.toFixed(0)}</Text></Text>
                  )}
                  {marketAnalysis.averageAmount != null && (
                    <Text style={s.marketStat}>Avg <Text style={s.marketStatBold}>${marketAnalysis.averageAmount.toFixed(0)}</Text></Text>
                  )}
                </View>
              )}
            </View>

            {bids.length === 0 ? (
              <View style={s.emptyBids}>
                <Text style={s.emptyIcon}>📬</Text>
                <Text style={s.emptyTitle}>No proposals yet</Text>
                <Text style={s.emptyDesc}>Merchants will start sending offers soon.</Text>
              </View>
            ) : (
              bids.map((bid, idx) => (
                <ProposalCard
                  key={bid.id}
                  bid={bid}
                  index={idx}
                  badges={bid.status === 'PENDING' ? computeBadges(bid, bids, merchantStatsMap) : []}
                  stats={merchantStatsMap[bid.merchantId]}
                  onPress={() => openSheet(bid)}
                />
              ))
            )}
          </View>
        )}

        {/* Fulfillment tracking */}
        {isBuyer && acceptedBid && (
          <FulfillmentCard
            bid={acceptedBid}
            onConfirm={async () => {
              setActionLoading(true);
              try {
                await confirmDelivery(acceptedBid.id);
                Alert.alert('Delivery Confirmed!', 'Would you like to leave a review?', [
                  {text: 'Skip', onPress: () => load()},
                  {
                    text: 'Leave Review',
                    onPress: () => {
                      load();
                      navigation.navigate('RateTransaction', {
                        bidId: acceptedBid.id,
                        revieweeId: acceptedBid.merchantId,
                        revieweeType: 'MERCHANT',
                        revieweeName: `Merchant`,
                      });
                    },
                  },
                ]);
              } catch (err: any) {
                Alert.alert('Error', err?.response?.data?.message ?? 'Failed to confirm delivery.');
              } finally { setActionLoading(false); }
            }}
            onOpenChat={() => handleOpenChat(acceptedBid)}
            confirmLoading={actionLoading}
          />
        )}
      </ScrollView>

      {/* Cancel bar */}
      {isBuyer && canCancel && (
        <View style={[s.cancelBar, {paddingBottom: insets.bottom + 8}]}>
          <TouchableOpacity
            style={s.cancelBtn}
            onPress={handleCancel}
            disabled={actionLoading}
            activeOpacity={0.8}>
            <Text style={s.cancelBtnText}>Cancel Request</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Bid detail bottom sheet ─────────────────────── */}
      {sheetBid && (
        <BidSheet
          bid={sheetBid}
          stats={merchantStatsMap[sheetBid.merchantId]}
          badges={sheetBid.status === 'PENDING' ? computeBadges(sheetBid, bids, merchantStatsMap) : []}
          onClose={closeSheet}
          onAccept={() => handleAcceptBid(sheetBid)}
          onChat={() => handleOpenChat(sheetBid)}
          onViewMerchant={() => {
            closeSheet();
            setTimeout(() => navigation.navigate('MerchantStore', {merchantId: sheetBid.merchantId}), 220);
          }}
          acceptLoading={actionLoading}
          insets={insets}
          anim={sheetAnim}
        />
      )}
    </View>
  );
}

// ─── Proposal card ────────────────────────────────────────────────────────────

function ProposalCard({bid, index, badges, stats, onPress}: {
  bid: Bid;
  index: number;
  badges: Badge[];
  stats?: MerchantStats;
  onPress: () => void;
}) {
  const isAccepted  = bid.status === 'ACCEPTED';
  const isPending   = bid.status === 'PENDING';
  const isRejected  = bid.status === 'REJECTED' || bid.status === 'WITHDRAWN' || bid.status === 'EXPIRED';
  const initial     = String.fromCharCode(65 + (index % 26));
  const avatarColor = PALETTE[index % PALETTE.length];

  return (
    <TouchableOpacity
      style={[pc.card, isAccepted && pc.cardAccepted, isRejected && pc.cardMuted]}
      onPress={onPress}
      activeOpacity={0.75}>
      {/* Accepted banner */}
      {isAccepted && (
        <View style={pc.acceptedBanner}>
          <Text style={pc.acceptedBannerText}>✓  Accepted Proposal</Text>
        </View>
      )}

      {/* Badges row */}
      {badges.length > 0 && (
        <View style={pc.badgeRow}>
          {badges.map(b => (
            <View key={b.label} style={[pc.badge, {backgroundColor: b.bg}]}>
              <Text style={[pc.badgeText, {color: b.color}]}>{b.label}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Merchant row */}
      <View style={pc.merchantRow}>
        <View style={[pc.avatar, {backgroundColor: avatarColor + '22', borderColor: avatarColor + '44'}]}>
          <Text style={[pc.avatarText, {color: avatarColor}]}>{initial}</Text>
        </View>
        <View style={pc.merchantMeta}>
          <Text style={[pc.merchantName, isRejected && pc.mutedText]}>Merchant {initial}</Text>
          {stats ? (
            <Text style={pc.rating}>
              {starsDisplay(stats.avgRating)}
              {stats.reviewCount > 0 ? ` (${stats.reviewCount})` : ''}
              {stats.completedBids > 0 ? `  ·  ${stats.completedBids} done` : ''}
            </Text>
          ) : (
            <Text style={pc.rating}>New seller</Text>
          )}
        </View>
        {!isPending && (
          <View style={[pc.statusPill, BID_STATUS_PILL[bid.status] ?? BID_STATUS_PILL.PENDING]}>
            <Text style={pc.statusPillText}>{bid.status.charAt(0) + bid.status.slice(1).toLowerCase()}</Text>
          </View>
        )}
      </View>

      {/* Price + delivery */}
      <View style={pc.priceRow}>
        <Text style={[pc.price, isRejected && pc.mutedText]}>
          ${parseFloat(bid.amount).toFixed(2)}
        </Text>
        <View style={[pc.deliveryPill, isAccepted && pc.deliveryPillAccepted]}>
          <Text style={[pc.deliveryText, isAccepted && pc.deliveryTextAccepted]}>
            ⚡ {bid.deliveryDays}d delivery
          </Text>
        </View>
      </View>

      {/* Notes preview */}
      {bid.deliveryNotes ? (
        <Text style={[pc.notesPreview, isRejected && pc.mutedText]} numberOfLines={1}>
          "{bid.deliveryNotes}"
        </Text>
      ) : null}

      {/* Tap hint */}
      {isPending && (
        <Text style={pc.tapHint}>Tap to explore this proposal  ›</Text>
      )}
      {isAccepted && bid.chatRoomId && (
        <Text style={pc.tapHint}>Tap to open chat  ›</Text>
      )}
    </TouchableOpacity>
  );
}

// ─── Bid detail bottom sheet ──────────────────────────────────────────────────

function BidSheet({bid, stats, badges, onClose, onAccept, onChat, onViewMerchant, acceptLoading, insets, anim}: {
  bid: Bid;
  stats?: MerchantStats;
  badges: Badge[];
  onClose: () => void;
  onAccept: () => void;
  onChat: () => void;
  onViewMerchant: () => void;
  acceptLoading: boolean;
  insets: {bottom: number};
  anim: Animated.Value;
}) {
  const isPending  = bid.status === 'PENDING';
  const isAccepted = bid.status === 'ACCEPTED';
  const translateY = anim.interpolate({inputRange: [0, 1], outputRange: [600, 0]});

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[bs.overlay, {opacity: anim}]} />
      </TouchableWithoutFeedback>

      <Animated.View style={[bs.sheet, {transform: [{translateY}], paddingBottom: insets.bottom + 20}]}>
        {/* Handle */}
        <View style={bs.handle} />

        {/* Merchant header */}
        <TouchableOpacity style={bs.merchantHeader} onPress={onViewMerchant} activeOpacity={0.75}>
          <View style={bs.bigAvatar}>
            <Text style={bs.bigAvatarText}>{bid.merchantId.slice(0, 2).toUpperCase()}</Text>
          </View>
          <View style={bs.merchantMetaBlock}>
            <Text style={bs.merchantNameLg}>Merchant {bid.merchantId.slice(0, 6)}…</Text>
            {stats ? (
              <Text style={bs.merchantRating}>
                {starsDisplay(stats.avgRating)}
                {stats.reviewCount > 0 ? `  ·  ${stats.reviewCount} reviews` : ''}
                {stats.completedBids > 0 ? `  ·  ${stats.completedBids} completed` : ''}
              </Text>
            ) : (
              <Text style={bs.merchantRating}>New seller</Text>
            )}
          </View>
          <Text style={bs.viewProfile}>View ›</Text>
        </TouchableOpacity>

        {/* Badges */}
        {badges.length > 0 && (
          <View style={bs.badgeRow}>
            {badges.map(b => (
              <View key={b.label} style={[bs.badge, {backgroundColor: b.bg}]}>
                <Text style={[bs.badgeText, {color: b.color}]}>{b.label}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Price + delivery */}
        <View style={bs.priceBlock}>
          <Text style={bs.bigPrice}>${parseFloat(bid.amount).toFixed(2)}</Text>
          <View style={bs.deliveryBadge}>
            <Text style={bs.deliveryBadgeText}>⚡ {bid.deliveryDays}-day delivery</Text>
          </View>
        </View>

        {/* Notes */}
        {bid.deliveryNotes ? (
          <View style={bs.notesCard}>
            <Text style={bs.notesLabel}>Merchant's notes</Text>
            <Text style={bs.notesText}>{bid.deliveryNotes}</Text>
          </View>
        ) : null}

        {/* Actions */}
        <View style={bs.actions}>
          {bid.chatRoomId && (
            <TouchableOpacity style={bs.chatBtn} onPress={onChat} activeOpacity={0.8}>
              <Text style={bs.chatBtnText}>💬  Chat First</Text>
            </TouchableOpacity>
          )}
          {isPending && (
            <TouchableOpacity
              style={[bs.acceptBtn, acceptLoading && bs.btnDisabled]}
              onPress={onAccept}
              disabled={acceptLoading}
              activeOpacity={0.8}>
              {acceptLoading
                ? <ActivityIndicator color="#fff" />
                : <Text style={bs.acceptBtnText}>Accept This Bid</Text>}
            </TouchableOpacity>
          )}
          {isAccepted && (
            <View style={bs.acceptedState}>
              <Text style={bs.acceptedStateText}>✓  This proposal was accepted</Text>
            </View>
          )}
        </View>
      </Animated.View>
    </Modal>
  );
}

// ─── Fulfillment card ─────────────────────────────────────────────────────────

const FULFILLMENT_LABELS: Record<string, {label: string; icon: string}> = {
  AWAITING:   {label: 'Awaiting merchant',         icon: '⏳'},
  PREPARING:  {label: 'Merchant is preparing',     icon: '📦'},
  IN_DELIVERY:{label: 'Out for delivery',          icon: '🚚'},
  DELIVERED:  {label: 'Delivered — confirm receipt',icon: '📬'},
  CONFIRMED:  {label: 'Delivery confirmed',        icon: '✅'},
};

function FulfillmentCard({bid, onConfirm, onOpenChat, confirmLoading}: {
  bid: Bid; onConfirm: () => void; onOpenChat: () => void; confirmLoading: boolean;
}) {
  const fs    = bid.fulfillmentStatus;
  const meta  = fs ? (FULFILLMENT_LABELS[fs] ?? {label: 'Processing', icon: '🔄'}) : {label: 'Processing', icon: '🔄'};
  const steps = ['AWAITING', 'PREPARING', 'IN_DELIVERY', 'DELIVERED', 'CONFIRMED'];
  const step  = fs ? Math.max(0, steps.indexOf(fs)) : 0;

  return (
    <View style={ff.card}>
      <Text style={ff.title}>Fulfillment</Text>

      {/* Progress bar */}
      <View style={ff.progressTrack}>
        {steps.map((_, i) => (
          <React.Fragment key={i}>
            <View style={[ff.progressDot, i <= step && ff.progressDotDone]} />
            {i < steps.length - 1 && (
              <View style={[ff.progressLine, i < step && ff.progressLineDone]} />
            )}
          </React.Fragment>
        ))}
      </View>

      <Text style={ff.statusIcon}>{meta.icon}</Text>
      <Text style={ff.statusLabel}>{meta.label}</Text>

      {fs === 'DELIVERED' && (
        <TouchableOpacity
          style={[ff.confirmBtn, confirmLoading && ff.btnDisabled]}
          onPress={onConfirm}
          disabled={confirmLoading}
          activeOpacity={0.8}>
          {confirmLoading
            ? <ActivityIndicator color="#fff" />
            : <Text style={ff.confirmText}>Confirm Receipt</Text>}
        </TouchableOpacity>
      )}

      {fs !== 'CONFIRMED' && bid.chatRoomId && (
        <TouchableOpacity style={ff.chatBtn} onPress={onOpenChat} activeOpacity={0.8}>
          <Text style={ff.chatText}>💬  Chat with Merchant</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Small components ─────────────────────────────────────────────────────────

function MetaChip({icon, label}: {icon: string; label: string}) {
  return (
    <View style={mc.chip}>
      <Text style={mc.icon}>{icon}</Text>
      <Text style={mc.label}>{label}</Text>
    </View>
  );
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PALETTE = ['#2563EB', '#16A34A', '#D97706', '#9333EA', '#DC2626', '#0891B2'];

const BID_STATUS_PILL: Record<string, object> = {
  PENDING:   {backgroundColor: '#FEF9C3'},
  ACCEPTED:  {backgroundColor: '#DCFCE7'},
  REJECTED:  {backgroundColor: '#FEF2F2'},
  EXPIRED:   {backgroundColor: '#FEF3C7'},
  WITHDRAWN: {backgroundColor: '#F3F4F6'},
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const mc = StyleSheet.create({
  chip:  {flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 8, paddingHorizontal: 9, paddingVertical: 5, gap: 4},
  icon:  {fontSize: 13},
  label: {fontSize: 12, color: '#6B7280', fontWeight: '500'},
});

const pc = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 10,
    borderWidth: 1.5, borderColor: '#E5E7EB',
    shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  cardAccepted: {borderColor: '#16A34A', backgroundColor: '#F0FDF4'},
  cardMuted:    {opacity: 0.55},
  acceptedBanner: {
    backgroundColor: '#16A34A', borderRadius: 8, paddingVertical: 5, paddingHorizontal: 10,
    alignSelf: 'flex-start', marginBottom: 10,
  },
  acceptedBannerText: {fontSize: 12, fontWeight: '700', color: '#FFFFFF'},
  badgeRow:    {flexDirection: 'row', gap: 6, marginBottom: 10, flexWrap: 'wrap'},
  badge:       {borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4},
  badgeText:   {fontSize: 11, fontWeight: '700'},
  merchantRow: {flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10},
  avatar: {
    width: 38, height: 38, borderRadius: 19, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText:    {fontSize: 14, fontWeight: '800'},
  merchantMeta:  {flex: 1},
  merchantName:  {fontSize: 14, fontWeight: '700', color: '#111827'},
  rating:        {fontSize: 12, color: '#F59E0B', marginTop: 1},
  mutedText:     {color: '#9CA3AF'},
  statusPill:    {borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3},
  statusPillText:{fontSize: 11, fontWeight: '700', color: '#6B7280'},
  priceRow:      {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6},
  price:         {fontSize: 26, fontWeight: '800', color: '#111827'},
  deliveryPill:  {backgroundColor: '#F3F4F6', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5},
  deliveryPillAccepted: {backgroundColor: '#DCFCE7'},
  deliveryText:  {fontSize: 12, fontWeight: '600', color: '#6B7280'},
  deliveryTextAccepted: {color: '#15803D'},
  notesPreview:  {fontSize: 13, color: '#9CA3AF', fontStyle: 'italic', marginBottom: 6},
  tapHint:       {fontSize: 12, color: '#93C5FD', fontWeight: '500', marginTop: 4, textAlign: 'right'},
});

const bs = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingTop: 12,
    shadowColor: '#000', shadowOffset: {width: 0, height: -4}, shadowOpacity: 0.12, shadowRadius: 20, elevation: 24,
  },
  handle:        {width: 40, height: 4, borderRadius: 2, backgroundColor: '#D1D5DB', alignSelf: 'center', marginBottom: 20},
  merchantHeader:{flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16},
  bigAvatar:     {width: 52, height: 52, borderRadius: 26, backgroundColor: '#DBEAFE', alignItems: 'center', justifyContent: 'center'},
  bigAvatarText: {fontSize: 18, fontWeight: '800', color: BUYER_ACCENT},
  merchantMetaBlock: {flex: 1},
  merchantNameLg:{fontSize: 16, fontWeight: '700', color: '#111827'},
  merchantRating:{fontSize: 13, color: '#F59E0B', marginTop: 2},
  viewProfile:   {fontSize: 13, color: '#9CA3AF'},
  badgeRow:      {flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: 16},
  badge:         {borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5},
  badgeText:     {fontSize: 12, fontWeight: '700'},
  priceBlock:    {flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16},
  bigPrice:      {fontSize: 36, fontWeight: '800', color: '#111827'},
  deliveryBadge: {backgroundColor: '#F3F4F6', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7},
  deliveryBadgeText: {fontSize: 13, fontWeight: '600', color: '#374151'},
  notesCard:     {backgroundColor: '#F9FAFB', borderRadius: 12, padding: 14, marginBottom: 20, borderWidth: 1, borderColor: '#E5E7EB'},
  notesLabel:    {fontSize: 11, fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6},
  notesText:     {fontSize: 15, color: '#374151', lineHeight: 22},
  actions:       {gap: 10},
  chatBtn: {
    borderRadius: 14, borderWidth: 1.5, borderColor: '#BFDBFE',
    backgroundColor: '#EFF6FF', paddingVertical: 14, alignItems: 'center',
  },
  chatBtnText:   {fontSize: 15, fontWeight: '700', color: BUYER_ACCENT},
  acceptBtn: {
    borderRadius: 14, backgroundColor: BUYER_ACCENT,
    paddingVertical: 16, alignItems: 'center',
    shadowColor: BUYER_ACCENT, shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  acceptBtnText: {fontSize: 16, fontWeight: '700', color: '#FFFFFF'},
  acceptedState: {backgroundColor: '#F0FDF4', borderRadius: 14, borderWidth: 1, borderColor: '#BBF7D0', paddingVertical: 14, alignItems: 'center'},
  acceptedStateText: {fontSize: 15, fontWeight: '700', color: '#15803D'},
  btnDisabled:   {opacity: 0.6},
});

const ff = StyleSheet.create({
  card: {
    backgroundColor: '#FFFBEB', borderRadius: 16, padding: 18, marginTop: 16,
    borderWidth: 1, borderColor: '#FDE68A',
  },
  title:          {fontSize: 12, fontWeight: '700', color: '#92400E', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14},
  progressTrack:  {flexDirection: 'row', alignItems: 'center', marginBottom: 16},
  progressDot:    {width: 10, height: 10, borderRadius: 5, backgroundColor: '#E5E7EB'},
  progressDotDone:{backgroundColor: '#D97706'},
  progressLine:   {flex: 1, height: 2, backgroundColor: '#E5E7EB'},
  progressLineDone:{backgroundColor: '#D97706'},
  statusIcon:     {fontSize: 28, textAlign: 'center', marginBottom: 6},
  statusLabel:    {fontSize: 15, fontWeight: '600', color: '#92400E', textAlign: 'center', marginBottom: 16},
  confirmBtn:     {backgroundColor: '#15803D', borderRadius: 12, paddingVertical: 13, alignItems: 'center', marginBottom: 10},
  confirmText:    {fontSize: 15, fontWeight: '700', color: '#FFFFFF'},
  chatBtn:        {backgroundColor: '#EFF6FF', borderRadius: 12, borderWidth: 1, borderColor: '#BFDBFE', paddingVertical: 12, alignItems: 'center'},
  chatText:       {fontSize: 14, fontWeight: '700', color: BUYER_ACCENT},
  btnDisabled:    {opacity: 0.6},
});

const s = StyleSheet.create({
  root:     {flex: 1, backgroundColor: '#F9FAFB'},
  safe:     {flex: 1, backgroundColor: '#F9FAFB'},
  center:   {flex: 1, alignItems: 'center', justifyContent: 'center'},
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
  },
  backBtn:      {fontSize: 20, color: '#374151', fontWeight: '600'},
  headerTitle:  {fontSize: 17, fontWeight: '700', color: '#111827', flex: 1, textAlign: 'center'},
  content:      {padding: 16, paddingBottom: 40},
  topRow:       {flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap'},
  statusBadge:  {borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4},
  statusText:   {fontSize: 12, fontWeight: '700'},
  categoryPill: {fontSize: 13, fontWeight: '600'},
  title:        {fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 12, lineHeight: 28},
  metaRow:      {flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: 14},
  descCard:     {backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#F3F4F6'},
  descText:     {fontSize: 15, color: '#374151', lineHeight: 24},
  datesRow:     {flexDirection: 'row', gap: 10, marginBottom: 16},
  dateBox:      {flex: 1, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#F3F4F6'},
  dateLabel:    {fontSize: 10, fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2},
  dateValue:    {fontSize: 14, fontWeight: '600', color: '#374151'},
  merchantCTA: {
    backgroundColor: '#F0FDF4', borderRadius: 14, padding: 20, borderWidth: 1, borderColor: '#BBF7D0', alignItems: 'center',
  },
  ctaTitle:    {fontSize: 16, fontWeight: '700', color: '#15803D', marginBottom: 4},
  ctaDesc:     {fontSize: 13, color: '#166534', textAlign: 'center', marginBottom: 16, lineHeight: 19},
  ctaBtn:      {backgroundColor: MERCHANT_ACCENT, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 28},
  ctaBtnText:  {fontSize: 15, fontWeight: '700', color: '#FFFFFF'},
  proposalsSection: {marginTop: 24},
  proposalsHeader:  {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12},
  proposalsTitle:   {fontSize: 18, fontWeight: '800', color: '#111827'},
  marketRow:        {flexDirection: 'row', gap: 12},
  marketStat:       {fontSize: 12, color: '#9CA3AF'},
  marketStatBold:   {fontWeight: '700', color: '#374151'},
  emptyBids:        {alignItems: 'center', paddingVertical: 36, backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB'},
  emptyIcon:        {fontSize: 36, marginBottom: 8},
  emptyTitle:       {fontSize: 16, fontWeight: '700', color: '#374151', marginBottom: 4},
  emptyDesc:        {fontSize: 13, color: '#9CA3AF', textAlign: 'center'},
  cancelBar:        {backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#E5E7EB'},
  cancelBtn:        {borderRadius: 12, borderWidth: 1.5, borderColor: '#FCA5A5', backgroundColor: '#FEF2F2', paddingVertical: 14, alignItems: 'center'},
  cancelBtnText:    {fontSize: 15, fontWeight: '700', color: '#DC2626'},
});
