import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {Bid, MarketRequest} from '../../../types/api';
import {searchRequests} from '../../../api/requests';
import {getMyBids, submitBid} from '../../../api/bids';
import AppHeader from '../../../components/AppHeader';

const ACCENT = '#16A34A';

const SORT_OPTIONS = [
  {label: 'Newest',  field: 'created_at', order: 'desc'},
  {label: 'Budget',  field: 'budget_max', order: 'desc'},
  {label: 'Expiring',field: 'expires_at', order: 'asc'},
];

const QUICK_REPLIES = ['Can you do it faster?', 'Whats included?', 'I can lower the price'];

// ─── helpers ──────────────────────────────────────────────────────────────────

function formatBudget(min?: number | null, max?: number | null) {
  if (!min && !max) return 'Open budget';
  if (min && max) return `$${Number(min).toLocaleString()}–$${Number(max).toLocaleString()}`;
  if (max) return `Up to $${Number(max).toLocaleString()}`;
  return `From $${Number(min!).toLocaleString()}`;
}

function timeAgo(iso: string) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function daysLeft(iso?: string | null) {
  if (!iso) return null;
  const d = Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);
  if (d <= 0) return null;
  return d <= 2 ? `${d}d left` : `${d} days left`;
}

// ─── Request card ─────────────────────────────────────────────────────────────

function RequestCard({
  item,
  myBid,
  onQuickBid,
}: {
  item: MarketRequest;
  myBid?: Bid;
  onQuickBid: () => void;
}) {
  const expiry = daysLeft(item.expiresAt);
  const urgent = expiry && expiry.startsWith('1');

  const hasBid   = !!myBid;
  const isPending  = myBid?.status === 'PENDING';
  const isAccepted = myBid?.status === 'ACCEPTED';
  const isOther    = hasBid && !isPending && !isAccepted;

  return (
    <View style={rc.card}>
      {/* Top row */}
      <View style={rc.topRow}>
        {item.category ? (
          <View style={rc.catBadge}><Text style={rc.catText}>{item.category.name}</Text></View>
        ) : <View />}
        <View style={rc.topRight}>
          {expiry && <Text style={[rc.expiry, urgent ? rc.expiryUrgent : null]}>{expiry}</Text>}
          <Text style={rc.time}>{timeAgo(item.createdAt)}</Text>
        </View>
      </View>

      {/* Content */}
      <Text style={rc.title} numberOfLines={2}>{item.title}</Text>
      <Text style={rc.desc} numberOfLines={2}>{item.description}</Text>

      {/* Footer */}
      <View style={rc.footer}>
        <View>
          <Text style={rc.budget}>{formatBudget(item.budgetMin, item.budgetMax)}</Text>
          <Text style={rc.bids}>{item.bidCount > 0 ? `${item.bidCount} bid${item.bidCount !== 1 ? 's' : ''}` : 'No bids yet'}</Text>
        </View>

        {/* CTA */}
        {!hasBid && (
          <TouchableOpacity style={rc.ctaBtn} onPress={onQuickBid} activeOpacity={0.8}>
            <Text style={rc.ctaBtnText}>Quick Bid  →</Text>
          </TouchableOpacity>
        )}
        {isPending && (
          <TouchableOpacity style={rc.bidBadge} onPress={onQuickBid} activeOpacity={0.8}>
            <Text style={rc.bidBadgeText}>✓  ${parseFloat(myBid!.amount).toFixed(0)}  ·  Pending</Text>
          </TouchableOpacity>
        )}
        {isAccepted && (
          <View style={[rc.bidBadge, rc.bidBadgeAccepted]}>
            <Text style={[rc.bidBadgeText, rc.bidBadgeAcceptedText]}>🎉  Accepted!</Text>
          </View>
        )}
        {isOther && (
          <View style={[rc.bidBadge, rc.bidBadgeMuted]}>
            <Text style={[rc.bidBadgeText, rc.bidBadgeMutedText]}>Closed</Text>
          </View>
        )}
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
  const [amount,      setAmount]      = useState(existingBid ? String(parseFloat(existingBid.amount)) : '');
  const [days,        setDays]        = useState(existingBid ? String(existingBid.deliveryDays) : '');
  const [note,        setNote]        = useState(existingBid?.deliveryNotes ?? '');
  const [showNote,    setShowNote]    = useState(!!existingBid?.deliveryNotes);
  const [submitting,  setSubmitting]  = useState(false);
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
    const amtNum = parseFloat(amount);
    const daysNum = parseInt(days, 10);
    if (!amount || isNaN(amtNum) || amtNum <= 0) {
      Alert.alert('Invalid amount', 'Enter a valid bid amount.');
      return;
    }
    if (!days || isNaN(daysNum) || daysNum <= 0) {
      Alert.alert('Invalid delivery', 'Enter delivery days.');
      return;
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
      const msg = err?.response?.data?.message ?? 'Failed to submit bid.';
      Alert.alert('Error', msg);
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

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={qs.kav}>
        <Animated.View style={[qs.sheet, {transform: [{translateY}]}]}>
          <View style={qs.handle} />

          {/* Header */}
          <View style={qs.header}>
            <Text style={qs.headerLabel}>Quick Bid</Text>
            <Text style={qs.headerTitle} numberOfLines={2}>{request.title}</Text>
            {request.budgetMin || request.budgetMax ? (
              <Text style={qs.headerBudget}>Budget: {formatBudget(request.budgetMin, request.budgetMax)}</Text>
            ) : null}
          </View>

          {/* Fields */}
          <View style={qs.fields}>
            <View style={qs.row}>
              <View style={[qs.field, {flex: 1.2}]}>
                <Text style={qs.fieldLabel}>Your Price</Text>
                <View style={qs.inputWrap}>
                  <Text style={qs.inputPrefix}>$</Text>
                  <TextInput
                    style={qs.input}
                    value={amount}
                    onChangeText={setAmount}
                    placeholder="0.00"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="decimal-pad"
                    returnKeyType="next"
                  />
                </View>
              </View>
              <View style={[qs.field, {flex: 1}]}>
                <Text style={qs.fieldLabel}>Delivery</Text>
                <View style={qs.inputWrap}>
                  <TextInput
                    style={[qs.input, {flex: 1}]}
                    value={days}
                    onChangeText={setDays}
                    placeholder="0"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="number-pad"
                    returnKeyType="done"
                  />
                  <Text style={qs.inputSuffix}>days</Text>
                </View>
              </View>
            </View>

            {/* Note toggle */}
            {!showNote ? (
              <TouchableOpacity style={qs.addNote} onPress={() => setShowNote(true)} activeOpacity={0.7}>
                <Text style={qs.addNoteText}>+ Add a note  (optional)</Text>
              </TouchableOpacity>
            ) : (
              <View style={qs.field}>
                <Text style={qs.fieldLabel}>Note to buyer</Text>
                <TextInput
                  style={[qs.inputWrap, qs.noteInput]}
                  value={note}
                  onChangeText={setNote}
                  placeholder="What makes your offer stand out?"
                  placeholderTextColor="#9CA3AF"
                  multiline
                  maxLength={300}
                />
              </View>
            )}

            {/* Quick reply suggestions */}
            <View style={qs.suggestRow}>
              {QUICK_REPLIES.map(s => (
                <TouchableOpacity key={s} style={qs.suggest} onPress={() => { setNote(s); setShowNote(true); }} activeOpacity={0.7}>
                  <Text style={qs.suggestText}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Actions */}
          <View style={qs.actions}>
            <TouchableOpacity style={qs.cancelBtn} onPress={dismiss} activeOpacity={0.7}>
              <Text style={qs.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[qs.submitBtn, submitting && qs.btnDisabled]}
              onPress={handleSubmit}
              disabled={submitting}
              activeOpacity={0.85}>
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
  const [requests,    setRequests]    = useState<MarketRequest[]>([]);
  const [myBidsMap,   setMyBidsMap]   = useState<Record<string, Bid>>({});
  const [loading,     setLoading]     = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page,        setPage]        = useState(1);
  const [hasMore,     setHasMore]     = useState(true);
  const [sortIdx,     setSortIdx]     = useState(0);
  const [search,      setSearch]      = useState('');
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

  useFocusEffect(useCallback(() => { loadAll(1, sortIdx, false); }, [sortIdx])); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { loadAll(1, sortIdx); }, [sortIdx]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const displayed = search.trim()
    ? requests.filter(r =>
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.description?.toLowerCase().includes(search.toLowerCase()))
    : requests;

  return (
    <View style={s.root}>
      <AppHeader accentColor={ACCENT} />

      {/* Search */}
      <View style={s.searchRow}>
        <Text style={s.searchIcon}>🔍</Text>
        <TextInput
          style={s.searchInput}
          placeholder="Search requests…"
          placeholderTextColor="#9CA3AF"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')} hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
            <Text style={s.clearBtn}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Sort */}
      <View style={s.sortRow}>
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

      {loading ? (
        <View style={s.center}><ActivityIndicator size="large" color={ACCENT} /></View>
      ) : (
        <FlatList
          data={displayed}
          keyExtractor={item => item.id}
          contentContainerStyle={s.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadAll(1, sortIdx, true)} tintColor={ACCENT} colors={[ACCENT]} />}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={loadingMore ? <ActivityIndicator style={{marginVertical: 16}} color={ACCENT} /> : null}
          renderItem={({item}) => (
            <RequestCard
              item={item}
              myBid={myBidsMap[item.id]}
              onQuickBid={() => setSheetTarget(item)}
            />
          )}
          ListEmptyComponent={
            <View style={s.empty}>
              <Text style={s.emptyIcon}>📋</Text>
              <Text style={s.emptyTitle}>{search ? 'No matching requests' : 'No open requests'}</Text>
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

const rc = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 10,
    shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  topRow:    {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8},
  topRight:  {alignItems: 'flex-end', gap: 2},
  catBadge:  {backgroundColor: '#DCFCE7', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3},
  catText:   {fontSize: 11, fontWeight: '700', color: ACCENT},
  expiry:    {fontSize: 11, color: '#D97706', fontWeight: '600'},
  expiryUrgent: {color: '#DC2626'},
  time:      {fontSize: 11, color: '#9CA3AF'},
  title:     {fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 4, lineHeight: 22},
  desc:      {fontSize: 13, color: '#6B7280', marginBottom: 12, lineHeight: 19},
  footer:    {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  budget:    {fontSize: 14, fontWeight: '700', color: '#111827'},
  bids:      {fontSize: 11, color: '#9CA3AF', marginTop: 2},
  ctaBtn:    {backgroundColor: ACCENT, borderRadius: 22, paddingVertical: 9, paddingHorizontal: 18,
    shadowColor: ACCENT, shadowOffset: {width: 0, height: 3}, shadowOpacity: 0.35, shadowRadius: 6, elevation: 3},
  ctaBtnText:{fontSize: 13, fontWeight: '800', color: '#FFFFFF'},
  bidBadge:  {borderRadius: 20, paddingVertical: 7, paddingHorizontal: 12, backgroundColor: '#DCFCE7'},
  bidBadgeText:{fontSize: 12, fontWeight: '700', color: ACCENT},
  bidBadgeAccepted: {backgroundColor: '#F0FDF4'},
  bidBadgeAcceptedText: {color: '#15803D'},
  bidBadgeMuted: {backgroundColor: '#F3F4F6'},
  bidBadgeMutedText: {color: '#9CA3AF'},
});

const qs = StyleSheet.create({
  overlay:   {...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)'},
  kav:       {flex: 1, justifyContent: 'flex-end'},
  sheet: {
    backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32,
    shadowColor: '#000', shadowOffset: {width: 0, height: -4}, shadowOpacity: 0.12, shadowRadius: 20, elevation: 24,
  },
  handle:    {width: 40, height: 4, borderRadius: 2, backgroundColor: '#D1D5DB', alignSelf: 'center', marginBottom: 20},
  header:    {marginBottom: 20},
  headerLabel:{fontSize: 11, fontWeight: '700', color: ACCENT, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4},
  headerTitle:{fontSize: 17, fontWeight: '700', color: '#111827', lineHeight: 24, marginBottom: 4},
  headerBudget:{fontSize: 13, color: '#6B7280'},
  fields:    {gap: 12, marginBottom: 20},
  row:       {flexDirection: 'row', gap: 12},
  field:     {gap: 6},
  fieldLabel:{fontSize: 12, fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5},
  inputWrap: {flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 12, borderWidth: 1.5, borderColor: '#E5E7EB', paddingHorizontal: 12, height: 48},
  inputPrefix:{fontSize: 16, fontWeight: '700', color: '#374151', marginRight: 4},
  inputSuffix:{fontSize: 13, color: '#9CA3AF', marginLeft: 4},
  input:     {fontSize: 18, fontWeight: '700', color: '#111827', flex: 1},
  addNote:   {paddingVertical: 8},
  addNoteText:{fontSize: 13, color: ACCENT, fontWeight: '600'},
  noteInput: {height: 80, alignItems: 'flex-start', paddingTop: 10, paddingBottom: 10},
  suggestRow:{flexDirection: 'row', flexWrap: 'wrap', gap: 8},
  suggest:   {backgroundColor: '#F3F4F6', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: '#E5E7EB'},
  suggestText:{fontSize: 12, color: '#374151', fontWeight: '500'},
  actions:   {flexDirection: 'row', gap: 12},
  cancelBtn: {flex: 1, borderRadius: 14, borderWidth: 1.5, borderColor: '#E5E7EB', paddingVertical: 15, alignItems: 'center'},
  cancelText:{fontSize: 15, fontWeight: '600', color: '#6B7280'},
  submitBtn: {flex: 2, borderRadius: 14, backgroundColor: ACCENT, paddingVertical: 15, alignItems: 'center',
    shadowColor: ACCENT, shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4},
  submitText:{fontSize: 16, fontWeight: '800', color: '#FFFFFF'},
  btnDisabled:{opacity: 0.6},
});

const s = StyleSheet.create({
  root:       {flex: 1, backgroundColor: '#F9FAFB'},
  searchRow:  {flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', margin: 12, borderRadius: 12, paddingHorizontal: 12, borderWidth: 1, borderColor: '#E5E7EB'},
  searchIcon: {fontSize: 15, marginRight: 8},
  searchInput:{flex: 1, fontSize: 15, color: '#111827', paddingVertical: 10},
  clearBtn:   {fontSize: 13, color: '#9CA3AF', paddingLeft: 8},
  sortRow:    {flexDirection: 'row', paddingHorizontal: 12, paddingBottom: 8, gap: 8},
  chip:       {borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB'},
  chipActive: {backgroundColor: '#DCFCE7', borderColor: ACCENT},
  chipText:   {fontSize: 12, fontWeight: '600', color: '#6B7280'},
  chipTextActive: {color: ACCENT, fontWeight: '700'},
  list:       {paddingHorizontal: 12, paddingBottom: 32, flexGrow: 1},
  center:     {flex: 1, alignItems: 'center', justifyContent: 'center'},
  empty:      {flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 80},
  emptyIcon:  {fontSize: 48, marginBottom: 12},
  emptyTitle: {fontSize: 17, fontWeight: '700', color: '#374151', marginBottom: 6},
  emptyDesc:  {fontSize: 13, color: '#9CA3AF'},
});
