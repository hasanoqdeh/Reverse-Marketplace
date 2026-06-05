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
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Bid, MarketRequest} from '../../../types/api';
import {RootStackParamList} from '../../../types/navigation';
import {searchRequests} from '../../../api/requests';
import {getMyBids, submitBid} from '../../../api/bids';
import {getImageUrl} from '../../../api/client';
import AppHeader from '../../../components/AppHeader';
import {Colors} from '../../../theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const SORT_OPTIONS = [
  {label: 'Newest',   field: 'created_at', order: 'desc'},
  {label: 'Budget',   field: 'budget_max', order: 'desc'},
  {label: 'Expiring', field: 'expires_at', order: 'asc'},
];

const QUICK_REPLIES = ['Can you do it faster?', "What's included?", 'I can lower the price'];

// ─── helpers ──────────────────────────────────────────────────────────────────

function formatBudget(min?: number | string | null, max?: number | string | null): string {
  const lo = min ? Number(min) : null;
  const hi = max ? Number(max) : null;
  if (!lo && !hi) return 'Open budget';
  if (lo && hi)   return `$${lo.toLocaleString()} – $${hi.toLocaleString()}`;
  if (hi)         return `Up to $${hi.toLocaleString()}`;
  return `From $${lo!.toLocaleString()}`;
}

function timeAgo(iso: string): string {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60)    return 'just now';
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function daysLeft(iso?: string | null): string | null {
  if (!iso) return null;
  const d = Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);
  if (d <= 0) return null;
  return d <= 2 ? `⚠ ${d}d left` : `${d} days left`;
}

// ─── Post Card (Facebook-style) ───────────────────────────────────────────────

interface PostCardProps {
  item: MarketRequest;
  myBid?: Bid;
  onQuickBid: () => void;
  onViewRequest: () => void;
}

function PostCard({item, myBid, onQuickBid, onViewRequest}: PostCardProps) {
  const expiry  = daysLeft(item.expiresAt);
  const urgent  = !!expiry && expiry.startsWith('⚠');
  const hasBid      = !!myBid;
  const isPending   = myBid?.status === 'PENDING';
  const isAccepted  = myBid?.status === 'ACCEPTED';
  const isClosed    = hasBid && !isPending && !isAccepted;
  const budget      = formatBudget(item.budgetMin, item.budgetMax);
  const location    = item.locationCity ?? item.locationAddress ?? null;

  return (
    <View style={post.card}>

      {/* ── Post header ── */}
      <View style={post.header}>
        <View style={post.meta}>
          {item.category ? (
            <View style={post.catBadge}>
              <Text style={post.catText}>{item.category.name}</Text>
            </View>
          ) : (
            <View style={post.catBadge}>
              <Text style={post.catText}>General</Text>
            </View>
          )}
          <Text style={post.dot}>·</Text>
          {location && <Text style={post.location} numberOfLines={1}>📍 {location}</Text>}
        </View>
        <Text style={post.time}>{timeAgo(item.createdAt)}</Text>
      </View>

      {/* ── Post body (tappable) ── */}
      <TouchableOpacity onPress={onViewRequest} activeOpacity={0.85}>
        <Text style={post.title}>{item.title}</Text>
        {item.description ? (
          <Text style={post.desc} numberOfLines={4}>{item.description}</Text>
        ) : null}
      </TouchableOpacity>

      {/* ── Images ── */}
      {item.images && item.images.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={post.imgScroll} contentContainerStyle={post.imgRow}>
          {item.images.map(img => (
            <TouchableOpacity key={img.id} onPress={onViewRequest} activeOpacity={0.9}>
              <Image source={{uri: getImageUrl(img.imageUrl)}} style={post.img} resizeMode="cover" />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* ── Info strip ── */}
      <View style={post.strip}>
        <Text style={post.budget}>{budget}</Text>
        {expiry && (
          <Text style={[post.expiry, urgent && post.expiryUrgent]}>{expiry}</Text>
        )}
      </View>

      {/* ── Divider ── */}
      <View style={post.divider} />

      {/* ── Actions (Facebook-style footer) ── */}
      <View style={post.actions}>
        {/* Engagement stats */}
        <TouchableOpacity style={post.stat} onPress={onViewRequest} activeOpacity={0.7}>
          <Text style={post.statIcon}>🏷</Text>
          <Text style={post.statText}>
            {item.bidCount > 0 ? `${item.bidCount} bid${item.bidCount !== 1 ? 's' : ''}` : 'No bids yet'}
          </Text>
        </TouchableOpacity>

        {/* CTA */}
        {!hasBid && (
          <TouchableOpacity style={post.bidBtn} onPress={onQuickBid} activeOpacity={0.8}>
            <Text style={post.bidBtnText}>⚡  Place Bid</Text>
          </TouchableOpacity>
        )}
        {isPending && (
          <TouchableOpacity style={post.bidPending} onPress={onQuickBid} activeOpacity={0.8}>
            <Text style={post.bidPendingText}>✓  ${parseFloat(myBid!.amount).toFixed(0)} · Pending</Text>
          </TouchableOpacity>
        )}
        {isAccepted && (
          <View style={post.bidAccepted}>
            <Text style={post.bidAcceptedText}>🎉  Accepted!</Text>
          </View>
        )}
        {isClosed && (
          <View style={post.bidClosed}>
            <Text style={post.bidClosedText}>Closed</Text>
          </View>
        )}

        {/* View details */}
        <TouchableOpacity style={post.detailBtn} onPress={onViewRequest} activeOpacity={0.7}>
          <Text style={post.detailBtnText}>Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Quick bid sheet ──────────────────────────────────────────────────────────

function QuickBidSheet({
  request,
  existingBid,
  onClose,
  onSubmitted,
}: {
  request: MarketRequest | null;
  existingBid?: Bid;
  onClose: () => void;
  onSubmitted: (bidId: string, amount: string, days: string) => void;
}) {
  const [amount,     setAmount]     = useState(existingBid ? String(parseFloat(existingBid.amount)) : '');
  const [days,       setDays]       = useState(existingBid ? String(existingBid.deliveryDays) : '');
  const [note,       setNote]       = useState(existingBid?.deliveryNotes ?? '');
  const [showNote,   setShowNote]   = useState(!!existingBid?.deliveryNotes);
  const [submitting, setSubmitting] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (request) {
      Animated.spring(slideAnim, {toValue: 1, useNativeDriver: true, tension: 70, friction: 12}).start();
    }
  }, [request, slideAnim]);

  const dismiss = useCallback(() => {
    Animated.timing(slideAnim, {toValue: 0, duration: 200, useNativeDriver: true}).start(onClose);
  }, [slideAnim, onClose]);

  const handleSubmit = useCallback(async () => {
    if (!request) return;
    const amtNum  = parseFloat(amount);
    const daysNum = parseInt(days, 10);
    if (!amount || isNaN(amtNum) || amtNum <= 0) {
      Alert.alert('Invalid amount', 'Enter a valid bid amount.'); return;
    }
    if (!days || isNaN(daysNum) || daysNum <= 0) {
      Alert.alert('Invalid delivery', 'Enter delivery days.'); return;
    }
    setSubmitting(true);
    try {
      const res = await submitBid({
        requestId: request.id,
        amount: amtNum,
        deliveryDays: daysNum,
        ...(note.trim() ? {deliveryNotes: note.trim()} : {}),
      });
      Animated.timing(slideAnim, {toValue: 0, duration: 200, useNativeDriver: true}).start(() => {
        onSubmitted(res.bidId, amount, days);
      });
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message ?? 'Failed to submit bid.');
    } finally {
      setSubmitting(false);
    }
  }, [request, amount, days, note, slideAnim, onSubmitted]);

  if (!request) return null;

  const translateY = slideAnim.interpolate({inputRange: [0, 1], outputRange: [500, 0]});

  return (
    <Modal visible transparent animationType="none" onRequestClose={dismiss}>
      <TouchableWithoutFeedback onPress={dismiss}>
        <Animated.View style={[qs.overlay, {opacity: slideAnim}]} />
      </TouchableWithoutFeedback>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={qs.kav}>
        <Animated.View style={[qs.sheet, {transform: [{translateY}]}]}>
          <View style={qs.handle} />

          <View style={qs.hdr}>
            <Text style={qs.hdrLabel}>QUICK BID</Text>
            <Text style={qs.hdrTitle} numberOfLines={2}>{request.title}</Text>
            <Text style={qs.hdrBudget}>Budget: {formatBudget(request.budgetMin, request.budgetMax)}</Text>
          </View>

          <View style={qs.fields}>
            <View style={qs.row}>
              <View style={[qs.field, {flex: 1.2}]}>
                <Text style={qs.label}>Your Price</Text>
                <View style={qs.inputRow}>
                  <Text style={qs.prefix}>$</Text>
                  <TextInput style={qs.input} value={amount} onChangeText={setAmount}
                    placeholder="0.00" placeholderTextColor="#9CA3AF"
                    keyboardType="decimal-pad" returnKeyType="next" />
                </View>
              </View>
              <View style={[qs.field, {flex: 1}]}>
                <Text style={qs.label}>Delivery</Text>
                <View style={qs.inputRow}>
                  <TextInput style={[qs.input, {flex: 1}]} value={days} onChangeText={setDays}
                    placeholder="0" placeholderTextColor="#9CA3AF"
                    keyboardType="number-pad" returnKeyType="done" />
                  <Text style={qs.suffix}>days</Text>
                </View>
              </View>
            </View>

            {!showNote ? (
              <TouchableOpacity style={qs.addNote} onPress={() => setShowNote(true)} activeOpacity={0.7}>
                <Text style={qs.addNoteText}>+ Add a note  (optional)</Text>
              </TouchableOpacity>
            ) : (
              <View style={qs.field}>
                <Text style={qs.label}>Note to buyer</Text>
                <TextInput style={[qs.inputRow, qs.noteInput]} value={note} onChangeText={setNote}
                  placeholder="What makes your offer stand out?"
                  placeholderTextColor="#9CA3AF" multiline maxLength={300} />
              </View>
            )}

            <View style={qs.chips}>
              {QUICK_REPLIES.map(s => (
                <TouchableOpacity key={s} style={qs.chip}
                  onPress={() => { setNote(s); setShowNote(true); }} activeOpacity={0.7}>
                  <Text style={qs.chipText}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={qs.btns}>
            <TouchableOpacity style={qs.cancelBtn} onPress={dismiss} activeOpacity={0.7}>
              <Text style={qs.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[qs.submitBtn, submitting && qs.disabled]}
              onPress={handleSubmit} disabled={submitting} activeOpacity={0.85}>
              {submitting
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={qs.submitText}>Send Bid  →</Text>}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function MerchantDiscoverScreen() {
  const navigation = useNavigation<Nav>();

  const [requests,    setRequests]    = useState<MarketRequest[]>([]);
  const [myBidsMap,   setMyBidsMap]   = useState<Record<string, Bid>>({});
  const [loading,     setLoading]     = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page,        setPage]        = useState(1);
  const [hasMore,     setHasMore]     = useState(true);
  const [sortIdx,     setSortIdx]     = useState(0);
  const [sheetTarget, setSheetTarget] = useState<MarketRequest | null>(null);

  const loadBidsMap = useCallback(async () => {
    try {
      const res = await getMyBids({limit: 100});
      const map: Record<string, Bid> = {};
      res.bids.forEach(b => { map[b.requestId] = b; });
      setMyBidsMap(map);
    } catch {}
  }, []);

  const fetchRequests = useCallback(async (p: number, sort: number) => {
    const {field, order} = SORT_OPTIONS[sort];
    try {
      const res = await searchRequests({status: 'ACTIVE,HAS_BIDS', page: p, limit: 20, sortBy: field, sortOrder: order});
      setRequests(prev => (p === 1 ? res.requests : [...prev, ...res.requests]));
      setHasMore(p < res.pagination.totalPages);
    } catch {}
    finally { setLoading(false); setRefreshing(false); setLoadingMore(false); }
  }, []);

  const loadAll = useCallback((p = 1, sort = sortIdx, isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else if (p === 1) setLoading(true);
    fetchRequests(p, sort);
    if (p === 1) loadBidsMap();
  }, [fetchRequests, loadBidsMap, sortIdx]);

  useFocusEffect(useCallback(() => { loadAll(1, sortIdx, false); }, [sortIdx])); // eslint-disable-line
  useEffect(() => { loadAll(1, sortIdx); }, [sortIdx]); // eslint-disable-line

  const handleLoadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    const next = page + 1;
    setPage(next);
    setLoadingMore(true);
    fetchRequests(next, sortIdx);
  }, [loadingMore, hasMore, page, sortIdx, fetchRequests]);

  const handleBidSubmitted = useCallback((bidId: string, amount: string, days: string) => {
    const target = sheetTarget;
    setSheetTarget(null);
    if (target) {
      setMyBidsMap(prev => ({
        ...prev,
        [target.id]: {
          id: bidId, requestId: target.id, merchantId: '',
          amount, deliveryDays: parseInt(days, 10),
          status: 'PENDING', priorityScore: 0,
          createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        } as Bid,
      }));
    }
    Alert.alert('Bid sent! 🎉', 'The buyer will be notified of your offer.');
  }, [sheetTarget]);

  return (
    <View style={s.root}>
      <AppHeader />

      {/* Sort bar */}
      <View style={s.sortBar}>
        <Text style={s.feedLabel}>Feed</Text>
        <View style={s.chips}>
          {SORT_OPTIONS.map((opt, i) => (
            <TouchableOpacity
              key={opt.label}
              style={[s.chip, sortIdx === i && s.chipActive]}
              onPress={() => { setSortIdx(i); setPage(1); }}
              activeOpacity={0.7}>
              <Text style={[s.chipText, sortIdx === i && s.chipTextActive]}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading ? (
        <View style={s.center}><ActivityIndicator size="large" color={Colors.primary} /></View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={item => item.id}
          contentContainerStyle={s.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => loadAll(1, sortIdx, true)}
              tintColor={Colors.primary} colors={[Colors.primary]} />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            loadingMore ? <ActivityIndicator style={{marginVertical: 16}} color={Colors.primary} /> : null
          }
          renderItem={({item}) => (
            <PostCard
              item={item}
              myBid={myBidsMap[item.id]}
              onQuickBid={() => setSheetTarget(item)}
              onViewRequest={() => navigation.navigate('RequestDetail', {requestId: item.id})}
            />
          )}
          ListEmptyComponent={
            <View style={s.empty}>
              <Text style={s.emptyIcon}>📋</Text>
              <Text style={s.emptyTitle}>No open requests</Text>
              <Text style={s.emptyDesc}>Pull down to refresh.</Text>
            </View>
          }
        />
      )}

      <QuickBidSheet
        request={sheetTarget}
        existingBid={sheetTarget ? myBidsMap[sheetTarget.id] : undefined}
        onClose={() => setSheetTarget(null)}
        onSubmitted={handleBidSubmitted}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const post = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },

  // Header
  header:   {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 10},
  meta:     {flexDirection: 'row', alignItems: 'center', flex: 1, gap: 6},
  catBadge: {backgroundColor: Colors.primaryLight, borderRadius: 6, paddingHorizontal: 9, paddingVertical: 3},
  catText:  {fontSize: 11, fontWeight: '800', color: Colors.primary, letterSpacing: 0.3},
  dot:      {fontSize: 14, color: Colors.divider},
  location: {fontSize: 12, color: Colors.textSecondary, flex: 1},
  time:     {fontSize: 12, color: Colors.textSecondary, marginLeft: 8},

  // Body
  title: {fontSize: 17, fontWeight: '800', color: Colors.textPrimary, lineHeight: 24, paddingHorizontal: 16, marginBottom: 6},
  desc:  {fontSize: 14, color: Colors.textSecondary, lineHeight: 21, paddingHorizontal: 16, marginBottom: 12},

  // Images
  imgScroll: {marginBottom: 12},
  imgRow:    {paddingHorizontal: 16, gap: 8},
  img:       {width: 200, height: 150, borderRadius: 12},

  // Info strip
  strip: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginHorizontal: 16, marginBottom: 12,
    backgroundColor: Colors.feedBackground, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: Colors.divider,
  },
  budget:      {fontSize: 15, fontWeight: '800', color: Colors.textPrimary},
  expiry:      {fontSize: 12, fontWeight: '600', color: Colors.warning},
  expiryUrgent:{color: Colors.error},

  divider: {height: 1, backgroundColor: Colors.divider, marginBottom: 4},

  // Actions
  actions:       {flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8, gap: 8},
  stat:          {flexDirection: 'row', alignItems: 'center', gap: 5, flex: 1},
  statIcon:      {fontSize: 14},
  statText:      {fontSize: 13, color: Colors.textSecondary, fontWeight: '500'},

  bidBtn:        {flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primary, borderRadius: 20, paddingVertical: 7, paddingHorizontal: 16,
    shadowColor: Colors.primary, shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.3, shadowRadius: 6, elevation: 3},
  bidBtnText:    {fontSize: 13, fontWeight: '800', color: Colors.textOnPrimary},

  bidPending:    {borderRadius: 20, paddingVertical: 8, paddingHorizontal: 14, backgroundColor: Colors.primaryLight, borderWidth: 1, borderColor: Colors.primary},
  bidPendingText:{fontSize: 12, fontWeight: '700', color: Colors.primary},

  bidAccepted:   {borderRadius: 20, paddingVertical: 8, paddingHorizontal: 14, backgroundColor: Colors.successLight},
  bidAcceptedText:{fontSize: 12, fontWeight: '700', color: Colors.success},

  bidClosed:     {borderRadius: 20, paddingVertical: 8, paddingHorizontal: 14, backgroundColor: Colors.feedBackground},
  bidClosedText: {fontSize: 12, fontWeight: '600', color: Colors.textSecondary},

  detailBtn:     {borderRadius: 20, paddingVertical: 8, paddingHorizontal: 14, backgroundColor: Colors.feedBackground},
  detailBtnText: {fontSize: 13, fontWeight: '600', color: Colors.textPrimary},
});

const qs = StyleSheet.create({
  overlay:  {...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)'},
  kav:      {flex: 1, justifyContent: 'flex-end'},
  sheet: {
    backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32,
    shadowColor: '#000', shadowOffset: {width: 0, height: -4}, shadowOpacity: 0.12, shadowRadius: 20, elevation: 24,
  },
  handle:  {width: 40, height: 4, borderRadius: 2, backgroundColor: '#D1D5DB', alignSelf: 'center', marginBottom: 20},
  hdr:     {marginBottom: 20},
  hdrLabel:{fontSize: 11, fontWeight: '700', color: Colors.primary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4},
  hdrTitle:{fontSize: 17, fontWeight: '700', color: Colors.textPrimary, lineHeight: 24, marginBottom: 4},
  hdrBudget:{fontSize: 13, color: Colors.textSecondary},
  fields:  {gap: 12, marginBottom: 20},
  row:     {flexDirection: 'row', gap: 12},
  field:   {gap: 6},
  label:   {fontSize: 12, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5},
  inputRow:{flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.feedBackground, borderRadius: 12, borderWidth: 1.5, borderColor: Colors.divider, paddingHorizontal: 12, height: 48},
  prefix:  {fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginRight: 4},
  suffix:  {fontSize: 13, color: Colors.textSecondary, marginLeft: 4},
  input:   {fontSize: 18, fontWeight: '700', color: Colors.textPrimary, flex: 1},
  addNote: {paddingVertical: 8},
  addNoteText:{fontSize: 13, color: Colors.primary, fontWeight: '600'},
  noteInput:{height: 80, alignItems: 'flex-start', paddingTop: 10, paddingBottom: 10},
  chips:   {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
  chip:    {backgroundColor: Colors.feedBackground, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: Colors.divider},
  chipText:{fontSize: 12, color: Colors.textPrimary, fontWeight: '500'},
  btns:    {flexDirection: 'row', gap: 12},
  cancelBtn:{flex: 1, backgroundColor: '#FFFFFF', borderRadius: 10, borderWidth: 1, borderColor: '#E4E6EA', paddingVertical: 12, alignItems: 'center'},
  cancelText:{fontSize: 14, fontWeight: '600', color: Colors.textSecondary},
  submitBtn:{flex: 2, borderRadius: 10, backgroundColor: Colors.primary, paddingVertical: 12, alignItems: 'center',
    shadowColor: Colors.primary, shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4},
  submitText:{fontSize: 14, fontWeight: '800', color: Colors.textOnPrimary},
  disabled: {opacity: 0.6},
});

const s = StyleSheet.create({
  root:      {flex: 1, backgroundColor: Colors.feedBackground},
  sortBar:   {flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.divider, gap: 12},
  feedLabel: {fontSize: 15, fontWeight: '800', color: Colors.textPrimary},
  chips:     {flexDirection: 'row', gap: 8, flex: 1, justifyContent: 'flex-end'},
  chip:      {borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, backgroundColor: Colors.feedBackground, borderWidth: 1, borderColor: Colors.divider},
  chipActive:{backgroundColor: Colors.primaryLight, borderColor: Colors.primary},
  chipText:  {fontSize: 12, fontWeight: '600', color: Colors.textSecondary},
  chipTextActive:{color: Colors.primary, fontWeight: '700'},
  list:      {paddingBottom: 32},
  center:    {flex: 1, alignItems: 'center', justifyContent: 'center'},
  empty:     {flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 80},
  emptyIcon: {fontSize: 48, marginBottom: 12},
  emptyTitle:{fontSize: 17, fontWeight: '700', color: Colors.textPrimary, marginBottom: 6},
  emptyDesc: {fontSize: 13, color: Colors.textSecondary},
});
