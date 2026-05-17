import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../types/navigation';
import {MerchantProfile, Review} from '../../types/api';
import {getMerchantProfile, getReviews} from '../../api/reviews';

type Props = NativeStackScreenProps<RootStackParamList, 'MerchantStore'>;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'});
}

function StarRow({rating}: {rating: number}) {
  return (
    <View style={{flexDirection: 'row', gap: 2}}>
      {[1, 2, 3, 4, 5].map(s => (
        <Text key={s} style={{fontSize: 14, color: s <= rating ? '#F59E0B' : '#D1D5DB'}}>★</Text>
      ))}
    </View>
  );
}

function ReviewCard({review}: {review: Review}) {
  return (
    <View style={rc.card}>
      <View style={rc.top}>
        <StarRow rating={review.rating} />
        <Text style={rc.date}>{formatDate(review.createdAt)}</Text>
      </View>
      {review.comment ? <Text style={rc.comment}>{review.comment}</Text> : null}
    </View>
  );
}

const rc = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, marginBottom: 10,
    shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  top: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6},
  date: {fontSize: 11, color: '#9CA3AF'},
  comment: {fontSize: 14, color: '#374151', lineHeight: 20},
});

export default function MerchantStoreScreen({route, navigation}: Props) {
  const {merchantId} = route.params;

  const [profile, setProfile] = useState<MerchantProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (refresh = false) => {
    try {
      const [prof, reviewsRes] = await Promise.all([
        getMerchantProfile(merchantId),
        getReviews(merchantId, {limit: 20}),
      ]);
      setProfile(prof);
      setReviews(reviewsRes.reviews);
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [merchantId]);

  useEffect(() => { load(); }, [load]);

  const handleRefresh = () => { setRefreshing(true); load(true); };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#16A34A" />
        </View>
      </SafeAreaView>
    );
  }

  const displayName = profile?.profile?.firstName
    ? `${profile.profile.firstName}${profile.profile.lastName ? ' ' + profile.profile.lastName : ''}`
    : `Merchant ${merchantId.slice(0, 6)}`;

  const initials = displayName.substring(0, 2).toUpperCase();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Merchant Profile</Text>
        <View style={{width: 28}} />
      </View>

      <FlatList
        data={reviews}
        keyExtractor={item => item.id}
        contentContainerStyle={{padding: 16, paddingBottom: 40}}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#16A34A" colors={['#16A34A']} />
        }
        ListHeaderComponent={
          <>
            {/* Profile hero */}
            <View style={styles.heroCard}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
              <Text style={styles.name}>{displayName}</Text>
              {profile?.profile?.city && (
                <Text style={styles.location}>📍 {profile.profile.city}{profile.profile.country ? `, ${profile.profile.country}` : ''}</Text>
              )}
              {profile?.memberSince && (
                <Text style={styles.memberSince}>Member since {formatDate(profile.memberSince)}</Text>
              )}

              {/* Stats row */}
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {profile?.avgRating != null ? `${profile.avgRating.toFixed(1)} ★` : '— ★'}
                  </Text>
                  <Text style={styles.statLabel}>{profile?.reviewCount ?? 0} reviews</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{profile?.completedBids ?? 0}</Text>
                  <Text style={styles.statLabel}>jobs done</Text>
                </View>
              </View>
            </View>

            {reviews.length > 0 && (
              <Text style={styles.sectionTitle}>Reviews</Text>
            )}
          </>
        }
        renderItem={({item}) => <ReviewCard review={item} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>⭐</Text>
            <Text style={styles.emptyText}>No reviews yet</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: '#F3F4F6'},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
  },
  back: {fontSize: 20, color: '#374151', fontWeight: '600'},
  headerTitle: {fontSize: 17, fontWeight: '700', color: '#111827', flex: 1, textAlign: 'center'},
  heroCard: {
    backgroundColor: '#FFFFFF', borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 16,
    shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.07, shadowRadius: 10, elevation: 3,
  },
  avatar: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#DCFCE7',
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  avatarText: {fontSize: 28, fontWeight: '800', color: '#16A34A'},
  name: {fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 4},
  location: {fontSize: 13, color: '#6B7280', marginBottom: 2},
  memberSince: {fontSize: 12, color: '#9CA3AF', marginBottom: 16},
  statsRow: {flexDirection: 'row', alignItems: 'center', gap: 24},
  statItem: {alignItems: 'center'},
  statValue: {fontSize: 22, fontWeight: '800', color: '#111827'},
  statLabel: {fontSize: 12, color: '#6B7280', marginTop: 2},
  statDivider: {width: 1, height: 32, backgroundColor: '#E5E7EB'},
  sectionTitle: {fontSize: 16, fontWeight: '700', color: '#374151', marginBottom: 12},
  empty: {alignItems: 'center', paddingVertical: 40},
  emptyIcon: {fontSize: 40, marginBottom: 10},
  emptyText: {fontSize: 15, color: '#9CA3AF'},
});
