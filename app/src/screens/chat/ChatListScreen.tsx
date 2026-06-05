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
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../types/navigation';
import {ChatRoom} from '../../types/api';
import {getMyRooms} from '../../api/chat';
import {useAuth} from '../../context/AuthContext';
import AppHeader from '../../components/AppHeader';
import {Colors} from '../../theme';

type RootNav = NativeStackNavigationProp<RootStackParamList>;

const ROOM_TYPE_COLORS: Record<string, {bg: string; text: string}> = {
  DIRECT:  {bg: Colors.primaryLight, text: Colors.primary},
  GROUP:   {bg: '#F3E8FF', text: '#7C3AED'},
  REQUEST: {bg: Colors.successLight, text: Colors.success},
  BID:     {bg: '#FEF9C3', text: '#854D0E'},
  SUPPORT: {bg: Colors.errorLight, text: Colors.error},
};

function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return d.toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'});
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return d.toLocaleDateString('en-US', {weekday: 'short'});
  return d.toLocaleDateString('en-US', {month: 'short', day: 'numeric'});
}

function RoomRow({room, onPress, userId}: {room: ChatRoom; onPress: () => void; userId: string}) {
  const tc = ROOM_TYPE_COLORS[room.type] ?? ROOM_TYPE_COLORS.DIRECT;
  const last = room.lastMessage;
  const unread = room.unreadCount ?? 0;

  return (
    <TouchableOpacity style={row.wrap} onPress={onPress} activeOpacity={0.75}>
      {/* Avatar */}
      <View style={[row.avatar, {backgroundColor: tc.bg}]}>
        <Text style={[row.avatarText, {color: tc.text}]}>{room.name[0].toUpperCase()}</Text>
      </View>
      <View style={row.body}>
        <View style={row.topLine}>
          <Text style={row.name} numberOfLines={1}>{room.name}</Text>
          {last && <Text style={row.time}>{formatTime(last.createdAt)}</Text>}
        </View>
        <View style={row.bottomLine}>
          <Text style={[row.preview, unread > 0 && row.previewBold]} numberOfLines={1}>
            {last
              ? (last.senderId === userId ? 'You: ' : '') + last.content
              : 'No messages yet'}
          </Text>
          {unread > 0 && (
            <View style={row.badge}>
              <Text style={row.badgeText}>{unread > 99 ? '99+' : unread}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function ChatListScreen() {
  const navigation = useNavigation<RootNav>();
  const {user} = useAuth();
  const isBuyer = user?.role === 'BUYER';

  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [total, setTotal] = useState(0);

  const load = useCallback(async (refresh = false) => {
    try {
      const res = await getMyRooms({limit: 50});
      setRooms(res.rooms);
      setTotal(res.pagination.total);
    } catch {
      // silently ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    load(true);
  }, [load]);

  return (
    <View style={[styles.safe, {backgroundColor: Colors.feedBackground}]}>
      <AppHeader />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={rooms}
          keyExtractor={item => item.id}
          contentContainerStyle={{flexGrow: 1}}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.primary} colors={[Colors.primary]} />
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({item}) => (
            <RoomRow
              room={item}
              userId={user?.id ?? ''}
              onPress={() => navigation.navigate('ChatRoom', {roomId: item.id, roomName: item.name})}
            />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>💬</Text>
              <Text style={styles.emptyTitle}>No conversations yet</Text>
              <Text style={styles.emptySubtitle}>
                {isBuyer
                  ? 'Chat rooms will appear here when merchants contact you.'
                  : 'Chat rooms will appear here when you contact buyers.'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const row = StyleSheet.create({
  wrap: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: '#FFFFFF',
  },
  avatar: {
    width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  avatarText: {fontSize: 20, fontWeight: '700'},
  body: {flex: 1},
  topLine: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3},
  name: {fontSize: 15, fontWeight: '700', color: Colors.textPrimary, flex: 1, marginRight: 8},
  time: {fontSize: 11, color: Colors.textSecondary},
  bottomLine: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  preview: {fontSize: 13, color: Colors.textSecondary, flex: 1, marginRight: 8},
  previewBold: {color: Colors.textPrimary, fontWeight: '600'},
  badge: {
    minWidth: 20, height: 20, borderRadius: 10, backgroundColor: Colors.badge,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5,
  },
  badgeText: {fontSize: 11, color: Colors.textOnPrimary, fontWeight: '700'},
});

const styles = StyleSheet.create({
  safe: {flex: 1},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  separator: {height: 1, backgroundColor: Colors.divider, marginLeft: 80},
  empty: {flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 80, paddingHorizontal: 32},
  emptyIcon: {fontSize: 52, marginBottom: 16},
  emptyTitle: {fontSize: 18, fontWeight: '700', color: Colors.textPrimary, marginBottom: 8},
  emptySubtitle: {fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22},
});
