import React, {useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../types/navigation';
import {submitReview} from '../../api/reviews';

type Props = NativeStackScreenProps<RootStackParamList, 'RateTransaction'>;

export default function RateTransactionScreen({route, navigation}: Props) {
  const {bidId, revieweeId, revieweeType, revieweeName} = route.params;

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a star rating before submitting.');
      return;
    }
    setLoading(true);
    try {
      await submitReview({bidId, revieweeId, rating, comment: comment.trim() || undefined});
      Alert.alert('Review Submitted', 'Thank you for your feedback!', [
        {text: 'OK', onPress: () => navigation.goBack()},
      ]);
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message ?? 'Failed to submit review.');
    } finally {
      setLoading(false);
    }
  }

  const isMerchant = revieweeType === 'MERCHANT';
  const ACCENT = isMerchant ? '#2563EB' : '#16A34A';

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Leave a Review</Text>
        <View style={{width: 28}} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.revieweeCard}>
          <View style={[styles.avatar, {backgroundColor: isMerchant ? '#DBEAFE' : '#DCFCE7'}]}>
            <Text style={[styles.avatarText, {color: ACCENT}]}>
              {revieweeName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.revieweeName}>{revieweeName}</Text>
          <Text style={styles.revieweeType}>{isMerchant ? 'Merchant' : 'Buyer'}</Text>
        </View>

        {/* Star rating */}
        <View style={styles.starsCard}>
          <Text style={styles.starsLabel}>How was your experience?</Text>
          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map(star => (
              <TouchableOpacity key={star} onPress={() => setRating(star)} activeOpacity={0.7} style={styles.starBtn}>
                <Text style={[styles.star, star <= rating && styles.starFilled]}>★</Text>
              </TouchableOpacity>
            ))}
          </View>
          {rating > 0 && (
            <Text style={styles.ratingLabel}>
              {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
            </Text>
          )}
        </View>

        {/* Comment */}
        <View style={styles.commentCard}>
          <Text style={styles.commentLabel}>Comment (optional)</Text>
          <TextInput
            style={styles.commentInput}
            value={comment}
            onChangeText={setComment}
            placeholder="Share more about your experience…"
            placeholderTextColor="#9CA3AF"
            multiline
            maxLength={500}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{comment.length}/500</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.skipBtn]}
          onPress={() => navigation.goBack()}
          disabled={loading}
          activeOpacity={0.8}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.submitBtn, {backgroundColor: ACCENT}, (!rating || loading) && styles.disabled]}
          onPress={handleSubmit}
          disabled={!rating || loading}
          activeOpacity={0.8}>
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitText}>Submit Review</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: '#F9FAFB'},
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
  },
  back: {fontSize: 20, color: '#374151', fontWeight: '600'},
  headerTitle: {fontSize: 17, fontWeight: '700', color: '#111827', flex: 1, textAlign: 'center'},
  content: {padding: 16, paddingBottom: 32},
  revieweeCard: {alignItems: 'center', paddingVertical: 24},
  avatar: {width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 12},
  avatarText: {fontSize: 28, fontWeight: '800'},
  revieweeName: {fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 4},
  revieweeType: {fontSize: 13, color: '#6B7280'},
  starsCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 12,
    shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  starsLabel: {fontSize: 15, fontWeight: '600', color: '#374151', marginBottom: 16},
  stars: {flexDirection: 'row', gap: 8, marginBottom: 8},
  starBtn: {padding: 4},
  star: {fontSize: 40, color: '#D1D5DB'},
  starFilled: {color: '#F59E0B'},
  ratingLabel: {fontSize: 14, fontWeight: '600', color: '#F59E0B', marginTop: 4},
  commentCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  commentLabel: {fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 10},
  commentInput: {
    backgroundColor: '#F9FAFB', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB',
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#111827',
    minHeight: 100,
  },
  charCount: {fontSize: 11, color: '#9CA3AF', textAlign: 'right', marginTop: 4},
  footer: {
    flexDirection: 'row', gap: 12,
    backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingVertical: 14,
    borderTopWidth: 1, borderTopColor: '#E5E7EB',
  },
  skipBtn: {
    flex: 1, borderRadius: 12, borderWidth: 1.5, borderColor: '#E5E7EB',
    paddingVertical: 14, alignItems: 'center',
  },
  skipText: {fontSize: 15, fontWeight: '600', color: '#6B7280'},
  submitBtn: {flex: 2, borderRadius: 12, paddingVertical: 14, alignItems: 'center'},
  submitText: {fontSize: 15, fontWeight: '700', color: '#FFFFFF'},
  disabled: {opacity: 0.5},
});
