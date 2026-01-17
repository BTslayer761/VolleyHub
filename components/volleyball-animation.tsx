import React, { useEffect } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedReaction,
  withTiming,
  Easing,
  runOnJS,
  interpolate,
} from 'react-native-reanimated';
import { Volleyball } from './volleyball';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const VOLLEYBALL_SIZE = 120;
const HIT_POSITION_X = SCREEN_WIDTH / 2;
const HIT_POSITION_Y = SCREEN_HEIGHT / 2;
// 30px diameter = 30/120 = 0.25 scale
const HIT_SCALE = 30 / VOLLEYBALL_SIZE; // 0.25

// Start position: bottom right of screen
const START_X = SCREEN_WIDTH - VOLLEYBALL_SIZE;
const START_Y = SCREEN_HEIGHT - VOLLEYBALL_SIZE;

type Props = {
  onHit: () => void;
};

export function VolleyballAnimation({ onHit }: Props) {
  // Animation progress from 0 to 1
  const progress = useSharedValue(0);
  const rotation = useSharedValue(0);
  const opacity = useSharedValue(1);
  const hasTriggered = useSharedValue(false);

  // Watch for when scale reaches hit threshold and trigger immediately
  useAnimatedReaction(
    () => progress.value,
    (currentProgress) => {
      // Calculate current scale based on progress
      const currentScale = interpolate(
        currentProgress,
        [0, 1],
        [3.0, HIT_SCALE - 0.05]
      );
      if (!hasTriggered.value && currentScale <= HIT_SCALE) {
        hasTriggered.value = true;
        runOnJS(onHit)();
      }
    }
  );

  useEffect(() => {
    // Animate progress from 0 to 1
    progress.value = withTiming(1, {
      duration: 800,
      easing: Easing.in(Easing.cubic),
    });

    // Fast spinning rotation for 3D effect
    rotation.value = withTiming(360 * 5, {
      duration: 800,
      easing: Easing.linear,
    });
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    // Calculate arc path using quadratic bezier curve
    // Control point for arc (higher up to create arc effect)
    const controlX = (START_X + HIT_POSITION_X) / 2;
    const controlY = Math.min(START_Y, HIT_POSITION_Y) - SCREEN_HEIGHT * 0.3; // Arc height

    // Interpolate along the arc
    const t = progress.value;
    const x = (1 - t) * (1 - t) * START_X + 2 * (1 - t) * t * controlX + t * t * HIT_POSITION_X;
    const y = (1 - t) * (1 - t) * START_Y + 2 * (1 - t) * t * controlY + t * t * HIT_POSITION_Y;

    // Scale from large to small
    const scale = interpolate(
      progress.value,
      [0, 1],
      [3.0, HIT_SCALE - 0.05]
    );

    return {
      transform: [
        { translateX: x - VOLLEYBALL_SIZE / 2 },
        { translateY: y - VOLLEYBALL_SIZE / 2 },
        { rotate: `${rotation.value}deg` },
        { scale },
      ],
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View style={[styles.container, animatedStyle]} pointerEvents="none">
      <Volleyball size={VOLLEYBALL_SIZE} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: VOLLEYBALL_SIZE,
    height: VOLLEYBALL_SIZE,
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
