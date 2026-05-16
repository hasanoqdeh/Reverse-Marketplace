import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useAuth} from '../../../context/AuthContext';

const ACCENT = '#2563EB';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) {return 'Good morning';}
  if (hour < 18) {return 'Good afternoon';}
  return 'Good evening';
}

export default function HomeScreen() {
  const {user} = useAuth();
  const displayName = user?.profile?.firstName ?? user?.phone ?? 'there';

  const handlePostRequest = () => {
    Alert.alert(
      'Post a Request',
      'This feature is coming soon! You will be able to post purchase requests for merchants to bid on.',
      [{text: 'OK'}],
    );
  };

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
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyTitle}>No recent activity</Text>
          <Text style={styles.emptySubtitle}>Post your first request to get started</Text>
        </View>
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
});
