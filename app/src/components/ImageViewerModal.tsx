import React, {useCallback} from 'react';
import {Dimensions, Modal, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const {width: SW, height: SH} = Dimensions.get('window');

interface Props {
  uri: string;
  onClose: () => void;
}

export default function ImageViewerModal({uri, onClose}: Props) {
  const scale      = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const offsetX    = useSharedValue(0);
  const offsetY    = useSharedValue(0);
  const savedOffsetX = useSharedValue(0);
  const savedOffsetY = useSharedValue(0);

  const pinch = Gesture.Pinch()
    .onUpdate(e => {
      scale.value = Math.max(1, Math.min(5, savedScale.value * e.scale));
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      if (scale.value < 1.05) {
        scale.value = withSpring(1);
        savedScale.value = 1;
        offsetX.value = withSpring(0);
        offsetY.value = withSpring(0);
        savedOffsetX.value = 0;
        savedOffsetY.value = 0;
      }
    });

  const pan = Gesture.Pan()
    .onUpdate(e => {
      offsetX.value = savedOffsetX.value + e.translationX;
      offsetY.value = savedOffsetY.value + e.translationY;
    })
    .onEnd(() => {
      savedOffsetX.value = offsetX.value;
      savedOffsetY.value = offsetY.value;
    });

  const composed = Gesture.Simultaneous(pinch, pan);

  const imgStyle = useAnimatedStyle(() => ({
    transform: [
      {translateX: offsetX.value},
      {translateY: offsetY.value},
      {scale: scale.value},
    ],
  }));

  const handleClose = useCallback(() => {
    scale.value = 1;
    savedScale.value = 1;
    offsetX.value = 0;
    offsetY.value = 0;
    savedOffsetX.value = 0;
    savedOffsetY.value = 0;
    onClose();
  }, [onClose, scale, savedScale, offsetX, offsetY, savedOffsetX, savedOffsetY]);

  return (
    <Modal visible animationType="fade" transparent statusBarTranslucent onRequestClose={handleClose}>
      <View style={s.backdrop}>
        <TouchableOpacity style={s.closeBtn} onPress={handleClose} hitSlop={{top:10,bottom:10,left:10,right:10}}>
          <Text style={s.closeIcon}>✕</Text>
        </TouchableOpacity>
        <Text style={s.hint}>Pinch to zoom · drag to pan · double-tap to reset</Text>
        <GestureDetector gesture={composed}>
          <Animated.Image
            source={{uri}}
            style={[s.img, imgStyle]}
            resizeMode="contain"
          />
        </GestureDetector>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  img: {
    width: SW,
    height: SH * 0.78,
  },
  closeBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {fontSize: 18, color: '#FFFFFF', fontWeight: '700'},
  hint: {
    position: 'absolute',
    bottom: 48,
    fontSize: 12,
    color: 'rgba(255,255,255,0.45)',
  },
});
