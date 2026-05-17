import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../types/navigation';
import {ChatMessage} from '../../types/api';
import {getMessages, sendMessage, markRoomRead} from '../../api/chat';
import {useAuth} from '../../context/AuthContext';
import io, {Socket} from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = NativeStackScreenProps<RootStackParamList, 'ChatRoom'>;

const API_BASE = 'http://10.0.2.2:3000'; // adjust for device

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'});
}

function MessageBubble({msg, isMine}: {msg: ChatMessage; isMine: boolean}) {
  if (msg.isDeleted) {
    return (
      <View style={[bubble.wrap, isMine ? bubble.mine : bubble.theirs]}>
        <Text style={bubble.deleted}>Message deleted</Text>
      </View>
    );
  }
  return (
    <View style={[bubble.wrap, isMine ? bubble.mine : bubble.theirs]}>
      <Text style={[bubble.text, isMine ? bubble.textMine : bubble.textTheirs]}>{msg.content}</Text>
      <Text style={[bubble.time, isMine ? bubble.timeMine : bubble.timeTheirs]}>
        {formatTime(msg.createdAt)}{msg.isEdited ? ' · edited' : ''}
      </Text>
    </View>
  );
}

export default function ChatRoomScreen({route, navigation}: Props) {
  const {roomId, roomName} = route.params;
  const {user} = useAuth();
  const userId = user?.id ?? '';

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await getMessages(roomId, {limit: 50});
      setMessages(res.messages);
      await markRoomRead(roomId);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  // Socket.io setup
  useEffect(() => {
    let socket: Socket;

    AsyncStorage.getItem('access_token').then(token => {
      socket = io(API_BASE, {
        auth: {token},
        transports: ['websocket'],
      });

      socket.on('connect', () => {
        socket.emit('join_room', {roomId});
      });

      socket.on('new_message', (msg: ChatMessage) => {
        setMessages(prev => [...prev, msg]);
        if (msg.senderId !== userId) {
          markRoomRead(roomId).catch(() => {});
        }
      });

      socket.on('message_deleted', ({messageId}: {messageId: string}) => {
        setMessages(prev => prev.map(m => m.id === messageId ? {...m, isDeleted: true, content: '[Message deleted]'} : m));
      });

      socket.on('user_typing', ({userId: typingId}: {userId: string}) => {
        if (typingId === userId) return;
        setTypingUsers(prev => prev.includes(typingId) ? prev : [...prev, typingId]);
      });

      socket.on('user_stopped_typing', ({userId: typingId}: {userId: string}) => {
        setTypingUsers(prev => prev.filter(id => id !== typingId));
      });

      socket.on('messages_read', () => {});

      socketRef.current = socket;
    });

    load();

    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leave_room', {roomId});
        socketRef.current.disconnect();
      }
    };
  }, [roomId, userId, load]);

  const handleSend = useCallback(async () => {
    const content = text.trim();
    if (!content || sending) return;

    setText('');
    setSending(true);

    if (socketRef.current?.connected) {
      // Send via socket for instant delivery
      socketRef.current.emit('send_message', {roomId, content, type: 'TEXT'});
      setSending(false);
    } else {
      // Fallback to REST
      try {
        const msg = await sendMessage(roomId, {content});
        setMessages(prev => [...prev, msg]);
      } catch {
        setText(content); // restore on failure
      } finally {
        setSending(false);
      }
    }
  }, [text, sending, roomId]);

  const handleTyping = useCallback((val: string) => {
    setText(val);

    if (!socketRef.current?.connected) return;

    socketRef.current.emit('typing_start', {roomId});

    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socketRef.current?.emit('typing_stop', {roomId});
    }, 2000);
  }, [roomId]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({animated: true}), 100);
    }
  }, [messages.length]);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>{roomName}</Text>
          {typingUsers.length > 0 && (
            <Text style={styles.typingText}>
              {typingUsers.length === 1 ? 'Someone is typing…' : 'Multiple people typing…'}
            </Text>
          )}
        </View>
        <View style={{width: 28}} />
      </View>

      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#2563EB" />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({item}) => (
              <MessageBubble msg={item} isMine={item.senderId === userId} />
            )}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyIcon}>💬</Text>
                <Text style={styles.emptyText}>No messages yet. Say hello!</Text>
              </View>
            }
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({animated: false})}
          />
        )}

        {/* Compose bar */}
        <View style={styles.compose}>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={handleTyping}
            placeholder="Type a message…"
            placeholderTextColor="#9CA3AF"
            multiline
            maxLength={2000}
            returnKeyType="default"
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!text.trim() || sending) && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!text.trim() || sending}
            activeOpacity={0.8}>
            {sending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.sendIcon}>↑</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const bubble = StyleSheet.create({
  wrap: {maxWidth: '75%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 4},
  mine: {backgroundColor: '#2563EB', alignSelf: 'flex-end', borderBottomRightRadius: 4},
  theirs: {backgroundColor: '#FFFFFF', alignSelf: 'flex-start', borderBottomLeftRadius: 4,
    shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1},
  text: {fontSize: 15, lineHeight: 21},
  textMine: {color: '#FFFFFF'},
  textTheirs: {color: '#111827'},
  time: {fontSize: 10, marginTop: 4},
  timeMine: {color: 'rgba(255,255,255,0.6)', textAlign: 'right'},
  timeTheirs: {color: '#9CA3AF'},
  deleted: {fontSize: 14, fontStyle: 'italic', color: '#9CA3AF'},
});

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: '#F3F4F6'},
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
  },
  back: {fontSize: 20, color: '#374151', fontWeight: '600'},
  headerCenter: {flex: 1, alignItems: 'center'},
  headerTitle: {fontSize: 17, fontWeight: '700', color: '#111827'},
  typingText: {fontSize: 11, color: '#6B7280', fontStyle: 'italic', marginTop: 1},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  listContent: {padding: 12, paddingBottom: 8, flexGrow: 1},
  empty: {flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60},
  emptyIcon: {fontSize: 48, marginBottom: 12},
  emptyText: {fontSize: 15, color: '#9CA3AF'},
  compose: {
    flexDirection: 'row', alignItems: 'flex-end', padding: 10, gap: 8,
    backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E5E7EB',
  },
  input: {
    flex: 1, backgroundColor: '#F9FAFB', borderRadius: 22, borderWidth: 1, borderColor: '#E5E7EB',
    paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, color: '#111827',
    maxHeight: 120,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#2563EB',
    alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: {backgroundColor: '#BFDBFE'},
  sendIcon: {fontSize: 18, color: '#FFFFFF', fontWeight: '700'},
});
