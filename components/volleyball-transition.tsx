import React, { useEffect } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withSpring,
  Easing,
  runOnJS,
  interpolate,
} from 'react-native-reanimated';
import { Image } from 'expo-image';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const VOLLEYBALL_SIZE = 120;
const CENTER_X = SCREEN_WIDTH / 2;
const CENTER_Y = SCREEN_HEIGHT / 2;

type Props = {
  onComplete: () => void;
};

export function VolleyballTransition({ onComplete }: Props) {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];
  const backgroundColor = themeColors.background;

  // Volleyball animation values
  const volleyballScale = useSharedValue(0.833); // Start at 100px (hit size)
  const volleyballRotation = useSharedValue(0);
  const volleyballOpacity = useSharedValue(1);
  const volleyballTranslateY = useSharedValue(0);

  // Screen overlay animation
  const overlayOpacity = useSharedValue(0);
  const overlayScale = useSharedValue(0.95);

  useEffect(() => {
    // Phase 1: Volleyball spins and scales up while fading (0-400ms)
    volleyballRotation.value = withTiming(720, {
      duration: 400,
      easing: Easing.out(Easing.cubic),
    });

    volleyballScale.value = withSpring(2.5, {
      damping: 12,
      stiffness: 100,
    });

    volleyballOpacity.value = withTiming(0, {
      duration: 400,
      easing: Easing.out(Easing.ease),
    });

    volleyballTranslateY.value = withSpring(-50, {
      damping: 15,
      stiffness: 120,
    });

    // Phase 2: Screen overlay fades in smoothly (200-600ms)
    overlayOpacity.value = withSequence(
      withTiming(0, { duration: 200 }), // Stay transparent initially
      withTiming(1, {
        duration: 400,
        easing: Easing.out(Easing.ease),
      })
    );

    overlayScale.value = withSpring(1, {
      damping: 20,
      stiffness: 150,
      delay: 200,
    });

    // Complete transition after animation
    const timer = setTimeout(() => {
      runOnJS(onComplete)();
    }, 600);

    return () => clearTimeout(timer);
  }, [onComplete]);

  const volleyballStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: CENTER_X - VOLLEYBALL_SIZE / 2 },
        { translateY: CENTER_Y - VOLLEYBALL_SIZE / 2 + volleyballTranslateY.value },
        { rotate: `${volleyballRotation.value}deg` },
        { scale: volleyballScale.value },
      ],
      opacity: volleyballOpacity.value,
    };
  });

  const overlayStyle = useAnimatedStyle(() => {
    return {
      opacity: overlayOpacity.value,
      transform: [{ scale: overlayScale.value }],
    };
  });

  return (
    <>
      {/* Volleyball spinning and fading */}
      <Animated.View style={[styles.volleyballContainer, volleyballStyle]} pointerEvents="none">
        <Image
          source={require('@/assets/images/volleyball.png')}
          style={styles.volleyballImage}
          contentFit="contain"
        />
      </Animated.View>

      {/* Smooth overlay that fades in */}
      <Animated.View
        style={[styles.overlay, overlayStyle, { backgroundColor }]}
        pointerEvents="none"
      />
    </>
  );
}

const styles = StyleSheet.create({
  volleyballContainer: {
    position: 'absolute',
    width: VOLLEYBALL_SIZE,
    height: VOLLEYBALL_SIZE,
    zIndex: 2000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  volleyballImage: {
    width: VOLLEYBALL_SIZE,
    height: VOLLEYBALL_SIZE,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1500,
  },
});
