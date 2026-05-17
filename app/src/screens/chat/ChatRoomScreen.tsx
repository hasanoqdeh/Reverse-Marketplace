import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
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
import FastImage from 'react-native-fast-image';
import {launchImageLibrary} from 'react-native-image-picker';
import ImageViewerModal from '../../components/ImageViewerModal';
import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import AudioRecorderPlayer, {RecordBackType, PlayBackType} from 'react-native-audio-recorder-player';
import io, {Socket} from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {RootStackParamList} from '../../types/navigation';
import {ChatMessage} from '../../types/api';
import {getMessages, getRoom, sendMessage, markRoomRead, uploadChatMedia} from '../../api/chat';
import {useAuth} from '../../context/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'ChatRoom'>;

const API_BASE = 'http://10.0.2.2:3000';
const ACCENT = '#2563EB';
const audioPlayer = new AudioRecorderPlayer();

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'});
}

function formatDuration(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ─── Bubble components ─────────────────────────────────────────────────────

function DeletedBubble({isMine}: {isMine: boolean}) {
  return (
    <View style={[b.wrap, isMine ? b.mine : b.theirs]}>
      <Text style={b.deleted}>Message deleted</Text>
    </View>
  );
}

function TextBubble({msg, isMine}: {msg: ChatMessage; isMine: boolean}) {
  return (
    <View style={[b.wrap, isMine ? b.mine : b.theirs]}>
      <Text style={[b.text, isMine ? b.textMine : b.textTheirs]}>{msg.content}</Text>
      <Text style={[b.time, isMine ? b.timeMine : b.timeTheirs]}>
        {formatTime(msg.createdAt)}{msg.isEdited ? ' · edited' : ''}
      </Text>
    </View>
  );
}

function ImageBubble({msg, isMine}: {msg: ChatMessage; isMine: boolean}) {
  const uri = msg.mediaUrls?.[0];
  const [viewing, setViewing] = React.useState(false);
  if (!uri) return <TextBubble msg={msg} isMine={isMine} />;
  return (
    <>
      <TouchableOpacity
        onPress={() => setViewing(true)}
        activeOpacity={0.9}
        style={[b.wrap, isMine ? b.mine : b.theirs, {padding: 3, maxWidth: '70%'}]}>
        <FastImage
          source={{uri}}
          style={imgStyles.img}
          resizeMode={FastImage.resizeMode.cover}
        />
        <Text style={[b.time, isMine ? b.timeMine : b.timeTheirs, imgStyles.time]}>
          {formatTime(msg.createdAt)}
        </Text>
      </TouchableOpacity>
      {viewing && <ImageViewerModal uri={uri} onClose={() => setViewing(false)} />}
    </>
  );
}

function VoiceBubble({
  msg, isMine, isPlaying, progress, onToggle,
}: {
  msg: ChatMessage; isMine: boolean; isPlaying: boolean; progress: number; onToggle: () => void;
}) {
  return (
    <View style={[b.wrap, isMine ? b.mine : b.theirs, vs.wrap]}>
      <TouchableOpacity onPress={onToggle} activeOpacity={0.7} style={vs.playBtn}>
        <Text style={vs.playIcon}>{isPlaying ? '⏸' : '▶'}</Text>
      </TouchableOpacity>
      <View style={vs.barTrack}>
        <View style={[vs.barFill, {
          width: `${Math.round(progress * 100)}%` as any,
          backgroundColor: isMine ? 'rgba(255,255,255,0.85)' : ACCENT,
        }]} />
      </View>
      <Text style={[b.time, isMine ? b.timeMine : b.timeTheirs, {marginLeft: 6}]}>
        {formatTime(msg.createdAt)}
      </Text>
    </View>
  );
}

function MessageBubble({
  msg, isMine, playingId, playProgress, onTogglePlay,
}: {
  msg: ChatMessage;
  isMine: boolean;
  playingId: string | null;
  playProgress: Record<string, number>;
  onTogglePlay: (msg: ChatMessage) => void;
}) {
  if (msg.isDeleted) return <DeletedBubble isMine={isMine} />;
  if (msg.type === 'IMAGE') return <ImageBubble msg={msg} isMine={isMine} />;
  if (msg.type === 'VOICE') {
    return (
      <VoiceBubble
        msg={msg}
        isMine={isMine}
        isPlaying={playingId === msg.id}
        progress={playProgress[msg.id] ?? 0}
        onToggle={() => onTogglePlay(msg)}
      />
    );
  }
  return <TextBubble msg={msg} isMine={isMine} />;
}

// ─── Main screen ───────────────────────────────────────────────────────────

export default function ChatRoomScreen({route, navigation}: Props) {
  const {roomId, roomName} = route.params;
  const {user} = useAuth();
  const userId = user?.id ?? '';

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [roomActive, setRoomActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  // Voice recording
  const [recording, setRecording] = useState(false);
  const [recordSecs, setRecordSecs] = useState(0);
  const recordSecsRef = useRef(0);
  const recordPulse = useRef(new Animated.Value(1)).current;

  // Voice playback
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [playProgress, setPlayProgress] = useState<Record<string, number>>({});

  const socketRef = useRef<Socket | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Load ─────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    try {
      const [msgRes, room] = await Promise.all([
        getMessages(roomId, {limit: 50}),
        getRoom(roomId),
      ]);
      setMessages(msgRes.messages);
      setRoomActive(room.isActive);
      if (room.isActive) await markRoomRead(roomId);
    } catch {}
    finally {setLoading(false);}
  }, [roomId]);

  // ── Socket ───────────────────────────────────────────────────────
  useEffect(() => {
    let socket: Socket;
    AsyncStorage.getItem('accessToken').then(token => {
      socket = io(API_BASE, {auth: {token}, transports: ['websocket']});

      socket.on('connect', () => socket.emit('join_room', {roomId}));

      socket.on('new_message', (msg: ChatMessage) => {
        setMessages(prev => [...prev, msg]);
        if (msg.senderId !== userId) markRoomRead(roomId).catch(() => {});
      });

      socket.on('message_deleted', ({messageId}: {messageId: string}) => {
        setMessages(prev => prev.map(m =>
          m.id === messageId ? {...m, isDeleted: true, content: '[Message deleted]'} : m,
        ));
      });

      socket.on('user_typing', ({userId: tid}: {userId: string}) => {
        if (tid === userId) return;
        setTypingUsers(prev => prev.includes(tid) ? prev : [...prev, tid]);
      });
      socket.on('user_stopped_typing', ({userId: tid}: {userId: string}) => {
        setTypingUsers(prev => prev.filter(id => id !== tid));
      });

      socketRef.current = socket;
    });

    load();

    return () => {
      socketRef.current?.emit('leave_room', {roomId});
      socketRef.current?.disconnect();
    };
  }, [roomId, userId, load]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({animated: true}), 80);
    }
  }, [messages.length]);

  // ── Send text ────────────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    const content = text.trim();
    if (!content || sending) return;
    setText('');
    setSending(true);
    if (socketRef.current?.connected) {
      socketRef.current.emit('send_message', {roomId, content, type: 'TEXT'});
      setSending(false);
    } else {
      try {
        const msg = await sendMessage(roomId, {content});
        setMessages(prev => [...prev, msg]);
      } catch { setText(content); }
      finally { setSending(false); }
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

  // ── Image picker ─────────────────────────────────────────────────
  const handlePickImage = useCallback(async () => {
    const result = await launchImageLibrary({mediaType: 'photo', quality: 0.8, selectionLimit: 1});
    if (result.didCancel || !result.assets?.[0]) return;
    const asset = result.assets[0];
    if (!asset.uri) return;

    setUploadingMedia(true);
    try {
      const {url} = await uploadChatMedia(
        asset.uri,
        asset.type ?? 'image/jpeg',
        asset.fileName ?? `img_${Date.now()}.jpg`,
      );
      const payload = {roomId, content: '📷 Image', type: 'IMAGE', mediaUrls: [url]};
      if (socketRef.current?.connected) {
        socketRef.current.emit('send_message', payload);
      } else {
        const msg = await sendMessage(roomId, {content: '📷 Image', type: 'IMAGE', mediaUrls: [url]});
        setMessages(prev => [...prev, msg]);
      }
    } catch { Alert.alert('Upload failed', 'Could not send image. Try again.'); }
    finally { setUploadingMedia(false); }
  }, [roomId]);

  // ── Voice recording ──────────────────────────────────────────────
  const startRecordingPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(recordPulse, {toValue: 1.3, duration: 600, useNativeDriver: true}),
        Animated.timing(recordPulse, {toValue: 1, duration: 600, useNativeDriver: true}),
      ]),
    ).start();
  };

  const handleMicPressIn = useCallback(async () => {
    const perm = await check(PERMISSIONS.ANDROID.RECORD_AUDIO);
    const granted = perm === RESULTS.GRANTED
      ? perm
      : await request(PERMISSIONS.ANDROID.RECORD_AUDIO);
    if (granted !== RESULTS.GRANTED) {
      Alert.alert('Permission required', 'Microphone access is needed to send voice messages.');
      return;
    }
    recordSecsRef.current = 0;
    setRecordSecs(0);
    setRecording(true);
    startRecordingPulse();
    await audioPlayer.startRecorder();
    audioPlayer.addRecordBackListener((e: RecordBackType) => {
      const s = Math.floor(e.currentPosition / 1000);
      recordSecsRef.current = s;
      setRecordSecs(s);
    });
  }, []);

  const handleMicPressOut = useCallback(async () => {
    if (!recording) return;
    setRecording(false);
    recordPulse.stopAnimation();
    Animated.timing(recordPulse, {toValue: 1, duration: 150, useNativeDriver: true}).start();

    let filePath: string;
    try {
      filePath = await audioPlayer.stopRecorder();
      audioPlayer.removeRecordBackListener();
    } catch { return; }

    if (recordSecsRef.current < 1) return; // too short, discard

    setUploadingMedia(true);
    try {
      const uri = filePath.startsWith('file://') ? filePath : `file://${filePath}`;
      const {url} = await uploadChatMedia(uri, 'audio/mp4', `voice_${Date.now()}.mp4`);
      const dur = formatDuration(recordSecsRef.current);
      const payload = {roomId, content: `🎤 ${dur}`, type: 'VOICE', mediaUrls: [url]};
      if (socketRef.current?.connected) {
        socketRef.current.emit('send_message', payload);
      } else {
        const msg = await sendMessage(roomId, {content: `🎤 ${dur}`, type: 'VOICE', mediaUrls: [url]});
        setMessages(prev => [...prev, msg]);
      }
    } catch { Alert.alert('Upload failed', 'Could not send voice message. Try again.'); }
    finally { setUploadingMedia(false); }
  }, [recording, roomId, recordPulse]);

  // ── Audio playback ───────────────────────────────────────────────
  const handleTogglePlay = useCallback(async (msg: ChatMessage) => {
    const url = msg.mediaUrls?.[0];
    if (!url) return;

    if (playingId === msg.id) {
      await audioPlayer.stopPlayer();
      audioPlayer.removePlayBackListener();
      setPlayingId(null);
      return;
    }

    if (playingId) {
      await audioPlayer.stopPlayer();
      audioPlayer.removePlayBackListener();
    }

    setPlayingId(msg.id);
    audioPlayer.addPlayBackListener((e: PlayBackType) => {
      const progress = e.duration > 0 ? e.currentPosition / e.duration : 0;
      setPlayProgress(prev => ({...prev, [msg.id]: progress}));
      if (e.currentPosition >= e.duration && e.duration > 0) {
        setPlayingId(null);
        audioPlayer.stopPlayer().catch(() => {});
      }
    });
    await audioPlayer.startPlayer(url);
  }, [playingId]);

  // ── Render ───────────────────────────────────────────────────────
  const isBusy = sending || uploadingMedia;
  const showSend = text.trim().length > 0;

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}>
          <Text style={s.back}>←</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle} numberOfLines={1}>{roomName}</Text>
          {typingUsers.length > 0 && (
            <Text style={s.typingText}>
              {typingUsers.length === 1 ? 'typing…' : 'several people typing…'}
            </Text>
          )}
        </View>
        <View style={{width: 28}} />
      </View>

      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}>

        {/* Message list */}
        {loading ? (
          <View style={s.center}>
            <ActivityIndicator size="large" color={ACCENT} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={item => item.id}
            contentContainerStyle={s.listContent}
            renderItem={({item}) => (
              <MessageBubble
                msg={item}
                isMine={item.senderId === userId}
                playingId={playingId}
                playProgress={playProgress}
                onTogglePlay={handleTogglePlay}
              />
            )}
            ListEmptyComponent={
              <View style={s.empty}>
                <Text style={s.emptyIcon}>💬</Text>
                <Text style={s.emptyText}>No messages yet. Say hello!</Text>
              </View>
            }
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({animated: false})}
          />
        )}

        {!roomActive && (
          <View style={s.archivedBanner}>
            <Text style={s.archivedText}>
              This conversation is archived — the transaction has been completed.
            </Text>
          </View>
        )}

        {/* Compose bar */}
        {roomActive && (
          <View style={s.compose}>
            {/* Attach / uploading */}
            <TouchableOpacity
              style={s.actionBtn}
              onPress={handlePickImage}
              disabled={isBusy || recording}
              activeOpacity={0.7}>
              {uploadingMedia
                ? <ActivityIndicator size="small" color={ACCENT} />
                : <Text style={s.actionIcon}>📎</Text>}
            </TouchableOpacity>

            {/* Input or recording indicator */}
            {recording ? (
              <View style={s.recordingBar}>
                <Animated.View style={[s.recordDot, {transform: [{scale: recordPulse}]}]} />
                <Text style={s.recordTimer}>{formatDuration(recordSecs)}</Text>
                <Text style={s.recordHint}>Release to send</Text>
              </View>
            ) : (
              <TextInput
                style={s.input}
                value={text}
                onChangeText={handleTyping}
                placeholder="Message…"
                placeholderTextColor="#9CA3AF"
                multiline
                maxLength={2000}
              />
            )}

            {/* Send or mic */}
            {showSend ? (
              <TouchableOpacity
                style={[s.sendBtn, isBusy && s.sendBtnDisabled]}
                onPress={handleSend}
                disabled={isBusy}
                activeOpacity={0.8}>
                {sending
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Text style={s.sendIcon}>↑</Text>}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[s.micBtn, recording && s.micBtnActive]}
                onPressIn={handleMicPressIn}
                onPressOut={handleMicPressOut}
                disabled={uploadingMedia}
                activeOpacity={0.8}>
                <Text style={s.micIcon}>🎤</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────

const b = StyleSheet.create({
  wrap: {
    maxWidth: '75%', borderRadius: 18,
    paddingHorizontal: 14, paddingVertical: 10,
    marginBottom: 4,
  },
  mine:      {backgroundColor: '#2563EB', alignSelf: 'flex-end', borderBottomRightRadius: 4},
  theirs:    {
    backgroundColor: '#FFFFFF', alignSelf: 'flex-start', borderBottomLeftRadius: 4,
    shadowColor: '#000', shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  text:      {fontSize: 15, lineHeight: 21},
  textMine:  {color: '#FFFFFF'},
  textTheirs:{color: '#111827'},
  time:      {fontSize: 10, marginTop: 4},
  timeMine:  {color: 'rgba(255,255,255,0.6)', textAlign: 'right'},
  timeTheirs:{color: '#9CA3AF'},
  deleted:   {fontSize: 14, fontStyle: 'italic', color: '#9CA3AF'},
});

const imgStyles = StyleSheet.create({
  img:  {width: 220, height: 170, borderRadius: 14},
  time: {paddingHorizontal: 6, paddingBottom: 2, marginTop: 4},
});

const vs = StyleSheet.create({
  wrap:    {flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 8},
  playBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  playIcon:{fontSize: 16, color: '#FFFFFF'},
  barTrack:{flex: 1, height: 4, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 2, overflow: 'hidden'},
  barFill: {height: '100%', borderRadius: 2},
});

const s = StyleSheet.create({
  safe:   {flex: 1, backgroundColor: '#F3F4F6'},
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
  },
  back:         {fontSize: 20, color: '#374151', fontWeight: '600'},
  headerCenter: {flex: 1, alignItems: 'center'},
  headerTitle:  {fontSize: 17, fontWeight: '700', color: '#111827'},
  typingText:   {fontSize: 11, color: '#6B7280', fontStyle: 'italic', marginTop: 1},
  center:       {flex: 1, alignItems: 'center', justifyContent: 'center'},
  listContent:  {padding: 12, paddingBottom: 8, flexGrow: 1},
  empty:        {flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60},
  emptyIcon:    {fontSize: 48, marginBottom: 12},
  emptyText:    {fontSize: 15, color: '#9CA3AF'},

  archivedBanner: {
    backgroundColor: '#F3F4F6', borderTopWidth: 1, borderTopColor: '#E5E7EB',
    paddingHorizontal: 20, paddingVertical: 14, alignItems: 'center',
  },
  archivedText: {fontSize: 13, color: '#6B7280', textAlign: 'center', lineHeight: 18},

  compose: {
    flexDirection: 'row', alignItems: 'flex-end',
    padding: 10, gap: 8,
    backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E5E7EB',
  },
  actionBtn:  {width: 40, height: 40, alignItems: 'center', justifyContent: 'center'},
  actionIcon: {fontSize: 22},

  input: {
    flex: 1, backgroundColor: '#F9FAFB', borderRadius: 22,
    borderWidth: 1, borderColor: '#E5E7EB',
    paddingHorizontal: 16, paddingVertical: 10,
    fontSize: 15, color: '#111827', maxHeight: 120,
  },

  recordingBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FEF2F2', borderRadius: 22,
    paddingHorizontal: 16, paddingVertical: 12, gap: 10,
    borderWidth: 1, borderColor: '#FECACA',
  },
  recordDot:   {width: 10, height: 10, borderRadius: 5, backgroundColor: '#EF4444'},
  recordTimer: {fontSize: 15, fontWeight: '700', color: '#EF4444', minWidth: 38},
  recordHint:  {fontSize: 13, color: '#9CA3AF'},

  sendBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: ACCENT,
    alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: {backgroundColor: '#BFDBFE'},
  sendIcon: {fontSize: 18, color: '#FFFFFF', fontWeight: '700'},

  micBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#E5E7EB',
    alignItems: 'center', justifyContent: 'center',
  },
  micBtnActive: {backgroundColor: '#FEE2E2'},
  micIcon:      {fontSize: 20},
});
