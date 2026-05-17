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
import {updateProfile as apiUpdateProfile} from '../../api/auth';

type Props = NativeStackScreenProps<RootStackParamList, 'MerchantSetup'>;

const ACCENT = '#16A34A';

export default function MerchantSetupScreen({navigation}: Props) {

  const [businessName, setBusinessName] = useState('');
  const [bio, setBio] = useState('');
  const [serviceArea, setServiceArea] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);
    try {
      await apiUpdateProfile({
        preferences: {
          merchantProfile: {
            businessName: businessName.trim() || null,
            bio: bio.trim() || null,
            serviceArea: serviceArea.trim() || null,
          },
        },
      } as any);
      navigation.navigate('App');
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message ?? 'Failed to save profile.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View style={{width: 28}} />
        <Text style={styles.headerTitle}>Store Setup</Text>
        <TouchableOpacity onPress={() => navigation.navigate('App')}>
          <Text style={styles.skipBtn}>Skip</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.headline}>Set up your merchant store</Text>
        <Text style={styles.subhead}>Help buyers know who they're working with. You can update this later.</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Business Name</Text>
          <TextInput
            style={styles.input}
            value={businessName}
            onChangeText={setBusinessName}
            placeholder="e.g. Ahmed's Electronics"
            placeholderTextColor="#9CA3AF"
            maxLength={100}
          />
          <Text style={styles.hint}>Displayed instead of your personal name (optional)</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>About You / Bio</Text>
          <TextInput
            style={[styles.input, styles.multiline]}
            value={bio}
            onChangeText={setBio}
            placeholder="Briefly describe your services, experience, or specialty…"
            placeholderTextColor="#9CA3AF"
            multiline
            maxLength={255}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{bio.length}/255</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Service Area</Text>
          <TextInput
            style={styles.input}
            value={serviceArea}
            onChangeText={setServiceArea}
            placeholder="e.g. Amman, Zarqa"
            placeholderTextColor="#9CA3AF"
            maxLength={100}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveBtn, loading && styles.disabled]}
          onPress={handleSave}
          disabled={loading}
          activeOpacity={0.8}>
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveBtnText}>Save & Continue</Text>
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
  headerTitle: {fontSize: 17, fontWeight: '700', color: '#111827'},
  skipBtn: {fontSize: 15, color: '#9CA3AF', fontWeight: '500'},
  content: {padding: 20, paddingBottom: 40},
  headline: {fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 8},
  subhead: {fontSize: 14, color: '#6B7280', lineHeight: 20, marginBottom: 24},
  field: {marginBottom: 20},
  label: {fontSize: 14, fontWeight: '700', color: '#374151', marginBottom: 8},
  input: {
    backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1.5, borderColor: '#E5E7EB',
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#111827',
  },
  multiline: {minHeight: 100},
  hint: {fontSize: 12, color: '#9CA3AF', marginTop: 4},
  charCount: {fontSize: 11, color: '#9CA3AF', textAlign: 'right', marginTop: 4},
  footer: {
    backgroundColor: '#FFFFFF', padding: 16, paddingBottom: 24,
    borderTopWidth: 1, borderTopColor: '#E5E7EB',
  },
  saveBtn: {backgroundColor: ACCENT, borderRadius: 14, paddingVertical: 16, alignItems: 'center'},
  saveBtnText: {fontSize: 16, fontWeight: '700', color: '#FFFFFF'},
  disabled: {opacity: 0.6},
});
