import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import AudioRecorderPlayer, {RecordBackType, PlayBackType} from 'react-native-audio-recorder-player';
import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import io, {Socket} from 'socket.io-client';
import {useFocusEffect} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../../types/navigation';
import {Bid, ChatMessage, MarketRequest} from '../../../types/api';
import {cancelRequest, getRequest} from '../../../api/requests';
import {acceptBid, confirmDelivery, getRequestBids} from '../../../api/bids';
import {createRoom, getMessages, getRoom, markRoomRead, sendMessage, uploadChatMedia} from '../../../api/chat';
import {getMerchantProfile} from '../../../api/reviews';
import {useAuth} from '../../../context/AuthContext';
import AppHeader from '../../../components/AppHeader';
import ImageViewerModal from '../../../components/ImageViewerModal';
import {Colors} from '../../../theme';

const API_BASE = 'http://10.0.2.2:3000';
const chatAudioPlayer = new AudioRecorderPlayer();

function formatDuration(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

type MerchantStats = {avgRating: number | null; reviewCount: number; completedBids: number};
type Props = NativeStackScreenProps<RootStackParamList, 'RequestDetail'>;

const STATUS_META: Record<string, {label: string; bg: string; text: string}> = {
  DRAFT:     {label: 'Draft',     bg: Colors.feedBackground, text: Colors.textSecondary},
  ACTIVE:    {label: 'Active',    bg: '#DCFCE7', text: '#16A34A'},
  HAS_BIDS:  {label: 'Has Bids', bg: Colors.primaryLight,   text: Colors.primary},
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
  const ACCENT   = Colors.primary;

  const [request,         setRequest]         = useState<MarketRequest | null>(null);
  const [bids,            setBids]            = useState<Bid[]>([]);
  const [acceptedBid,     setAcceptedBid]     = useState<Bid | null>(null);
  const [merchantStatsMap,setMerchantStatsMap]= useState<Record<string, MerchantStats>>({});
  const [marketAnalysis,  setMarketAnalysis]  = useState<{totalBids: number; lowestAmount: number | null; averageAmount: number | null} | null>(null);
  const [loading,         setLoading]         = useState(true);
  const [actionLoading,   setActionLoading]   = useState(false);
  const [myMerchantBid,   setMyMerchantBid]   = useState<Bid | null>(null);

  const [viewingImage, setViewingImage] = useState<string | null>(null);

  // Sheet state
  const [sheetBid,   setSheetBid]   = useState<Bid | null>(null);
  const [chatState,  setChatState]  = useState<{bid: Bid; roomId: string | null} | null>(null);
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
      const {request: data, merchantBid} = await getRequest(requestId);
      setRequest(data);
      if (user?.role === 'MERCHANT') {
        setMyMerchantBid(merchantBid);
      }

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

  useFocusEffect(useCallback(() => { load(); }, [load]));

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

  const openChat = useCallback((bid: Bid) => {
    closeSheet();
    setTimeout(() => {
      setChatState({bid, roomId: bid.chatRoomId ?? null});
    }, 230);
  }, [closeSheet]);

  const onChatClose = useCallback((newRoomId?: string) => {
    if (newRoomId && chatState?.bid && !chatState.bid.chatRoomId) {
      setBids(prev => prev.map(b => b.id === chatState.bid.id ? {...b, chatRoomId: newRoomId} : b));
    }
    setChatState(null);
  }, [chatState]);

  const showOptions = useCallback(() => {
    Alert.alert('Request Options', '', [
      {text: 'Cancel Request', style: 'destructive', onPress: handleCancel},
      {text: 'Dismiss', style: 'cancel'},
    ]);
  }, [handleCancel]);

  if (loading) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.center}><ActivityIndicator size="large" color={Colors.primary} /></View>
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
    <View style={s.root}>
      <AppHeader
        onBack={() => navigation.goBack()}
        title="Request"
        onOptions={isBuyer && canCancel ? showOptions : undefined}
      />

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
          <MetaChip icon="💰" label={formatBudget(request.budgetMin, request.budgetMax)} />
        </View>

        {/* Description */}
        <View style={s.descCard}>
          <Text style={s.descText}>{request.description}</Text>
        </View>

        {/* Images */}
        {request.images && request.images.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.imgScroll} contentContainerStyle={s.imgRow}>
            {request.images.map((img, idx) => (
              <TouchableOpacity
                key={img.id}
                activeOpacity={0.9}
                onPress={() => setViewingImage(img.imageUrl)}>
                <Image
                  source={{uri: `${API_BASE}${img.imageUrl}`}}
                  style={s.requestImg}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

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

        {/* Merchant section */}
        {!isBuyer && (
          <>
            {myMerchantBid ? (
              <MerchantBidCard
                bid={myMerchantBid}
                accent={ACCENT}
                onPress={() => navigation.navigate('BidDetail', {bidId: myMerchantBid.id})}
              />
            ) : (
              ['ACTIVE', 'HAS_BIDS'].includes(request.status) && (
                <TouchableOpacity
                  style={s.merchantCTA}
                  onPress={() => navigation.navigate('SubmitBid', {requestId: request.id, requestTitle: request.title})}
                  activeOpacity={0.8}>
                  <Text style={s.ctaTitle}>Interested?</Text>
                  <Text style={s.ctaDesc}>Submit your best offer — the buyer is comparing proposals.</Text>
                  <View style={s.ctaBtn}><Text style={s.ctaBtnText}>Submit Bid →</Text></View>
                </TouchableOpacity>
              )
            )}
            {request.bidCount > 0 && (
              <BidCompetitionSection totalBids={request.bidCount} hasBid={!!myMerchantBid} />
            )}
          </>
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
            onOpenChat={() => openChat(acceptedBid)}
            confirmLoading={actionLoading}
          />
        )}

        {/* History timeline */}
        <HistorySection
          isBuyer={isBuyer}
          isOwner={isOwner}
          request={request}
          acceptedBid={acceptedBid}
          myMerchantBid={myMerchantBid}
          accent={ACCENT}
        />
      </ScrollView>

      {/* ── Bid detail bottom sheet ─────────────────────── */}
      {chatState && (
        <InlineChatModal
          bid={chatState.bid}
          initialRoomId={chatState.roomId}
          requestStatus={request.status}
          onClose={onChatClose}
        />
      )}

      {sheetBid && (
        <BidSheet
          bid={sheetBid}
          stats={merchantStatsMap[sheetBid.merchantId]}
          badges={sheetBid.status === 'PENDING' ? computeBadges(sheetBid, bids, merchantStatsMap) : []}
          onClose={closeSheet}
          onAccept={() => handleAcceptBid(sheetBid)}
          onChat={() => openChat(sheetBid)}
          onViewMerchant={() => {
            closeSheet();
            setTimeout(() => navigation.navigate('MerchantStore', {merchantId: sheetBid.merchantId}), 220);
          }}
          acceptLoading={actionLoading}
          insets={insets}
          anim={sheetAnim}
          requestStatus={request.status}
        />
      )}

      {viewingImage && (
        <ImageViewerModal
          uri={`${API_BASE}${viewingImage}`}
          onClose={() => setViewingImage(null)}
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

function BidSheet({bid, stats, badges, onClose, onAccept, onChat, onViewMerchant, acceptLoading, insets, anim, requestStatus}: {
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
  requestStatus: string;
}) {
  const isPending  = bid.status === 'PENDING';
  const isAccepted = bid.status === 'ACCEPTED';
  const translateY = anim.interpolate({inputRange: [0, 1], outputRange: [600, 0]});
  const orderClosed = requestStatus === 'COMPLETED' || bid.fulfillmentStatus === 'CONFIRMED' || bid.fulfillmentStatus === 'DELIVERED';

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
          {(isPending || isAccepted || bid.chatRoomId) && (
            <TouchableOpacity style={bs.chatBtn} onPress={onChat} activeOpacity={0.8}>
              <Text style={bs.chatBtnText}>
                {orderClosed ? '💬  View Conversation' : '💬  Message Merchant'}
              </Text>
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

// ─── Merchant Bid Card ───────────────────────────────────────────────────────

const BID_STATUS_COLORS: Record<string, {bg: string; text: string}> = {
  PENDING:   {bg: '#FEF9C3', text: '#854D0E'},
  ACCEPTED:  {bg: '#DCFCE7', text: '#15803D'},
  REJECTED:  {bg: '#FEF2F2', text: '#B91C1C'},
  EXPIRED:   {bg: '#FEF3C7', text: '#B45309'},
  WITHDRAWN: {bg: '#F3F4F6', text: '#6B7280'},
};

function MerchantBidCard({bid, accent, onPress}: {bid: Bid; accent: string; onPress: () => void}) {
  const colors = BID_STATUS_COLORS[bid.status] ?? BID_STATUS_COLORS.PENDING;
  return (
    <TouchableOpacity style={mbc.card} onPress={onPress} activeOpacity={0.8}>
      <View style={mbc.header}>
        <Text style={mbc.label}>Your Bid</Text>
        <View style={[mbc.statusPill, {backgroundColor: colors.bg}]}>
          <Text style={[mbc.statusText, {color: colors.text}]}>
            {bid.status.charAt(0) + bid.status.slice(1).toLowerCase()}
          </Text>
        </View>
      </View>
      <Text style={[mbc.amount, {color: accent}]}>${parseFloat(bid.amount).toFixed(2)}</Text>
      <Text style={mbc.delivery}>{bid.deliveryDays} day{bid.deliveryDays !== 1 ? 's' : ''} delivery</Text>
      <Text style={mbc.viewDetail}>View bid details →</Text>
    </TouchableOpacity>
  );
}

// ─── Bid Competition Section ──────────────────────────────────────────────────

function BidCompetitionSection({totalBids, hasBid}: {totalBids: number; hasBid: boolean}) {
  const otherCount = hasBid ? totalBids - 1 : totalBids;
  const subtitle = hasBid
    ? otherCount > 0
      ? `Your bid + ${otherCount} other${otherCount !== 1 ? 's' : ''} on this request`
      : 'You are the only bidder so far'
    : `${totalBids} bid${totalBids !== 1 ? 's' : ''} already placed`;

  return (
    <View style={bcs.wrap}>
      <Text style={bcs.title}>Competition</Text>
      <Text style={bcs.subtitle}>{subtitle}</Text>
      <View style={bcs.pillsRow}>
        {hasBid && (
          <View style={[bcs.pill, bcs.yourPill]}>
            <Text style={bcs.yourPillText}>Your Bid</Text>
          </View>
        )}
        {Array.from({length: otherCount}, (_, i) => (
          <View key={i} style={bcs.pill}>
            <Text style={bcs.pillText}>Bid {i + 1}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Inline chat ──────────────────────────────────────────────────────────────

function MessageBubble({
  msg, isMine, playingId, playProgress, onTogglePlay,
}: {
  msg: ChatMessage;
  isMine: boolean;
  playingId?: string | null;
  playProgress?: Record<string, number>;
  onTogglePlay?: (msg: ChatMessage) => void;
}) {
  const time = new Date(msg.createdAt).toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'});
  if (msg.isDeleted) {
    return (
      <View style={[mb.wrap, isMine ? mb.mine : mb.theirs]}>
        <Text style={mb.deleted}>Message deleted</Text>
      </View>
    );
  }
  if (msg.type === 'IMAGE' && msg.mediaUrls?.[0]) {
    const [viewing, setViewing] = React.useState(false);
    return (
      <>
        <TouchableOpacity
          onPress={() => setViewing(true)}
          activeOpacity={0.9}
          style={[mb.wrap, isMine ? mb.mine : mb.theirs, {padding: 3, maxWidth: '70%'}]}>
          <Image source={{uri: msg.mediaUrls[0]}} style={mb.img} resizeMode="cover" />
          <Text style={[mb.time, isMine ? mb.timeMine : mb.timeTheirs, {paddingHorizontal: 6, marginTop: 4}]}>
            {time}
          </Text>
        </TouchableOpacity>
        {viewing && <ImageViewerModal uri={msg.mediaUrls[0]} onClose={() => setViewing(false)} />}
      </>
    );
  }
  if (msg.type === 'VOICE' && msg.mediaUrls?.[0]) {
    const isPlaying = playingId === msg.id;
    const progress = playProgress?.[msg.id] ?? 0;
    return (
      <View style={[mb.wrap, isMine ? mb.mine : mb.theirs, mb.voiceWrap]}>
        <TouchableOpacity
          onPress={() => onTogglePlay?.(msg)}
          activeOpacity={0.7}
          style={mb.playBtn}>
          <Text style={mb.playIcon}>{isPlaying ? '⏸' : '▶'}</Text>
        </TouchableOpacity>
        <View style={mb.barTrack}>
          <View style={[mb.barFill, {
            width: `${Math.round(progress * 100)}%` as any,
            backgroundColor: isMine ? 'rgba(255,255,255,0.85)' : Colors.primary,
          }]} />
        </View>
        <Text style={[mb.time, isMine ? mb.timeMine : mb.timeTheirs, {marginLeft: 6}]}>
          {time}
        </Text>
      </View>
    );
  }
  return (
    <View style={[mb.wrap, isMine ? mb.mine : mb.theirs]}>
      <Text style={[mb.text, isMine ? mb.textMine : mb.textTheirs]}>{msg.content}</Text>
      <Text style={[mb.time, isMine ? mb.timeMine : mb.timeTheirs]}>
        {time}{msg.isEdited ? ' · edited' : ''}
      </Text>
    </View>
  );
}

function InlineChatModal({bid, initialRoomId, requestStatus, onClose}: {
  bid: Bid;
  initialRoomId: string | null;
  requestStatus: string;
  onClose: (newRoomId?: string) => void;
}) {
  const {user} = useAuth();
  const userId = user?.id ?? '';

  const [messages,       setMessages]       = useState<ChatMessage[]>([]);
  const [roomId,         setRoomId]         = useState<string | null>(initialRoomId);
  const [roomActive,     setRoomActive]     = useState(true);
  const [loading,        setLoading]        = useState(true);
  const [text,           setText]           = useState('');
  const [sending,        setSending]        = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [recording,      setRecording]      = useState(false);
  const [recordSecs,     setRecordSecs]     = useState(0);
  const [playingId,      setPlayingId]      = useState<string | null>(null);
  const [playProgress,   setPlayProgress]   = useState<Record<string, number>>({});

  const socketRef      = useRef<Socket | null>(null);
  const flatListRef    = useRef<FlatList>(null);
  const createdRoomRef = useRef<string | null>(null);
  const recordSecsRef  = useRef(0);
  const recordPulse    = useRef(new Animated.Value(1)).current;

  const orderClosed = requestStatus === 'COMPLETED'
    || bid.fulfillmentStatus === 'CONFIRMED'
    || bid.fulfillmentStatus === 'DELIVERED';

  // Init: create room if needed, then load messages
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        let rId = initialRoomId;
        if (!rId) {
          const room = await createRoom({
            name: 'Bid Chat',
            type: 'BID',
            relatedBidId: bid.id,
            relatedRequestId: bid.requestId,
            participantIds: [bid.merchantId],
          });
          rId = room.id;
          createdRoomRef.current = rId;
          if (!cancelled) setRoomId(rId);
        }
        const [msgRes, room] = await Promise.all([
          getMessages(rId, {limit: 50}),
          getRoom(rId),
        ]);
        if (!cancelled) {
          setMessages(msgRes.messages);
          setRoomActive(room.isActive);
          if (room.isActive) markRoomRead(rId).catch(() => {});
        }
      } catch { /* ignore */ }
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Socket
  useEffect(() => {
    if (!roomId) return;
    let socket: Socket;
    AsyncStorage.getItem('access_token').then(token => {
      socket = io(API_BASE, {auth: {token}, transports: ['websocket']});
      socket.on('connect', () => socket.emit('join_room', {roomId}));
      socket.on('new_message', (msg: ChatMessage) => {
        setMessages(prev => [...prev, msg]);
        if (msg.senderId !== userId) markRoomRead(roomId!).catch(() => {});
      });
      socketRef.current = socket;
    });
    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leave_room', {roomId});
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [roomId, userId]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({animated: true}), 80);
    }
  }, [messages.length]);

  const handleSend = useCallback(async () => {
    const content = text.trim();
    if (!content || sending || !roomId) return;
    setText('');
    setSending(true);
    if (socketRef.current?.connected) {
      socketRef.current.emit('send_message', {roomId, content, type: 'TEXT'});
      setSending(false);
    } else {
      try {
        const msg = await sendMessage(roomId, {content});
        setMessages(prev => [...prev, msg]);
      } catch { setText(content); }
      finally { setSending(false); }
    }
  }, [text, sending, roomId]);

  const handlePickImage = useCallback(async () => {
    if (!roomId) return;
    const result = await launchImageLibrary({mediaType: 'photo', quality: 0.8, selectionLimit: 1});
    if (result.didCancel || !result.assets?.[0]) return;
    const asset = result.assets[0];
    if (!asset.uri) return;
    setUploadingMedia(true);
    try {
      const {url} = await uploadChatMedia(
        asset.uri,
        asset.type ?? 'image/jpeg',
        asset.fileName ?? `img_${Date.now()}.jpg`,
      );
      const payload = {roomId, content: '📷 Image', type: 'IMAGE', mediaUrls: [url]};
      if (socketRef.current?.connected) {
        socketRef.current.emit('send_message', payload);
      } else {
        const msg = await sendMessage(roomId, {content: '📷 Image', type: 'IMAGE', mediaUrls: [url]});
        setMessages(prev => [...prev, msg]);
      }
    } catch { Alert.alert('Upload failed', 'Could not send image. Try again.'); }
    finally { setUploadingMedia(false); }
  }, [roomId]);

  const handleTogglePlay = useCallback(async (msg: ChatMessage) => {
    const url = msg.mediaUrls?.[0];
    if (!url) return;
    if (playingId === msg.id) {
      await chatAudioPlayer.stopPlayer();
      chatAudioPlayer.removePlayBackListener();
      setPlayingId(null);
      return;
    }
    if (playingId) {
      await chatAudioPlayer.stopPlayer();
      chatAudioPlayer.removePlayBackListener();
    }
    setPlayingId(msg.id);
    chatAudioPlayer.addPlayBackListener((e: PlayBackType) => {
      const progress = e.duration > 0 ? e.currentPosition / e.duration : 0;
      setPlayProgress(prev => ({...prev, [msg.id]: progress}));
      if (e.currentPosition >= e.duration && e.duration > 0) {
        setPlayingId(null);
        chatAudioPlayer.stopPlayer().catch(() => {});
      }
    });
    await chatAudioPlayer.startPlayer(url);
  }, [playingId]);

  const handleMicPressIn = useCallback(async () => {
    const perm = await check(PERMISSIONS.ANDROID.RECORD_AUDIO);
    const granted = perm === RESULTS.GRANTED
      ? perm
      : await request(PERMISSIONS.ANDROID.RECORD_AUDIO);
    if (granted !== RESULTS.GRANTED) {
      Alert.alert('Permission required', 'Microphone access is needed to send voice messages.');
      return;
    }
    recordSecsRef.current = 0;
    setRecordSecs(0);
    setRecording(true);
    Animated.loop(
      Animated.sequence([
        Animated.timing(recordPulse, {toValue: 1.3, duration: 600, useNativeDriver: true}),
        Animated.timing(recordPulse, {toValue: 1, duration: 600, useNativeDriver: true}),
      ]),
    ).start();
    await chatAudioPlayer.startRecorder();
    chatAudioPlayer.addRecordBackListener((e: RecordBackType) => {
      const s = Math.floor(e.currentPosition / 1000);
      recordSecsRef.current = s;
      setRecordSecs(s);
    });
  }, [recordPulse]);

  const handleMicPressOut = useCallback(async () => {
    if (!recording || !roomId) return;
    setRecording(false);
    recordPulse.stopAnimation();
    Animated.timing(recordPulse, {toValue: 1, duration: 150, useNativeDriver: true}).start();

    let filePath: string;
    try {
      filePath = await chatAudioPlayer.stopRecorder();
      chatAudioPlayer.removeRecordBackListener();
    } catch { return; }

    if (recordSecsRef.current < 1) return;

    setUploadingMedia(true);
    try {
      const uri = filePath.startsWith('file://') ? filePath : `file://${filePath}`;
      const {url} = await uploadChatMedia(uri, 'audio/mp4', `voice_${Date.now()}.mp4`);
      const dur = formatDuration(recordSecsRef.current);
      const payload = {roomId, content: `🎤 ${dur}`, type: 'VOICE', mediaUrls: [url]};
      if (socketRef.current?.connected) {
        socketRef.current.emit('send_message', payload);
      } else {
        const msg = await sendMessage(roomId, {content: `🎤 ${dur}`, type: 'VOICE', mediaUrls: [url]});
        setMessages(prev => [...prev, msg]);
      }
    } catch { Alert.alert('Upload failed', 'Could not send voice message. Try again.'); }
    finally { setUploadingMedia(false); }
  }, [recording, roomId, recordPulse]);

  const handleClose = useCallback(() => {
    onClose(createdRoomRef.current ?? undefined);
  }, [onClose]);

  return (
    <Modal visible animationType="slide" onRequestClose={handleClose}>
      <SafeAreaView style={ch.safe}>
        {/* Header */}
        <View style={[ch.header, {backgroundColor: Colors.primary}]}>
          <TouchableOpacity onPress={handleClose} hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}>
            <Text style={ch.back}>← Back</Text>
          </TouchableOpacity>
          <Text style={ch.title}>Merchant Chat</Text>
          <View style={{width: 70}} />
        </View>

        <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {loading ? (
            <View style={ch.center}><ActivityIndicator size="large" color={Colors.primary} /></View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={m => m.id}
              contentContainerStyle={ch.list}
              renderItem={({item}) => (
                <MessageBubble
                  msg={item}
                  isMine={item.senderId === userId}
                  playingId={playingId}
                  playProgress={playProgress}
                  onTogglePlay={handleTogglePlay}
                />
              )}
              ListEmptyComponent={
                <View style={ch.empty}>
                  <Text style={ch.emptyIcon}>💬</Text>
                  <Text style={ch.emptyText}>No messages yet. Say hello!</Text>
                </View>
              }
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({animated: false})}
            />
          )}

          {!roomActive && (
            <View style={ch.archived}>
              <Text style={ch.archivedText}>This conversation is archived — the transaction has been completed.</Text>
            </View>
          )}

          {roomActive && !orderClosed && (
            <View style={ch.compose}>
              <TouchableOpacity
                style={ch.actionBtn}
                onPress={handlePickImage}
                disabled={sending || uploadingMedia || recording}
                activeOpacity={0.7}>
                {uploadingMedia
                  ? <ActivityIndicator size="small" color={Colors.primary} />
                  : <Text style={ch.actionIcon}>📎</Text>}
              </TouchableOpacity>

              {recording ? (
                <View style={ch.recordingBar}>
                  <Animated.View style={[ch.recordDot, {transform: [{scale: recordPulse}]}]} />
                  <Text style={ch.recordTimer}>{formatDuration(recordSecs)}</Text>
                  <Text style={ch.recordHint}>Release to send</Text>
                </View>
              ) : (
                <TextInput
                  style={ch.input}
                  value={text}
                  onChangeText={setText}
                  placeholder="Type a message…"
                  placeholderTextColor="#9CA3AF"
                  multiline
                  maxLength={2000}
                />
              )}

              {text.trim().length > 0 ? (
                <TouchableOpacity
                  style={[ch.sendBtn, (sending || uploadingMedia) && ch.sendBtnDisabled]}
                  onPress={handleSend}
                  disabled={sending || uploadingMedia}
                  activeOpacity={0.8}>
                  {sending
                    ? <ActivityIndicator size="small" color="#FFF" />
                    : <Text style={ch.sendIcon}>↑</Text>}
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[ch.micBtn, recording && ch.micBtnActive]}
                  onPressIn={handleMicPressIn}
                  onPressOut={handleMicPressOut}
                  disabled={uploadingMedia}
                  activeOpacity={0.8}>
                  <Text style={ch.micIcon}>🎤</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

// ─── History Section ─────────────────────────────────────────────────────────

type HistoryEvent = {icon: string; label: string; sublabel?: string; done: boolean; failed?: boolean};

const FULFILLMENT_ORDER = ['AWAITING', 'PREPARING', 'IN_DELIVERY', 'DELIVERED', 'CONFIRMED'];

function buildBuyerHistory(req: MarketRequest, accepted: Bid | null): HistoryEvent[] {
  const fsIdx = accepted?.fulfillmentStatus
    ? FULFILLMENT_ORDER.indexOf(accepted.fulfillmentStatus)
    : -1;
  return [
    {icon: '📋', label: 'Request posted',                    sublabel: formatDate(req.publishedAt ?? req.createdAt), done: true},
    {icon: '📬', label: req.bidCount > 0 ? `${req.bidCount} bid${req.bidCount !== 1 ? 's' : ''} received` : 'Waiting for bids', done: req.bidCount > 0},
    {icon: '✅', label: 'Bid accepted',                      sublabel: accepted?.acceptedAt ? formatDate(accepted.acceptedAt) : undefined, done: !!accepted},
    {icon: '📦', label: 'Merchant preparing',                done: fsIdx >= FULFILLMENT_ORDER.indexOf('PREPARING')},
    {icon: '🚚', label: 'Out for delivery',                  done: fsIdx >= FULFILLMENT_ORDER.indexOf('IN_DELIVERY')},
    {icon: '📬', label: 'Delivered',                         done: fsIdx >= FULFILLMENT_ORDER.indexOf('DELIVERED')},
    {icon: '🎉', label: 'Completed',                         sublabel: req.status === 'COMPLETED' ? 'Transaction complete' : undefined, done: req.status === 'COMPLETED'},
  ];
}

function buildMerchantHistory(bid: Bid): HistoryEvent[] {
  const fsIdx = bid.fulfillmentStatus ? FULFILLMENT_ORDER.indexOf(bid.fulfillmentStatus) : -1;
  const isAccepted = bid.status === 'ACCEPTED';
  const isRejected = ['REJECTED', 'WITHDRAWN', 'EXPIRED'].includes(bid.status);
  const base: HistoryEvent[] = [
    {icon: '💼', label: 'Bid submitted',     sublabel: formatDate(bid.createdAt), done: true},
    {
      icon: isRejected ? '❌' : isAccepted ? '✅' : '⏳',
      label: isAccepted ? 'Bid accepted' : isRejected ? `Bid ${bid.status.charAt(0) + bid.status.slice(1).toLowerCase()}` : 'Awaiting buyer decision',
      sublabel: bid.acceptedAt ? formatDate(bid.acceptedAt) : bid.rejectedAt ? formatDate(bid.rejectedAt) : undefined,
      done: bid.status !== 'PENDING',
      failed: isRejected,
    },
  ];
  if (!isAccepted) return base;
  return [
    ...base,
    {icon: '📦', label: 'Started preparing',       done: fsIdx >= FULFILLMENT_ORDER.indexOf('PREPARING')},
    {icon: '🚚', label: 'Sent for delivery',        done: fsIdx >= FULFILLMENT_ORDER.indexOf('IN_DELIVERY')},
    {icon: '📬', label: 'Marked as delivered',      done: fsIdx >= FULFILLMENT_ORDER.indexOf('DELIVERED')},
    {icon: '🎉', label: 'Buyer confirmed receipt',  done: fsIdx >= FULFILLMENT_ORDER.indexOf('CONFIRMED')},
  ];
}

function HistorySection({isBuyer, isOwner, request, acceptedBid, myMerchantBid, accent}: {
  isBuyer: boolean; isOwner: boolean; request: MarketRequest;
  acceptedBid: Bid | null; myMerchantBid: Bid | null; accent: string;
}) {
  if (request.status === 'DRAFT') return null;
  if (isBuyer && !isOwner) return null;
  if (!isBuyer && !myMerchantBid) return null;

  const events = isBuyer
    ? buildBuyerHistory(request, acceptedBid)
    : buildMerchantHistory(myMerchantBid!);

  return (
    <View style={hs.wrap}>
      <Text style={[hs.heading, {color: accent}]}>History</Text>
      {events.map((ev, i) => (
        <View key={i} style={hs.row}>
          <View style={hs.lineCol}>
            <View style={[hs.dot, ev.done && !ev.failed && {backgroundColor: accent}, ev.failed && hs.dotFailed, !ev.done && hs.dotPending]} />
            {i < events.length - 1 && (
              <View style={[hs.line, ev.done && !ev.failed && {backgroundColor: accent + '44'}]} />
            )}
          </View>
          <View style={hs.content}>
            <Text style={[hs.label, !ev.done && !ev.failed && hs.labelPending, ev.failed && hs.labelFailed]}>
              {ev.icon}{'  '}{ev.label}
            </Text>
            {ev.sublabel ? <Text style={hs.sublabel}>{ev.sublabel}</Text> : null}
          </View>
        </View>
      ))}
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

const mb = StyleSheet.create({
  wrap:      {maxWidth: '75%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 4},
  mine:      {backgroundColor: Colors.primary, alignSelf: 'flex-end', borderBottomRightRadius: 4},
  theirs:    {backgroundColor: Colors.surface, alignSelf: 'flex-start', borderBottomLeftRadius: 4,
    shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1},
  text:      {fontSize: 15, lineHeight: 21},
  textMine:  {color: Colors.textOnPrimary},
  textTheirs:{color: Colors.textPrimary},
  time:      {fontSize: 10, marginTop: 4},
  timeMine:  {color: 'rgba(255,255,255,0.6)', textAlign: 'right'},
  timeTheirs:{color: Colors.textSecondary},
  deleted:   {fontSize: 14, fontStyle: 'italic', color: Colors.textSecondary},
  img:       {width: 220, height: 170, borderRadius: 14},
  voiceWrap: {flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 8},
  playBtn:   {width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center'},
  playIcon:  {fontSize: 16, color: Colors.textOnPrimary},
  barTrack:  {flex: 1, height: 4, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 2, overflow: 'hidden'},
  barFill:   {height: '100%' as any, borderRadius: 2},
});

const ch = StyleSheet.create({
  safe:        {flex: 1, backgroundColor: Colors.feedBackground},
  header:      {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
  },
  back:        {fontSize: 15, fontWeight: '700', color: Colors.textOnPrimary},
  title:       {fontSize: 17, fontWeight: '700', color: Colors.textOnPrimary},
  center:      {flex: 1, alignItems: 'center', justifyContent: 'center'},
  list:        {padding: 12, paddingBottom: 8, flexGrow: 1},
  empty:       {flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60},
  emptyIcon:   {fontSize: 48, marginBottom: 12},
  emptyText:   {fontSize: 15, color: Colors.textSecondary},
  archived:    {
    backgroundColor: Colors.feedBackground, borderTopWidth: 1, borderTopColor: Colors.divider,
    paddingHorizontal: 20, paddingVertical: 14, alignItems: 'center',
  },
  archivedText:{fontSize: 13, color: Colors.textSecondary, textAlign: 'center', lineHeight: 18},
  compose:     {
    flexDirection: 'row', alignItems: 'flex-end', padding: 10, gap: 8,
    backgroundColor: Colors.surface, borderTopWidth: 1, borderTopColor: Colors.divider,
  },
  input:       {
    flex: 1, backgroundColor: Colors.feedBackground, borderRadius: 22, borderWidth: 1, borderColor: Colors.divider,
    paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, color: Colors.textPrimary, maxHeight: 120,
  },
  actionBtn:      {width: 40, height: 40, alignItems: 'center', justifyContent: 'center'},
  actionIcon:     {fontSize: 22},
  recordingBar:   {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.errorLight, borderRadius: 22,
    paddingHorizontal: 16, paddingVertical: 12, gap: 10,
    borderWidth: 1, borderColor: '#FECACA',
  },
  recordDot:      {width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.error},
  recordTimer:    {fontSize: 15, fontWeight: '700', color: Colors.error, minWidth: 38},
  recordHint:     {fontSize: 13, color: Colors.textSecondary},
  sendBtn:        {width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center'},
  sendBtnDisabled:{backgroundColor: Colors.primaryLight},
  sendIcon:       {fontSize: 18, color: Colors.textOnPrimary, fontWeight: '700'},
  micBtn:         {width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.feedBackground, alignItems: 'center', justifyContent: 'center'},
  micBtnActive:   {backgroundColor: '#FEE2E2'},
  micIcon:        {fontSize: 20},
});

const mc = StyleSheet.create({
  chip:  {flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.feedBackground, borderRadius: 8, paddingHorizontal: 9, paddingVertical: 5, gap: 4},
  icon:  {fontSize: 13},
  label: {fontSize: 12, color: Colors.textSecondary, fontWeight: '500'},
});

const pc = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface, borderRadius: 16, padding: 16, marginBottom: 10,
    borderWidth: 1.5, borderColor: Colors.divider,
    shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  cardAccepted: {borderColor: '#16A34A', backgroundColor: '#F0FDF4'},
  cardMuted:    {opacity: 0.55},
  acceptedBanner: {
    backgroundColor: '#16A34A', borderRadius: 8, paddingVertical: 5, paddingHorizontal: 10,
    alignSelf: 'flex-start', marginBottom: 10,
  },
  acceptedBannerText: {fontSize: 12, fontWeight: '700', color: Colors.textOnPrimary},
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
  merchantName:  {fontSize: 14, fontWeight: '700', color: Colors.textPrimary},
  rating:        {fontSize: 12, color: Colors.warning, marginTop: 1},
  mutedText:     {color: Colors.textSecondary},
  statusPill:    {borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3},
  statusPillText:{fontSize: 11, fontWeight: '700', color: Colors.textSecondary},
  priceRow:      {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6},
  price:         {fontSize: 26, fontWeight: '800', color: Colors.textPrimary},
  deliveryPill:  {backgroundColor: Colors.feedBackground, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5},
  deliveryPillAccepted: {backgroundColor: '#DCFCE7'},
  deliveryText:  {fontSize: 12, fontWeight: '600', color: Colors.textSecondary},
  deliveryTextAccepted: {color: '#15803D'},
  notesPreview:  {fontSize: 13, color: Colors.textSecondary, fontStyle: 'italic', marginBottom: 6},
  tapHint:       {fontSize: 12, color: Colors.primary, fontWeight: '500', marginTop: 4, textAlign: 'right'},
});

const bs = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingTop: 12,
    shadowColor: '#000', shadowOffset: {width: 0, height: -4}, shadowOpacity: 0.12, shadowRadius: 20, elevation: 24,
  },
  handle:        {width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.divider, alignSelf: 'center', marginBottom: 20},
  merchantHeader:{flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16},
  bigAvatar:     {width: 52, height: 52, borderRadius: 26, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center'},
  bigAvatarText: {fontSize: 18, fontWeight: '800', color: Colors.primary},
  merchantMetaBlock: {flex: 1},
  merchantNameLg:{fontSize: 16, fontWeight: '700', color: Colors.textPrimary},
  merchantRating:{fontSize: 13, color: Colors.warning, marginTop: 2},
  viewProfile:   {fontSize: 13, color: Colors.textSecondary},
  badgeRow:      {flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: 16},
  badge:         {borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5},
  badgeText:     {fontSize: 12, fontWeight: '700'},
  priceBlock:    {flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16},
  bigPrice:      {fontSize: 36, fontWeight: '800', color: Colors.textPrimary},
  deliveryBadge: {backgroundColor: Colors.feedBackground, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7},
  deliveryBadgeText: {fontSize: 13, fontWeight: '600', color: Colors.textPrimary},
  notesCard:     {backgroundColor: Colors.feedBackground, borderRadius: 12, padding: 14, marginBottom: 20, borderWidth: 1, borderColor: Colors.divider},
  notesLabel:    {fontSize: 11, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6},
  notesText:     {fontSize: 15, color: Colors.textPrimary, lineHeight: 22},
  actions:       {gap: 10},
  chatBtn: {
    borderRadius: 10, borderWidth: 1, borderColor: '#E4E6EA',
    backgroundColor: '#FFFFFF', paddingVertical: 12, alignItems: 'center',
  },
  chatBtnText:   {fontSize: 14, fontWeight: '700', color: Colors.primary},
  acceptBtn: {
    borderRadius: 10, backgroundColor: Colors.primary,
    paddingVertical: 12, alignItems: 'center',
    shadowColor: Colors.primary, shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  acceptBtnText: {fontSize: 14, fontWeight: '700', color: Colors.textOnPrimary},
  acceptedState: {backgroundColor: '#F0FDF4', borderRadius: 10, borderWidth: 1, borderColor: '#BBF7D0', paddingVertical: 12, alignItems: 'center'},
  acceptedStateText: {fontSize: 14, fontWeight: '700', color: '#15803D'},
  btnDisabled:   {opacity: 0.6},
});

const ff = StyleSheet.create({
  card: {
    backgroundColor: Colors.warningLight, borderRadius: 16, padding: 18, marginTop: 16,
    borderWidth: 1, borderColor: '#FDE68A',
  },
  title:          {fontSize: 12, fontWeight: '700', color: '#92400E', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14},
  progressTrack:  {flexDirection: 'row', alignItems: 'center', marginBottom: 16},
  progressDot:    {width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.divider},
  progressDotDone:{backgroundColor: '#D97706'},
  progressLine:   {flex: 1, height: 2, backgroundColor: Colors.divider},
  progressLineDone:{backgroundColor: '#D97706'},
  statusIcon:     {fontSize: 28, textAlign: 'center', marginBottom: 6},
  statusLabel:    {fontSize: 15, fontWeight: '600', color: '#92400E', textAlign: 'center', marginBottom: 16},
  confirmBtn:     {backgroundColor: Colors.success, borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginBottom: 10},
  confirmText:    {fontSize: 14, fontWeight: '700', color: Colors.textOnPrimary},
  chatBtn:        {backgroundColor: '#FFFFFF', borderRadius: 10, borderWidth: 1, borderColor: '#E4E6EA', paddingVertical: 12, alignItems: 'center'},
  chatText:       {fontSize: 14, fontWeight: '700', color: Colors.primary},
  btnDisabled:    {opacity: 0.6},
});

const mbc = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface, borderRadius: 14, padding: 16, marginTop: 16,
    borderWidth: 1.5, borderColor: '#D1FAE5',
    shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  header:     {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10},
  label:      {fontSize: 11, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5},
  statusPill: {borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3},
  statusText: {fontSize: 12, fontWeight: '700'},
  amount:     {fontSize: 28, fontWeight: '800', marginBottom: 4},
  delivery:   {fontSize: 13, color: Colors.textSecondary, marginBottom: 12},
  viewDetail: {fontSize: 13, fontWeight: '600', color: Colors.textSecondary, textAlign: 'right'},
});

const bcs = StyleSheet.create({
  wrap:        {backgroundColor: Colors.surface, borderRadius: 14, padding: 16, marginTop: 12, borderWidth: 1, borderColor: Colors.divider},
  title:       {fontSize: 13, fontWeight: '700', color: Colors.textPrimary, marginBottom: 2},
  subtitle:    {fontSize: 12, color: Colors.textSecondary, marginBottom: 12},
  pillsRow:    {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
  pill:        {backgroundColor: Colors.feedBackground, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: Colors.divider},
  pillText:    {fontSize: 12, color: Colors.textSecondary, fontWeight: '500'},
  yourPill:    {backgroundColor: '#DCFCE7', borderColor: '#A7F3D0'},
  yourPillText:{fontSize: 12, color: '#15803D', fontWeight: '700'},
});

const s = StyleSheet.create({
  root:   {flex: 1, backgroundColor: Colors.feedBackground},
  safe:   {flex: 1, backgroundColor: Colors.feedBackground},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  content:      {padding: 16, paddingBottom: 40},
  topRow:       {flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap'},
  statusBadge:  {borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4},
  statusText:   {fontSize: 12, fontWeight: '700'},
  categoryPill: {fontSize: 13, fontWeight: '600'},
  title:        {fontSize: 22, fontWeight: '800', color: Colors.textPrimary, marginBottom: 12, lineHeight: 28},
  metaRow:      {flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: 14},
  descCard:     {backgroundColor: Colors.surface, borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: Colors.divider},
  descText:     {fontSize: 15, color: Colors.textPrimary, lineHeight: 24},
  imgScroll:    {marginBottom: 12},
  imgRow:       {gap: 8, paddingHorizontal: 0},
  requestImg:   {width: 220, height: 165, borderRadius: 12},
  datesRow:     {flexDirection: 'row', gap: 10, marginBottom: 16},
  dateBox:      {flex: 1, backgroundColor: Colors.surface, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: Colors.divider},
  dateLabel:    {fontSize: 10, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2},
  dateValue:    {fontSize: 14, fontWeight: '600', color: Colors.textPrimary},
  merchantCTA: {
    backgroundColor: Colors.successLight, borderRadius: 14, padding: 20, borderWidth: 1, borderColor: '#BBF7D0', alignItems: 'center',
  },
  ctaTitle:    {fontSize: 16, fontWeight: '700', color: '#15803D', marginBottom: 4},
  ctaDesc:     {fontSize: 13, color: '#166534', textAlign: 'center', marginBottom: 16, lineHeight: 19},
  ctaBtn:      {backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 28},
  ctaBtnText:  {fontSize: 15, fontWeight: '700', color: Colors.textOnPrimary},
  proposalsSection: {marginTop: 24},
  proposalsHeader:  {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12},
  proposalsTitle:   {fontSize: 18, fontWeight: '800', color: Colors.textPrimary},
  marketRow:        {flexDirection: 'row', gap: 12},
  marketStat:       {fontSize: 12, color: Colors.textSecondary},
  marketStatBold:   {fontWeight: '700', color: Colors.textPrimary},
  emptyBids:        {alignItems: 'center', paddingVertical: 36, backgroundColor: Colors.surface, borderRadius: 14, borderWidth: 1, borderColor: Colors.divider},
  emptyIcon:        {fontSize: 36, marginBottom: 8},
  emptyTitle:       {fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4},
  emptyDesc:        {fontSize: 13, color: Colors.textSecondary, textAlign: 'center'},
});

const hs = StyleSheet.create({
  wrap:         {marginTop: 24, backgroundColor: Colors.surface, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: Colors.divider},
  heading:      {fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 16},
  row:          {flexDirection: 'row', minHeight: 44},
  lineCol:      {width: 26, alignItems: 'center'},
  dot:          {width: 14, height: 14, borderRadius: 7, marginTop: 3},
  dotPending:   {backgroundColor: Colors.feedBackground, borderWidth: 2, borderColor: Colors.divider},
  dotFailed:    {backgroundColor: Colors.error},
  line:         {flex: 1, width: 2, backgroundColor: Colors.divider, marginTop: 2, marginBottom: 0},
  content:      {flex: 1, paddingBottom: 12, paddingLeft: 8},
  label:        {fontSize: 14, fontWeight: '600', color: Colors.textPrimary, lineHeight: 20},
  labelPending: {color: Colors.textSecondary, fontWeight: '500'},
  labelFailed:  {color: Colors.error},
  sublabel:     {fontSize: 12, color: Colors.textSecondary, marginTop: 2},
});
