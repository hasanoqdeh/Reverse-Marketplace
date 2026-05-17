import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
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
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../../types/navigation';
import {RequestCategory} from '../../../types/api';
import {getCategories, publishRequest} from '../../../api/requests';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const ACCENT = '#2563EB';
const TOTAL_STEPS = 3;

function StepIndicator({current}: {current: number}) {
  return (
    <View style={ind.row}>
      {Array.from({length: TOTAL_STEPS}).map((_, i) => (
        <React.Fragment key={i}>
          <View style={[ind.dot, i < current && ind.dotDone, i === current - 1 && ind.dotActive]}>
            {i < current - 1 ? (
              <Text style={ind.check}>✓</Text>
            ) : (
              <Text style={[ind.num, i === current - 1 && ind.numActive]}>{i + 1}</Text>
            )}
          </View>
          {i < TOTAL_STEPS - 1 && (
            <View style={[ind.line, i < current - 1 && ind.lineDone]} />
          )}
        </React.Fragment>
      ))}
    </View>
  );
}

const STEP_LABELS = ['Category', 'Details', 'Budget'];

export default function CreateRequestScreen() {
  const navigation = useNavigation<Nav>();

  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState<RequestCategory[]>([]);
  const [catLoading, setCatLoading] = useState(true);

  const [categoryId, setCategoryId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => {})
      .finally(() => setCatLoading(false));
  }, []);

  const selectedCategory = categories.find(c => c.id === categoryId);

  const handleNext = useCallback(() => {
    if (step === 1 && !categoryId) {
      Alert.alert('Select a category', 'Please choose a category to continue.');
      return;
    }
    if (step === 2) {
      if (!title.trim()) {
        Alert.alert('Title required', 'Please enter a title for your request.');
        return;
      }
      if (!description.trim()) {
        Alert.alert('Description required', 'Please describe what you need.');
        return;
      }
    }
    setStep(s => Math.min(s + 1, TOTAL_STEPS) as 1 | 2 | 3);
  }, [step, categoryId, title, description]);

  const handleBack = useCallback(() => {
    if (step === 1) {
      navigation.goBack();
    } else {
      setStep(s => (s - 1) as 1 | 2 | 3);
    }
  }, [step, navigation]);

  const handlePublish = useCallback(async () => {
    if (submitting) return;
    const minVal = budgetMin ? parseFloat(budgetMin) : undefined;
    const maxVal = budgetMax ? parseFloat(budgetMax) : undefined;
    if (minVal && maxVal && minVal > maxVal) {
      Alert.alert('Invalid budget', 'Minimum budget cannot exceed maximum.');
      return;
    }
    setSubmitting(true);
    try {
      await publishRequest({
        title: title.trim(),
        description: description.trim(),
        categoryId,
        budgetMin: minVal,
        budgetMax: maxVal,
        expiresInDays: 3,
      });
      Alert.alert('Request Published!', 'Your request is now live. Merchants will start bidding.', [
        {text: 'OK', onPress: () => navigation.goBack()},
      ]);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Failed to publish. Please try again.';
      Alert.alert('Error', msg);
    } finally {
      setSubmitting(false);
    }
  }, [submitting, budgetMin, budgetMax, title, description, categoryId, navigation]);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}>
          <Text style={styles.backBtn}>{step === 1 ? '✕' : '←'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post a Request</Text>
        <View style={{width: 28}} />
      </View>

      {/* Step indicator */}
      <View style={styles.stepArea}>
        <StepIndicator current={step} />
        <Text style={styles.stepLabel}>{STEP_LABELS[step - 1]}</Text>
      </View>

      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {step === 1 && (
          <Step1
            categories={categories}
            loading={catLoading}
            selected={categoryId}
            onSelect={setCategoryId}
          />
        )}
        {step === 2 && (
          <Step2
            title={title}
            description={description}
            onTitle={setTitle}
            onDescription={setDescription}
          />
        )}
        {step === 3 && (
          <Step3
            categoryName={selectedCategory?.name ?? ''}
            title={title}
            description={description}
            budgetMin={budgetMin}
            budgetMax={budgetMax}
            onBudgetMin={setBudgetMin}
            onBudgetMax={setBudgetMax}
          />
        )}
      </KeyboardAvoidingView>

      {/* Bottom action */}
      <View style={styles.footer}>
        {step < TOTAL_STEPS ? (
          <TouchableOpacity style={styles.primaryBtn} onPress={handleNext} activeOpacity={0.85}>
            <Text style={styles.primaryBtnText}>Continue</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.primaryBtn, submitting && styles.primaryBtnDisabled]}
            onPress={handlePublish}
            activeOpacity={0.85}
            disabled={submitting}>
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryBtnText}>Publish Request</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

function Step1({
  categories,
  loading,
  selected,
  onSelect,
}: {
  categories: RequestCategory[];
  loading: boolean;
  selected: string;
  onSelect: (id: string) => void;
}) {
  if (loading) {
    return (
      <View style={s1.center}>
        <ActivityIndicator size="large" color={ACCENT} />
      </View>
    );
  }
  if (categories.length === 0) {
    return (
      <View style={s1.center}>
        <Text style={s1.empty}>No categories available.</Text>
      </View>
    );
  }
  return (
    <FlatList
      data={categories}
      keyExtractor={item => item.id}
      numColumns={2}
      contentContainerStyle={s1.list}
      columnWrapperStyle={{gap: 12}}
      renderItem={({item}) => {
        const active = selected === item.id;
        return (
          <TouchableOpacity
            style={[s1.card, active && s1.cardActive]}
            onPress={() => onSelect(item.id)}
            activeOpacity={0.7}>
            <Text style={[s1.name, active && s1.nameActive]}>{item.name}</Text>
            {item.description ? (
              <Text style={[s1.desc, active && s1.descActive]} numberOfLines={2}>
                {item.description}
              </Text>
            ) : null}
            {active && <Text style={s1.tick}>✓</Text>}
          </TouchableOpacity>
        );
      }}
    />
  );
}

function Step2({
  title,
  description,
  onTitle,
  onDescription,
}: {
  title: string;
  description: string;
  onTitle: (v: string) => void;
  onDescription: (v: string) => void;
}) {
  return (
    <ScrollView contentContainerStyle={s2.container} keyboardShouldPersistTaps="handled">
      <Text style={s2.label}>Title *</Text>
      <TextInput
        style={s2.input}
        placeholder="e.g. Looking for a Samsung 65″ TV"
        placeholderTextColor="#9CA3AF"
        value={title}
        onChangeText={onTitle}
        maxLength={255}
        returnKeyType="next"
      />
      <Text style={s2.hint}>{title.length}/255</Text>

      <Text style={s2.label}>Description *</Text>
      <TextInput
        style={[s2.input, s2.textarea]}
        placeholder="Describe exactly what you need, preferred brands, conditions, delivery preferences…"
        placeholderTextColor="#9CA3AF"
        value={description}
        onChangeText={onDescription}
        multiline
        numberOfLines={6}
        textAlignVertical="top"
      />
    </ScrollView>
  );
}

function Step3({
  categoryName,
  title,
  description,
  budgetMin,
  budgetMax,
  onBudgetMin,
  onBudgetMax,
}: {
  categoryName: string;
  title: string;
  description: string;
  budgetMin: string;
  budgetMax: string;
  onBudgetMin: (v: string) => void;
  onBudgetMax: (v: string) => void;
}) {
  return (
    <ScrollView contentContainerStyle={s3.container} keyboardShouldPersistTaps="handled">
      {/* Summary */}
      <View style={s3.summary}>
        <Text style={s3.summaryLabel}>Review</Text>
        <Text style={s3.summaryCategory}>{categoryName}</Text>
        <Text style={s3.summaryTitle}>{title}</Text>
        <Text style={s3.summaryDesc} numberOfLines={3}>{description}</Text>
      </View>

      {/* Budget */}
      <Text style={s3.label}>Budget Range (optional)</Text>
      <Text style={s3.hint}>Leave blank if you want to see all offers.</Text>
      <View style={s3.row}>
        <View style={s3.inputWrap}>
          <Text style={s3.currency}>$</Text>
          <TextInput
            style={s3.input}
            placeholder="Min"
            placeholderTextColor="#9CA3AF"
            value={budgetMin}
            onChangeText={onBudgetMin}
            keyboardType="decimal-pad"
          />
        </View>
        <Text style={s3.dash}>–</Text>
        <View style={s3.inputWrap}>
          <Text style={s3.currency}>$</Text>
          <TextInput
            style={s3.input}
            placeholder="Max"
            placeholderTextColor="#9CA3AF"
            value={budgetMax}
            onChangeText={onBudgetMax}
            keyboardType="decimal-pad"
          />
        </View>
      </View>

      <View style={s3.infoBox}>
        <Text style={s3.infoText}>
          Your request will be active for 3 days. Merchants in your area will be notified and can bid on it.
        </Text>
      </View>
    </ScrollView>
  );
}

// ─── Indicator styles ─────────────────────────────────────────────────────────
const ind = StyleSheet.create({
  row: {flexDirection: 'row', alignItems: 'center'},
  dot: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#F3F4F6', borderWidth: 1.5, borderColor: '#D1D5DB',
    alignItems: 'center', justifyContent: 'center',
  },
  dotActive: {backgroundColor: ACCENT, borderColor: ACCENT},
  dotDone: {backgroundColor: '#DBEAFE', borderColor: ACCENT},
  num: {fontSize: 14, fontWeight: '600', color: '#9CA3AF'},
  numActive: {color: '#FFFFFF'},
  check: {fontSize: 14, fontWeight: '700', color: ACCENT},
  line: {flex: 1, height: 2, backgroundColor: '#E5E7EB', marginHorizontal: 4},
  lineDone: {backgroundColor: ACCENT},
});

// ─── Step 1 styles ─────────────────────────────────────────────────────────────
const s1 = StyleSheet.create({
  center: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  empty: {color: '#6B7280', fontSize: 14},
  list: {padding: 16, gap: 12},
  card: {
    flex: 1, backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16,
    borderWidth: 1.5, borderColor: '#E5E7EB',
    shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  cardActive: {borderColor: ACCENT, backgroundColor: '#EFF6FF'},
  name: {fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 4},
  nameActive: {color: ACCENT},
  desc: {fontSize: 12, color: '#6B7280', lineHeight: 16},
  descActive: {color: '#3B82F6'},
  tick: {fontSize: 18, color: ACCENT, position: 'absolute', top: 12, right: 12},
});

// ─── Step 2 styles ─────────────────────────────────────────────────────────────
const s2 = StyleSheet.create({
  container: {padding: 20},
  label: {fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 8, marginTop: 16},
  hint: {fontSize: 12, color: '#9CA3AF', marginBottom: 4, textAlign: 'right'},
  input: {
    backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#D1D5DB',
    paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, color: '#111827',
  },
  textarea: {minHeight: 140, paddingTop: 12},
});

// ─── Step 3 styles ─────────────────────────────────────────────────────────────
const s3 = StyleSheet.create({
  container: {padding: 20},
  summary: {
    backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, marginBottom: 20,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  summaryLabel: {fontSize: 11, fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4},
  summaryCategory: {fontSize: 13, color: ACCENT, fontWeight: '600', marginBottom: 4},
  summaryTitle: {fontSize: 17, fontWeight: '700', color: '#111827', marginBottom: 6},
  summaryDesc: {fontSize: 13, color: '#6B7280', lineHeight: 19},
  label: {fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 4},
  hint: {fontSize: 12, color: '#9CA3AF', marginBottom: 12},
  row: {flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20},
  inputWrap: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#D1D5DB',
    paddingHorizontal: 12,
  },
  currency: {fontSize: 15, color: '#6B7280', marginRight: 4},
  input: {flex: 1, fontSize: 15, color: '#111827', paddingVertical: 12},
  dash: {fontSize: 18, color: '#9CA3AF'},
  infoBox: {backgroundColor: '#F0FDF4', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#BBF7D0'},
  infoText: {fontSize: 13, color: '#166534', lineHeight: 20},
});

// ─── Screen styles ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: '#F9FAFB'},
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
  },
  backBtn: {fontSize: 20, color: '#374151', fontWeight: '600'},
  headerTitle: {fontSize: 17, fontWeight: '700', color: '#111827'},
  stepArea: {
    backgroundColor: '#FFFFFF', paddingHorizontal: 24, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6', alignItems: 'center', gap: 8,
  },
  stepLabel: {fontSize: 13, fontWeight: '600', color: '#6B7280'},
  footer: {
    backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingVertical: 16,
    borderTopWidth: 1, borderTopColor: '#E5E7EB',
  },
  primaryBtn: {
    backgroundColor: ACCENT, borderRadius: 14, paddingVertical: 16,
    alignItems: 'center',
    shadowColor: ACCENT, shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.25, shadowRadius: 8, elevation: 4,
  },
  primaryBtnDisabled: {opacity: 0.6},
  primaryBtnText: {fontSize: 16, fontWeight: '700', color: '#FFFFFF'},
});
