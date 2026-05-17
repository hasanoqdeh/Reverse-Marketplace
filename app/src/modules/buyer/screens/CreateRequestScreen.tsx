'use strict';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {launchImageLibrary} from 'react-native-image-picker';
import {useAuth} from '../../../context/AuthContext';
import {RootStackParamList} from '../../../types/navigation';
import {RequestCategory} from '../../../types/api';
import {getCategories, publishRequest, uploadRequestImage} from '../../../api/requests';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const ACCENT = '#2563EB';

const CATEGORY_EMOJI: Record<string, string> = {
  'Electronics':      '📱',
  'Home Services':    '🏠',
  'Food & Beverages': '🍔',
  'Transportation':   '🚗',
  'Education':        '📚',
  'Repairs & Fix':    '🔧',
};

type PickedImage = {uri: string; type: string; name: string};

export default function CreateRequestScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const {user} = useAuth();
  const titleRef = useRef<TextInput>(null);

  const [categories, setCategories] = useState<RequestCategory[]>([]);
  const [categoryId, setCategoryId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [images, setImages] = useState<PickedImage[]>([]);
  const [showCatSheet, setShowCatSheet] = useState(false);
  const [showBudget, setShowBudget] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const initial = (user?.profile?.firstName?.[0] || user?.phone?.[0] || 'U').toUpperCase();
  const selectedCat = categories.find(c => c.id === categoryId);
  const canPost = title.trim().length > 0 && description.trim().length > 0;

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
    setTimeout(() => titleRef.current?.focus(), 300);
  }, []);

  const pickImage = useCallback(async () => {
    launchImageLibrary({mediaType: 'photo', quality: 0.8, selectionLimit: 4 - images.length}, res => {
      if (res.didCancel || res.errorCode) return;
      const picked: PickedImage[] = (res.assets ?? []).map(a => ({
        uri:  a.uri!,
        type: a.type ?? 'image/jpeg',
        name: a.fileName ?? 'photo.jpg',
      }));
      setImages(prev => [...prev, ...picked].slice(0, 4));
    });
  }, [images.length]);

  const removeImage = useCallback((idx: number) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
  }, []);

  const handlePost = useCallback(async () => {
    if (!canPost || submitting) return;
    const minVal = budgetMin ? parseFloat(budgetMin) : undefined;
    const maxVal = budgetMax ? parseFloat(budgetMax) : undefined;
    if (minVal && maxVal && minVal > maxVal) {
      Alert.alert('Invalid budget', 'Min cannot exceed max.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await publishRequest({
        title: title.trim(),
        description: description.trim(),
        categoryId: categoryId || undefined,
        budgetMin: minVal,
        budgetMax: maxVal,
      });
      if (images.length > 0) {
        await Promise.allSettled(
          images.map(img => uploadRequestImage(res.requestId, img.uri, img.type, img.name)),
        );
      }
      navigation.goBack();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Failed to publish. Please try again.';
      Alert.alert('Error', msg);
    } finally {
      setSubmitting(false);
    }
  }, [canPost, submitting, title, description, categoryId, budgetMin, budgetMax, images, navigation]);

  return (
    <View style={[styles.root, {paddingTop: insets.top}]}>
      {/* ── Header ─────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <Text style={styles.closeBtn}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Request</Text>
        <TouchableOpacity
          style={[styles.postBtn, canPost && !submitting && styles.postBtnActive]}
          onPress={handlePost}
          disabled={!canPost || submitting}
          activeOpacity={0.8}>
          {submitting
            ? <ActivityIndicator color="#fff" size="small" />
            : <Text style={[styles.postBtnText, canPost && styles.postBtnTextActive]}>Post</Text>}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          {/* ── Composer row ───────────────────────────────────── */}
          <View style={styles.composerRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>
            <View style={styles.composerFields}>
              <TextInput
                ref={titleRef}
                style={styles.titleInput}
                placeholder="What do you need?"
                placeholderTextColor="#9CA3AF"
                value={title}
                onChangeText={setTitle}
                maxLength={255}
                returnKeyType="next"
                multiline
              />
              <TextInput
                style={styles.descInput}
                placeholder="Add more details — brand, size, condition, delivery preferences…"
                placeholderTextColor="#C4C9D4"
                value={description}
                onChangeText={setDescription}
                multiline
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* ── Category chip (if selected) ─────────────────────── */}
          {selectedCat && (
            <TouchableOpacity style={styles.selectedChip} onPress={() => setShowCatSheet(true)} activeOpacity={0.7}>
              <Text style={styles.selectedChipEmoji}>
                {CATEGORY_EMOJI[selectedCat.name] ?? '🏷️'}
              </Text>
              <Text style={styles.selectedChipText}>{selectedCat.name}</Text>
              <TouchableOpacity onPress={() => setCategoryId('')} hitSlop={{top: 6, bottom: 6, left: 6, right: 6}}>
                <Text style={styles.selectedChipClose}>✕</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          )}

          {/* ── Budget row (if shown) ───────────────────────────── */}
          {showBudget && (
            <View style={styles.budgetRow}>
              <Text style={styles.budgetLabel}>💰</Text>
              <View style={styles.budgetInput}>
                <Text style={styles.budgetCurrency}>$</Text>
                <TextInput
                  style={styles.budgetField}
                  placeholder="Min"
                  placeholderTextColor="#9CA3AF"
                  value={budgetMin}
                  onChangeText={setBudgetMin}
                  keyboardType="decimal-pad"
                />
              </View>
              <Text style={styles.budgetDash}>–</Text>
              <View style={styles.budgetInput}>
                <Text style={styles.budgetCurrency}>$</Text>
                <TextInput
                  style={styles.budgetField}
                  placeholder="Max"
                  placeholderTextColor="#9CA3AF"
                  value={budgetMax}
                  onChangeText={setBudgetMax}
                  keyboardType="decimal-pad"
                />
              </View>
              <TouchableOpacity onPress={() => { setShowBudget(false); setBudgetMin(''); setBudgetMax(''); }}>
                <Text style={styles.budgetRemove}>✕</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ── Image thumbnails ───────────────────────────────── */}
          {images.length > 0 && (
            <View style={styles.imageRow}>
              {images.map((img, i) => (
                <View key={i} style={styles.thumbWrap}>
                  <Image source={{uri: img.uri}} style={styles.thumb} />
                  <TouchableOpacity style={styles.thumbRemove} onPress={() => removeImage(i)}>
                    <Text style={styles.thumbRemoveText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
              {images.length < 4 && (
                <TouchableOpacity style={styles.thumbAdd} onPress={pickImage} activeOpacity={0.7}>
                  <Text style={styles.thumbAddText}>+</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </ScrollView>

        {/* ── Bottom toolbar ──────────────────────────────────── */}
        <View style={[styles.toolbar, {paddingBottom: insets.bottom + 8}]}>
          <View style={styles.toolbarDivider} />
          <View style={styles.toolbarRow}>
            <TouchableOpacity
              style={styles.toolBtn}
              onPress={pickImage}
              disabled={images.length >= 4}
              activeOpacity={0.7}>
              <Text style={[styles.toolBtnIcon, images.length >= 4 && styles.toolBtnDisabled]}>📷</Text>
              <Text style={[styles.toolBtnLabel, images.length >= 4 && styles.toolBtnDisabled]}>Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.toolBtn} onPress={() => setShowCatSheet(true)} activeOpacity={0.7}>
              <Text style={[styles.toolBtnIcon, !!categoryId && styles.toolBtnActive]}>🏷️</Text>
              <Text style={[styles.toolBtnLabel, !!categoryId && styles.toolBtnActiveLabel]}>
                {selectedCat ? selectedCat.name.split(' ')[0] : 'Category'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toolBtn}
              onPress={() => setShowBudget(b => !b)}
              activeOpacity={0.7}>
              <Text style={[styles.toolBtnIcon, showBudget && styles.toolBtnActive]}>💰</Text>
              <Text style={[styles.toolBtnLabel, showBudget && styles.toolBtnActiveLabel]}>Budget</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* ── Category bottom sheet ───────────────────────────── */}
      <Modal visible={showCatSheet} transparent animationType="slide" onRequestClose={() => setShowCatSheet(false)}>
        <TouchableOpacity style={styles.sheetOverlay} activeOpacity={1} onPress={() => setShowCatSheet(false)} />
        <View style={[styles.sheet, {paddingBottom: insets.bottom + 16}]}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>Pick a category</Text>
          <Text style={styles.sheetSub}>Optional — helps merchants find your request</Text>

          <FlatList
            data={categories}
            keyExtractor={c => c.id}
            numColumns={3}
            columnWrapperStyle={styles.catGrid}
            contentContainerStyle={{paddingBottom: 8}}
            renderItem={({item}) => {
              const active = item.id === categoryId;
              return (
                <TouchableOpacity
                  style={[styles.catCard, active && styles.catCardActive]}
                  onPress={() => { setCategoryId(active ? '' : item.id); setShowCatSheet(false); }}
                  activeOpacity={0.7}>
                  <Text style={styles.catEmoji}>{CATEGORY_EMOJI[item.name] ?? '🏷️'}</Text>
                  <Text style={[styles.catName, active && styles.catNameActive]} numberOfLines={2}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />

          <TouchableOpacity style={styles.skipBtn} onPress={() => { setCategoryId(''); setShowCatSheet(false); }}>
            <Text style={styles.skipBtnText}>No category</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: '#FFFFFF'},

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  closeBtn: {fontSize: 18, color: '#374151', fontWeight: '600', paddingHorizontal: 4},
  headerTitle: {fontSize: 16, fontWeight: '700', color: '#111827'},
  postBtn: {
    paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#E5E7EB',
  },
  postBtnActive: {backgroundColor: ACCENT},
  postBtnText: {fontSize: 14, fontWeight: '700', color: '#9CA3AF'},
  postBtnTextActive: {color: '#FFFFFF'},

  // Scroll
  scroll: {flex: 1},
  scrollContent: {paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8},

  // Composer
  composerRow: {flexDirection: 'row', gap: 12},
  avatar: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: ACCENT, alignItems: 'center', justifyContent: 'center', marginTop: 2,
  },
  avatarText: {fontSize: 18, fontWeight: '700', color: '#FFFFFF'},
  composerFields: {flex: 1},
  titleInput: {
    fontSize: 18, fontWeight: '600', color: '#111827',
    lineHeight: 26, minHeight: 36, marginBottom: 8,
    padding: 0,
  },
  descInput: {
    fontSize: 15, color: '#374151', lineHeight: 22, minHeight: 80,
    padding: 0,
  },

  // Selected category chip
  selectedChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    alignSelf: 'flex-start', marginTop: 12,
    backgroundColor: '#EFF6FF', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: '#BFDBFE',
  },
  selectedChipEmoji: {fontSize: 16},
  selectedChipText: {fontSize: 13, fontWeight: '600', color: ACCENT},
  selectedChipClose: {fontSize: 11, color: '#93C5FD', fontWeight: '700'},

  // Budget row
  budgetRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginTop: 14, backgroundColor: '#F9FAFB',
    borderRadius: 12, padding: 10, borderWidth: 1, borderColor: '#E5E7EB',
  },
  budgetLabel: {fontSize: 18},
  budgetInput: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFFFFF', borderRadius: 8, borderWidth: 1, borderColor: '#D1D5DB',
    paddingHorizontal: 8, height: 38,
  },
  budgetCurrency: {fontSize: 14, color: '#6B7280', marginRight: 2},
  budgetField: {flex: 1, fontSize: 14, color: '#111827', padding: 0},
  budgetDash: {fontSize: 16, color: '#9CA3AF'},
  budgetRemove: {fontSize: 14, color: '#9CA3AF', paddingHorizontal: 4},

  // Images
  imageRow: {flexDirection: 'row', gap: 8, marginTop: 14, flexWrap: 'wrap'},
  thumbWrap: {position: 'relative'},
  thumb: {width: 80, height: 80, borderRadius: 10},
  thumbRemove: {
    position: 'absolute', top: -6, right: -6,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: '#374151', alignItems: 'center', justifyContent: 'center',
  },
  thumbRemoveText: {color: '#FFFFFF', fontSize: 10, fontWeight: '700'},
  thumbAdd: {
    width: 80, height: 80, borderRadius: 10,
    backgroundColor: '#F3F4F6', borderWidth: 1.5, borderColor: '#D1D5DB',
    alignItems: 'center', justifyContent: 'center',
  },
  thumbAddText: {fontSize: 28, color: '#9CA3AF', fontWeight: '300'},

  // Toolbar
  toolbar: {backgroundColor: '#FFFFFF'},
  toolbarDivider: {height: 1, backgroundColor: '#F3F4F6'},
  toolbarRow: {flexDirection: 'row', paddingHorizontal: 8, paddingTop: 8},
  toolBtn: {flex: 1, alignItems: 'center', paddingVertical: 8, gap: 3},
  toolBtnIcon: {fontSize: 22},
  toolBtnLabel: {fontSize: 11, color: '#6B7280', fontWeight: '500'},
  toolBtnActive: {},
  toolBtnActiveLabel: {color: ACCENT, fontWeight: '700'},
  toolBtnDisabled: {opacity: 0.35},

  // Category sheet
  sheetOverlay: {flex: 1, backgroundColor: 'rgba(0,0,0,0.35)'},
  sheet: {
    backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 16, paddingTop: 12,
    shadowColor: '#000', shadowOffset: {width: 0, height: -4}, shadowOpacity: 0.1, shadowRadius: 16, elevation: 20,
  },
  sheetHandle: {width: 36, height: 4, borderRadius: 2, backgroundColor: '#D1D5DB', alignSelf: 'center', marginBottom: 16},
  sheetTitle: {fontSize: 17, fontWeight: '700', color: '#111827', marginBottom: 2},
  sheetSub: {fontSize: 13, color: '#9CA3AF', marginBottom: 16},
  catGrid: {gap: 10, marginBottom: 10},
  catCard: {
    flex: 1, alignItems: 'center', paddingVertical: 16, borderRadius: 14,
    backgroundColor: '#F9FAFB', borderWidth: 1.5, borderColor: '#E5E7EB',
  },
  catCardActive: {backgroundColor: '#EFF6FF', borderColor: ACCENT},
  catEmoji: {fontSize: 28, marginBottom: 6},
  catName: {fontSize: 12, fontWeight: '600', color: '#374151', textAlign: 'center'},
  catNameActive: {color: ACCENT},
  skipBtn: {alignItems: 'center', paddingVertical: 14, marginTop: 4},
  skipBtnText: {fontSize: 14, color: '#9CA3AF', fontWeight: '500'},
});
