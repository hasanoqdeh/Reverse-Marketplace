import React, {useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../../types/navigation';
import {submitBid} from '../../../api/bids';

type Props = NativeStackScreenProps<RootStackParamList, 'SubmitBid'>;

const ACCENT = '#16A34A';

export default function SubmitBidScreen({route, navigation}: Props) {
  const {requestId, requestTitle} = route.params;

  const [amount, setAmount] = useState('');
  const [deliveryDays, setDeliveryDays] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [specialTerms, setSpecialTerms] = useState('');
  const [loading, setLoading] = useState(false);

  const amountNum = parseFloat(amount);
  const daysNum = parseInt(deliveryDays, 10);
  const isValid = amount.trim() !== '' && amountNum > 0 && deliveryDays.trim() !== '' && daysNum > 0;

  async function handleSubmit() {
    if (!isValid) return;
    setLoading(true);
    try {
      const result = await submitBid({
        requestId,
        amount: amountNum,
        deliveryDays: daysNum,
        deliveryNotes: deliveryNotes.trim() || undefined,
        specialTerms: specialTerms.trim() || undefined,
      });

      const {competition} = result;
      const posMsg =
        competition.totalBids > 1
          ? `You're #${competition.yourPosition} of ${competition.totalBids} bids.`
          : 'You are the first bidder!';

      Alert.alert('Bid Submitted!', posMsg, [
        {text: 'OK', onPress: () => navigation.goBack()},
      ]);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Failed to submit bid. Please try again.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}>
            <Text style={styles.back}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>Submit Bid</Text>
          <View style={{width: 28}} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Request title */}
          <View style={styles.requestBox}>
            <Text style={styles.requestLabel}>Request</Text>
            <Text style={styles.requestTitle} numberOfLines={2}>{requestTitle}</Text>
          </View>

          {/* Amount */}
          <View style={styles.field}>
            <Text style={styles.label}>Your Bid Amount <Text style={styles.required}>*</Text></Text>
            <View style={styles.amountWrap}>
              <Text style={styles.currency}>$</Text>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor="#9CA3AF"
                returnKeyType="next"
              />
            </View>
          </View>

          {/* Delivery days */}
          <View style={styles.field}>
            <Text style={styles.label}>Delivery Days <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              value={deliveryDays}
              onChangeText={setDeliveryDays}
              keyboardType="number-pad"
              placeholder="e.g. 7"
              placeholderTextColor="#9CA3AF"
              returnKeyType="next"
            />
            <Text style={styles.hint}>How many days until you can deliver?</Text>
          </View>

          {/* Delivery notes */}
          <View style={styles.field}>
            <Text style={styles.label}>Delivery Notes <Text style={styles.optional}>(optional)</Text></Text>
            <TextInput
              style={[styles.input, styles.multiline]}
              value={deliveryNotes}
              onChangeText={setDeliveryNotes}
              placeholder="Describe your delivery plan, timeline, or any special conditions…"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              returnKeyType="next"
            />
          </View>

          {/* Special terms */}
          <View style={styles.field}>
            <Text style={styles.label}>Special Terms <Text style={styles.optional}>(optional)</Text></Text>
            <TextInput
              style={[styles.input, styles.multiline]}
              value={specialTerms}
              onChangeText={setSpecialTerms}
              placeholder="Any additional terms, warranty, or conditions…"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Summary preview */}
          {isValid && (
            <View style={styles.preview}>
              <Text style={styles.previewTitle}>Bid Summary</Text>
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>Amount</Text>
                <Text style={styles.previewValue}>${amountNum.toFixed(2)}</Text>
              </View>
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>Delivery</Text>
                <Text style={styles.previewValue}>{daysNum} day{daysNum !== 1 ? 's' : ''}</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Submit button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.submitBtn, (!isValid || loading) && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={!isValid || loading}
            activeOpacity={0.8}>
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitBtnText}>Submit Bid</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  content: {padding: 20, paddingBottom: 32},
  requestBox: {
    backgroundColor: '#F0FDF4', borderRadius: 14, padding: 14, marginBottom: 24,
    borderWidth: 1, borderColor: '#BBF7D0',
  },
  requestLabel: {fontSize: 11, fontWeight: '700', color: '#166534', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4},
  requestTitle: {fontSize: 15, fontWeight: '600', color: '#14532D', lineHeight: 21},
  field: {marginBottom: 20},
  label: {fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8},
  required: {color: '#EF4444'},
  optional: {fontSize: 12, fontWeight: '400', color: '#9CA3AF'},
  amountWrap: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF',
    borderRadius: 12, borderWidth: 1.5, borderColor: '#D1FAE5', paddingHorizontal: 14,
  },
  currency: {fontSize: 22, fontWeight: '700', color: ACCENT, marginRight: 6},
  amountInput: {
    flex: 1, fontSize: 28, fontWeight: '700', color: '#111827',
    paddingVertical: 12,
  },
  input: {
    backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB',
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#111827',
  },
  multiline: {minHeight: 88, paddingTop: 12},
  hint: {fontSize: 12, color: '#9CA3AF', marginTop: 4},
  preview: {
    backgroundColor: '#ECFDF5', borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: '#A7F3D0', marginTop: 8,
  },
  previewTitle: {fontSize: 13, fontWeight: '700', color: '#065F46', marginBottom: 10},
  previewRow: {flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6},
  previewLabel: {fontSize: 14, color: '#047857'},
  previewValue: {fontSize: 14, fontWeight: '700', color: '#065F46'},
  footer: {
    backgroundColor: '#FFFFFF', padding: 16, paddingBottom: 24,
    borderTopWidth: 1, borderTopColor: '#E5E7EB',
  },
  submitBtn: {
    backgroundColor: ACCENT, borderRadius: 14, paddingVertical: 16,
    alignItems: 'center',
    shadowColor: ACCENT, shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  submitBtnDisabled: {backgroundColor: '#D1FAE5', shadowOpacity: 0},
  submitBtnText: {fontSize: 16, fontWeight: '700', color: '#FFFFFF'},
});
