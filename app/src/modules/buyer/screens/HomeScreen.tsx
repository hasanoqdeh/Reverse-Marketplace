import React, {useCallback, useEffect, useState} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useAuth} from '../../../context/AuthContext';
import {RootStackParamList} from '../../../types/navigation';
import {MarketRequest} from '../../../types/api';
import {getMyRequests} from '../../../api/requests';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const ACCENT = '#2563EB';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) {return 'Good morning';}
  if (hour < 18) {return 'Good afternoon';}
  return 'Good evening';
}

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: '#16A34A',
  HAS_BIDS: '#2563EB',
  DRAFT: '#6B7280',
  COMPLETED: '#15803D',
  CANCELLED: '#DC2626',
  EXPIRED: '#D97706',
};

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: 'Active',
  HAS_BIDS: 'Has Bids',
  DRAFT: 'Draft',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  EXPIRED: 'Expired',
};

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const {user} = useAuth();
  const displayName = user?.profile?.firstName ?? user?.phone ?? 'there';

  const [recentRequests, setRecentRequests] = useState<MarketRequest[]>([]);

  useEffect(() => {
    getMyRequests({page: 1, limit: 3})
      .then(res => setRecentRequests(res.requests))
      .catch(() => {});
  }, []);

  const handlePostRequest = useCallback(() => {
    navigation.navigate('CreateRequest');
  }, [navigation]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.userName} numberOfLines={1}>{displayName}</Text>
          </View>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{(displayName[0] ?? 'U').toUpperCase()}</Text>
          </View>
        </View>

        {/* Post request card */}
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <View style={styles.cardTextArea}>
              <Text style={styles.cardTitle}>Post a Request</Text>
              <Text style={styles.cardDesc}>
                Tell merchants what you need and let them compete to serve you best.
              </Text>
            </View>
            <TouchableOpacity style={styles.addBtn} onPress={handlePostRequest} activeOpacity={0.8}>
              <Text style={styles.addBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* How it works */}
        <Text style={styles.sectionTitle}>How it works</Text>
        <View style={styles.stepsCard}>
          <StepItem number="1" title="Post your request" description="Describe what you want to buy" />
          <StepItem number="2" title="Receive bids" description="Merchants send you their best offers" />
          <StepItem number="3" title="Choose the best" description="Pick the offer that suits you most" />
        </View>

        {/* Recent activity */}
        <Text style={styles.sectionTitle}>Recent Requests</Text>
        {recentRequests.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>No requests yet</Text>
            <Text style={styles.emptySubtitle}>Post your first request to get started</Text>
          </View>
        ) : (
          recentRequests.map(req => (
            <TouchableOpacity
              key={req.id}
              style={styles.recentCard}
              onPress={() => navigation.navigate('RequestDetail', {requestId: req.id})}
              activeOpacity={0.7}>
              <View style={styles.recentTop}>
                <Text style={[styles.recentStatus, {color: STATUS_COLOR[req.status] ?? '#6B7280'}]}>
                  {STATUS_LABEL[req.status] ?? req.status}
                </Text>
                <Text style={styles.recentBids}>{req.bidCount} bids</Text>
              </View>
              <Text style={styles.recentTitle} numberOfLines={1}>{req.title}</Text>
              {req.category && <Text style={styles.recentCategory}>{req.category.name}</Text>}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function StepItem({number, title, description}: {number: string; title: string; description: string}) {
  return (
    <View style={stepStyles.row}>
      <View style={stepStyles.circle}>
        <Text style={stepStyles.num}>{number}</Text>
      </View>
      <View style={stepStyles.text}>
        <Text style={stepStyles.title}>{title}</Text>
        <Text style={stepStyles.desc}>{description}</Text>
      </View>
    </View>
  );
}

const stepStyles = StyleSheet.create({
  row: {flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16},
  circle: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#EFF6FF', borderWidth: 1.5, borderColor: '#BFDBFE',
    alignItems: 'center', justifyContent: 'center', marginRight: 12, marginTop: 2,
  },
  num: {fontSize: 14, fontWeight: '700', color: ACCENT},
  text: {flex: 1},
  title: {fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 2},
  desc: {fontSize: 13, color: '#6B7280', lineHeight: 18},
});

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: '#F3F4F6'},
  scroll: {paddingBottom: 32},
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: ACCENT, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 28,
  },
  greeting: {fontSize: 15, color: '#BFDBFE'},
  userName: {fontSize: 22, fontWeight: '700', color: '#FFFFFF', maxWidth: 240},
  avatarCircle: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center',
  },
  avatarText: {color: '#FFFFFF', fontSize: 18, fontWeight: '700'},
  card: {
    backgroundColor: '#FFFFFF', marginHorizontal: 16, marginTop: -12,
    borderRadius: 16, padding: 20,
    shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  cardRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  cardTextArea: {flex: 1, marginRight: 16},
  cardTitle: {fontSize: 17, fontWeight: '700', color: '#111827', marginBottom: 6},
  cardDesc: {fontSize: 13, color: '#6B7280', lineHeight: 18},
  addBtn: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: ACCENT,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: ACCENT, shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.3, shadowRadius: 6, elevation: 4,
  },
  addBtnText: {color: '#FFFFFF', fontSize: 28, fontWeight: '300', lineHeight: 30, marginTop: -2},
  sectionTitle: {fontSize: 17, fontWeight: '700', color: '#111827', marginTop: 24, marginBottom: 12, paddingHorizontal: 20},
  stepsCard: {
    backgroundColor: '#FFFFFF', marginHorizontal: 16, borderRadius: 16, padding: 20,
    shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF', marginHorizontal: 16, borderRadius: 16,
    paddingVertical: 40, paddingHorizontal: 24, alignItems: 'center',
    shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  emptyIcon: {fontSize: 40, marginBottom: 12},
  emptyTitle: {fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 6},
  emptySubtitle: {fontSize: 13, color: '#9CA3AF', textAlign: 'center', lineHeight: 18},
  recentCard: {
    backgroundColor: '#FFFFFF', marginHorizontal: 16, marginBottom: 10, borderRadius: 14, padding: 14,
    shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  recentTop: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4},
  recentStatus: {fontSize: 12, fontWeight: '700'},
  recentBids: {fontSize: 12, color: '#9CA3AF'},
  recentTitle: {fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 2},
  recentCategory: {fontSize: 12, color: '#6B7280'},
});
