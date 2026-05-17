import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, FlatList, StyleSheet, Text,
  TouchableOpacity, View, RefreshControl, Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { io, Socket } from 'socket.io-client';
import {
  NotificationItem,
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from '../../api/notifications';

const API_BASE = 'http://10.0.2.2:3000';

const TYPE_COLORS: Record<string, string> = {
  SYSTEM: '#6B7280', REQUEST: '#2563EB', BID: '#059669',
  PAYMENT: '#D97706', CHAT: '#7C3AED', SECURITY: '#DC2626',
  SUBSCRIPTION: '#0891B2', MARKETING: '#DB2777',
};

const TYPE_ICONS: Record<string, string> = {
  SYSTEM: '⚙️', REQUEST: '📋', BID: '💰', PAYMENT: '💳',
  CHAT: '💬', SECURITY: '🔒', SUBSCRIPTION: '⭐', MARKETING: '📣',
};

const PRIORITY_DOT: Record<string, string> = {
  LOW: '#9CA3AF', NORMAL: '#6B7280', HIGH: '#F59E0B', URGENT: '#DC2626',
};

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function NotifRow({
  item,
  onRead,
  onDelete,
}: {
  item: NotificationItem;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const isUnread = !item.readAt;
  const color = TYPE_COLORS[item.type] ?? '#6B7280';

  const confirmDelete = () => {
    Alert.alert('Delete notification?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onDelete(item.id) },
    ]);
  };

  return (
    <TouchableOpacity
      style={[styles.row, isUnread && styles.rowUnread]}
      onPress={() => isUnread && onRead(item.id)}
      onLongPress={confirmDelete}
      activeOpacity={0.7}
    >
      <View style={[styles.iconBadge, { backgroundColor: color + '20' }]}>
        <Text style={styles.iconText}>{TYPE_ICONS[item.type] ?? '🔔'}</Text>
      </View>
      <View style={styles.rowBody}>
        <View style={styles.rowTop}>
          <Text style={[styles.title, isUnread && styles.titleUnread]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.time}>{timeAgo(item.createdAt)}</Text>
        </View>
        <Text style={styles.content} numberOfLines={2}>{item.content}</Text>
        <View style={styles.rowMeta}>
          <View style={[styles.typePill, { backgroundColor: color + '18' }]}>
            <Text style={[styles.typeText, { color }]}>{item.type}</Text>
          </View>
          <View style={[styles.priorityDot, { backgroundColor: PRIORITY_DOT[item.priority] }]} />
        </View>
      </View>
      {isUnread && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );
}

const FILTERS = ['All', 'Unread', 'BID', 'REQUEST', 'CHAT', 'SYSTEM'];

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  const buildParams = useCallback((pg = 1, filter = activeFilter) => {
    const p: Record<string, unknown> = { page: pg, limit: 20 };
    if (filter === 'Unread') p.unreadOnly = true;
    else if (filter !== 'All') p.type = filter;
    return p;
  }, [activeFilter]);

  const load = useCallback(async (pg = 1, filter = activeFilter, append = false) => {
    try {
      const res = await getMyNotifications(buildParams(pg, filter) as never);
      setNotifications(prev => append ? [...prev, ...res.notifications] : res.notifications);
      setUnreadCount(res.unreadCount);
      setPage(pg);
      setTotalPages(res.pagination.totalPages);
    } catch {
      // silent
    }
  }, [buildParams]);

  useEffect(() => {
    setLoading(true);
    load(1, activeFilter, false).finally(() => setLoading(false));
  }, [activeFilter]);

  useEffect(() => {
    let socket: Socket;
    AsyncStorage.getItem('accessToken').then(token => {
      if (!token) return;
      socket = io(API_BASE, { auth: { token }, transports: ['websocket'] });
      socket.on('notification:new', (notif: NotificationItem) => {
        setNotifications(prev => [notif, ...prev]);
        setUnreadCount(c => c + 1);
      });
      socket.on('notification:read', ({ notificationId }: { notificationId: string }) => {
        setNotifications(prev =>
          prev.map(n => n.id === notificationId ? { ...n, readAt: new Date().toISOString(), status: 'READ' } : n)
        );
      });
      socket.on('notification:all_read', () => {
        setNotifications(prev => prev.map(n => ({ ...n, readAt: n.readAt ?? new Date().toISOString(), status: 'READ' as const })));
        setUnreadCount(0);
      });
      socketRef.current = socket;
    });
    return () => { socket?.disconnect(); };
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load(1, activeFilter, false);
    setRefreshing(false);
  };

  const onLoadMore = async () => {
    if (loadingMore || page >= totalPages) return;
    setLoadingMore(true);
    await load(page + 1, activeFilter, true);
    setLoadingMore(false);
  };

  const handleRead = async (id: string) => {
    await markNotificationRead(id).catch(() => null);
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, readAt: new Date().toISOString(), status: 'READ' } : n)
    );
    setUnreadCount(c => Math.max(0, c - 1));
  };

  const handleDelete = async (id: string) => {
    await deleteNotification(id).catch(() => null);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead().catch(() => null);
    setNotifications(prev => prev.map(n => ({ ...n, readAt: n.readAt ?? new Date().toISOString(), status: 'READ' as const })));
    setUnreadCount(0);
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#2563EB" /></View>;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && <Text style={styles.unreadLabel}>{unreadCount} unread</Text>}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAllRead} style={styles.markAllBtn}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter tabs */}
      <FlatList
        data={FILTERS}
        horizontal
        keyExtractor={f => f}
        showsHorizontalScrollIndicator={false}
        style={styles.filterBar}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        renderItem={({ item: f }) => (
          <TouchableOpacity
            style={[styles.filterTab, f === activeFilter && styles.filterTabActive]}
            onPress={() => setActiveFilter(f)}
          >
            <Text style={[styles.filterText, f === activeFilter && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        )}
      />

      {/* List */}
      <FlatList
        data={notifications}
        keyExtractor={n => n.id}
        renderItem={({ item }) => <NotifRow item={item} onRead={handleRead} onDelete={handleDelete} />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={loadingMore ? <ActivityIndicator style={{ padding: 16 }} /> : null}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyTitle}>No notifications</Text>
            <Text style={styles.emptyDesc}>
              {activeFilter === 'Unread' ? 'You\'re all caught up!' : 'Nothing here yet.'}
            </Text>
          </View>
        }
        contentContainerStyle={notifications.length === 0 && styles.emptyContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#F9FAFB' },
  center:           { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  headerTitle:      { fontSize: 22, fontWeight: '700', color: '#111827' },
  unreadLabel:      { fontSize: 12, color: '#6B7280', marginTop: 2 },
  markAllBtn:       { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#EFF6FF', borderRadius: 8 },
  markAllText:      { fontSize: 13, color: '#2563EB', fontWeight: '600' },
  filterBar:        { maxHeight: 48, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  filterTab:        { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, backgroundColor: '#F3F4F6' },
  filterTabActive:  { backgroundColor: '#2563EB' },
  filterText:       { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  filterTextActive: { color: '#fff', fontWeight: '700' },
  row:              { flexDirection: 'row', padding: 14, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F3F4F6', alignItems: 'flex-start' },
  rowUnread:        { backgroundColor: '#EFF6FF' },
  iconBadge:        { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  iconText:         { fontSize: 20 },
  rowBody:          { flex: 1 },
  rowTop:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 },
  title:            { fontSize: 14, color: '#374151', fontWeight: '500', flex: 1, marginRight: 8 },
  titleUnread:      { fontWeight: '700', color: '#111827' },
  time:             { fontSize: 11, color: '#9CA3AF' },
  content:          { fontSize: 13, color: '#6B7280', lineHeight: 18, marginBottom: 6 },
  rowMeta:          { flexDirection: 'row', alignItems: 'center', gap: 8 },
  typePill:         { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  typeText:         { fontSize: 10, fontWeight: '700' },
  priorityDot:      { width: 8, height: 8, borderRadius: 4 },
  unreadDot:        { width: 10, height: 10, borderRadius: 5, backgroundColor: '#2563EB', alignSelf: 'center', marginLeft: 8 },
  emptyContainer:   { flex: 1 },
  emptyState:       { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80 },
  emptyIcon:        { fontSize: 48, marginBottom: 12 },
  emptyTitle:       { fontSize: 18, fontWeight: '700', color: '#374151', marginBottom: 6 },
  emptyDesc:        { fontSize: 14, color: '#9CA3AF', textAlign: 'center' },
});
