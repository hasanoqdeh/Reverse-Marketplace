import {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../../types/navigation';
import {PublicPlatformStats, RequestCategory, TopMerchant, MarketRequest} from '../../../types/api';
import {getPublicStats, getTopMerchants} from '../../../api/merchants';
import {getCategories, searchRequests} from '../../../api/requests';
import AppHeader from '../../../components/AppHeader';

const ACCENT = '#2563EB';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const CATEGORY_EMOJI: Record<string, string> = {
  electronics: '📱', clothing: '👗', food: '🍔', furniture: '🛋️',
  books: '📚', beauty: '💄', sports: '⚽', automotive: '🚗',
  home: '🏠', garden: '🌿', toys: '🧸', health: '💊',
  services: '🔧', travel: '✈️', pets: '🐾', music: '🎵',
};

function categoryEmoji(name: string): string {
  const key = name.toLowerCase();
  for (const [k, v] of Object.entries(CATEGORY_EMOJI)) {
    if (key.includes(k)) {return v;}
  }
  return '🛍️';
}

function StatPill({icon, value, label}: {icon: string; value: string; label: string}) {
  return (
    <View style={pill.wrap}>
      <Text style={pill.icon}>{icon}</Text>
      <Text style={pill.value}>{value}</Text>
      <Text style={pill.label}>{label}</Text>
    </View>
  );
}

const pill = StyleSheet.create({
  wrap:  {flex: 1, alignItems: 'center'},
  icon:  {fontSize: 22, marginBottom: 4},
  value: {fontSize: 18, fontWeight: '800', color: '#111827'},
  label: {fontSize: 11, color: '#6B7280', marginTop: 1},
});

function CategoryTile({cat, onPress}: {cat: RequestCategory; onPress: () => void}) {
  return (
    <TouchableOpacity style={ct.tile} onPress={onPress} activeOpacity={0.75}>
      <Text style={ct.emoji}>{categoryEmoji(cat.name)}</Text>
      <Text style={ct.name} numberOfLines={1}>{cat.name}</Text>
    </TouchableOpacity>
  );
}

const ct = StyleSheet.create({
  tile: {
    flex: 1, backgroundColor: '#FFFFFF', borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: 16, paddingHorizontal: 8, margin: 5,
    shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.07, shadowRadius: 4, elevation: 2,
  },
  emoji: {fontSize: 28, marginBottom: 6},
  name:  {fontSize: 12, fontWeight: '600', color: '#374151', textAlign: 'center'},
});

function MerchantCard({merchant, onPress}: {merchant: TopMerchant; onPress: () => void}) {
  const name = merchant.profile?.firstName
    ? `${merchant.profile.firstName}${merchant.profile.lastName ? ' ' + merchant.profile.lastName : ''}`
    : 'Merchant';
  const initials = name.substring(0, 2).toUpperCase();
  return (
    <TouchableOpacity style={mc.card} onPress={onPress} activeOpacity={0.8}>
      <View style={mc.avatar}>
        <Text style={mc.initials}>{initials}</Text>
      </View>
      <Text style={mc.name} numberOfLines={1}>{name}</Text>
      {merchant.profile?.city && (
        <Text style={mc.city} numberOfLines={1}>📍 {merchant.profile.city}</Text>
      )}
      <View style={mc.ratingRow}>
        <Text style={mc.star}>★</Text>
        <Text style={mc.rating}>{merchant.avgRating?.toFixed(1) ?? '—'}</Text>
        <Text style={mc.reviews}>({merchant.reviewCount})</Text>
      </View>
      <Text style={mc.done}>{merchant.completedBids} jobs done</Text>
    </TouchableOpacity>
  );
}

const mc = StyleSheet.create({
  card: {
    width: 140, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14, marginRight: 12,
    alignItems: 'center',
    shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.07, shadowRadius: 6, elevation: 3,
  },
  avatar:   {width: 56, height: 56, borderRadius: 28, backgroundColor: '#DBEAFE', alignItems: 'center', justifyContent: 'center', marginBottom: 10},
  initials: {fontSize: 20, fontWeight: '800', color: ACCENT},
  name:     {fontSize: 13, fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: 2},
  city:     {fontSize: 11, color: '#6B7280', textAlign: 'center', marginBottom: 6},
  ratingRow:{flexDirection: 'row', alignItems: 'center', gap: 2, marginBottom: 4},
  star:     {fontSize: 13, color: '#F59E0B'},
  rating:   {fontSize: 13, fontWeight: '700', color: '#111827'},
  reviews:  {fontSize: 11, color: '#6B7280'},
  done:     {fontSize: 11, color: '#6B7280'},
});

function DealCard({request}: {request: MarketRequest}) {
  return (
    <View style={dc.card}>
      <View style={dc.left}>
        <Text style={dc.category}>{request.category?.name ?? 'General'}</Text>
        {request.locationCity && <Text style={dc.location}>📍 {request.locationCity}</Text>}
      </View>
      <Text style={dc.badge}>✅ Completed</Text>
    </View>
  );
}

const dc = StyleSheet.create({
  card:     {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, marginBottom: 8, shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1},
  left:     {flex: 1},
  category: {fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 2},
  location: {fontSize: 12, color: '#6B7280'},
  badge:    {fontSize: 12, fontWeight: '600', color: '#15803D', backgroundColor: '#DCFCE7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20},
});

function StepItem({number, title, description}: {number: string; title: string; description: string}) {
  return (
    <View style={si.row}>
      <View style={si.circle}>
        <Text style={si.num}>{number}</Text>
      </View>
      <View style={si.text}>
        <Text style={si.title}>{title}</Text>
        <Text style={si.desc}>{description}</Text>
      </View>
    </View>
  );
}

const si = StyleSheet.create({
  row:    {flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16},
  circle: {width: 32, height: 32, borderRadius: 16, backgroundColor: '#DBEAFE', borderWidth: 1.5, borderColor: ACCENT, alignItems: 'center', justifyContent: 'center', marginRight: 12, marginTop: 2},
  num:    {fontSize: 14, fontWeight: '700', color: ACCENT},
  text:   {flex: 1},
  title:  {fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 2},
  desc:   {fontSize: 13, color: '#6B7280', lineHeight: 18},
});

export default function BuyerDiscoverScreen() {
  const navigation = useNavigation<Nav>();

  const [stats, setStats]         = useState<PublicPlatformStats | null>(null);
  const [categories, setCategories] = useState<RequestCategory[]>([]);
  const [topMerchants, setTopMerchants] = useState<TopMerchant[]>([]);
  const [recentDeals, setRecentDeals]   = useState<MarketRequest[]>([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const [statsRes, catsRes, merchantsRes, dealsRes] = await Promise.allSettled([
      getPublicStats(),
      getCategories(),
      getTopMerchants(8),
      searchRequests({status: 'COMPLETED', limit: 5}),
    ]);
    if (statsRes.status     === 'fulfilled') {setStats(statsRes.value);}
    if (catsRes.status      === 'fulfilled') {setCategories(catsRes.value.slice(0, 12));}
    if (merchantsRes.status === 'fulfilled') {setTopMerchants(merchantsRes.value);}
    if (dealsRes.status     === 'fulfilled') {setRecentDeals(dealsRes.value.requests);}
    setLoading(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const goCreate = () => navigation.navigate('CreateRequest');

  if (loading) {
    return (
      <View style={s.root}>
        <AppHeader />
        <View style={s.center}>
          <ActivityIndicator size="large" color={ACCENT} />
        </View>
      </View>
    );
  }

  const catRows: RequestCategory[][] = [];
  for (let i = 0; i < categories.length; i += 2) {
    catRows.push(categories.slice(i, i + 2));
  }

  return (
    <View style={s.root}>
      <AppHeader />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); load(); }}
            tintColor={ACCENT}
            colors={[ACCENT]}
          />
        }>

        {/* Hero */}
        <View style={s.hero}>
          <Text style={s.heroTitle}>Find the best merchants{'\n'}for anything</Text>
          <Text style={s.heroSub}>Post a request, get competitive bids</Text>
          <TouchableOpacity style={s.heroCta} onPress={goCreate} activeOpacity={0.85}>
            <Text style={s.heroCtaText}>Post a Request →</Text>
          </TouchableOpacity>
        </View>

        {/* Trust stats strip */}
        <View style={s.statsCard}>
          <StatPill
            icon="🏪"
            value={stats?.merchantCount != null ? `${stats.merchantCount}` : '—'}
            label="Merchants"
          />
          <View style={s.statsDivider} />
          <StatPill
            icon="✅"
            value={stats?.completedRequests != null ? `${stats.completedRequests}` : '—'}
            label="Deals Done"
          />
          <View style={s.statsDivider} />
          <StatPill
            icon="⭐"
            value={stats?.avgRating != null ? `${stats.avgRating.toFixed(1)}` : '—'}
            label="Avg Rating"
          />
        </View>

        {/* Browse Categories */}
        {catRows.length > 0 && (
          <>
            <Text style={s.sectionTitle}>Browse Categories</Text>
            <View style={s.catGrid}>
              {catRows.map((row, ri) => (
                <View key={ri} style={s.catRow}>
                  {row.map(cat => (
                    <CategoryTile key={cat.id} cat={cat} onPress={goCreate} />
                  ))}
                  {row.length === 1 && <View style={{flex: 1, margin: 5}} />}
                </View>
              ))}
            </View>
          </>
        )}

        {/* Top Merchants */}
        {topMerchants.length > 0 && (
          <>
            <Text style={s.sectionTitle}>Top Merchants</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.merchantsScroll}>
              {topMerchants.map(m => (
                <MerchantCard
                  key={m.id}
                  merchant={m}
                  onPress={() => navigation.navigate('MerchantStore', {merchantId: m.id})}
                />
              ))}
            </ScrollView>
          </>
        )}

        {/* How it works */}
        <Text style={s.sectionTitle}>How it works</Text>
        <View style={s.stepsCard}>
          <StepItem number="1" title="Post your request" description="Describe what you want to buy" />
          <StepItem number="2" title="Receive bids" description="Merchants send you their best offers" />
          <StepItem number="3" title="Choose the best" description="Pick the offer that suits you most" />
        </View>

        {/* Recent Deals */}
        {recentDeals.length > 0 && (
          <>
            <Text style={s.sectionTitle}>Recent Deals</Text>
            <View style={s.dealsWrap}>
              {recentDeals.map(r => <DealCard key={r.id} request={r} />)}
            </View>
          </>
        )}

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:    {flex: 1, backgroundColor: '#F3F4F6'},
  center:  {flex: 1, alignItems: 'center', justifyContent: 'center'},
  scroll:  {paddingBottom: 40},

  hero: {
    backgroundColor: ACCENT, paddingHorizontal: 24, paddingTop: 28, paddingBottom: 36,
  },
  heroTitle: {fontSize: 24, fontWeight: '800', color: '#FFFFFF', lineHeight: 32, marginBottom: 8},
  heroSub:   {fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 20},
  heroCta:   {backgroundColor: '#FFFFFF', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 20, alignSelf: 'flex-start'},
  heroCtaText:{fontSize: 15, fontWeight: '700', color: ACCENT},

  statsCard: {
    flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 16, marginHorizontal: 16,
    marginTop: -20, padding: 20, alignItems: 'center',
    shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.10, shadowRadius: 12, elevation: 6,
  },
  statsDivider: {width: 1, height: 40, backgroundColor: '#E5E7EB'},

  sectionTitle: {fontSize: 17, fontWeight: '700', color: '#111827', marginTop: 24, marginBottom: 12, paddingHorizontal: 20},

  catGrid: {paddingHorizontal: 11},
  catRow:  {flexDirection: 'row'},

  merchantsScroll: {paddingHorizontal: 16, paddingBottom: 4},

  stepsCard: {
    backgroundColor: '#FFFFFF', marginHorizontal: 16, borderRadius: 16, padding: 20,
    shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
  },

  dealsWrap: {paddingHorizontal: 16},
});
