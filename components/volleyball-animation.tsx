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
import { Image } from 'expo-image';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const VOLLEYBALL_SIZE = 120;
const HIT_POSITION_X = SCREEN_WIDTH / 2;
const HIT_POSITION_Y = SCREEN_HEIGHT / 2;
// 100px diameter = 100/120 = 0.833 scale
const HIT_SCALE = 100 / VOLLEYBALL_SIZE; // ~0.833

// Start position: top center/back (spiking motion - coming from above)
const START_X = SCREEN_WIDTH / 2;
const START_Y = -VOLLEYBALL_SIZE; // Start above the screen

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
      // Calculate current scale based on progress (matching the animation)
      const currentScale = interpolate(
        currentProgress,
        [0, 0.7, 1],
        [4.0, 1.5, HIT_SCALE]
      );
      // Trigger when ball reaches 100px diameter (HIT_SCALE)
      if (!hasTriggered.value && currentProgress >= 0.99) {
        hasTriggered.value = true;
        runOnJS(onHit)();
      }
    }
  );

  useEffect(() => {
    // Animate progress from 0 to 1 - very fast spiking motion
    progress.value = withTiming(1, {
      duration: 400, // Much faster spike motion
      easing: Easing.in(Easing.cubic), // Aggressive acceleration
    });

    // Reduced spinning rotation for more realistic motion
    rotation.value = withTiming(360 * 0.5, {
      duration: 400,
      easing: Easing.linear,
    });
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    // Spiking motion: straight downward path with slight angle
    // Start from top center, hit center of screen
    const t = progress.value;
    
    // Linear interpolation for direct spike path
    // Slight angle variation for more natural spike
    const angleOffset = interpolate(t, [0, 1], [0, 20]); // Slight angle as it comes down
    const x = interpolate(
      t,
      [0, 1],
      [START_X, HIT_POSITION_X + angleOffset]
    );
    const y = interpolate(
      t,
      [0, 1],
      [START_Y, HIT_POSITION_Y]
    );

    // Scale from large (far away) to 100px diameter (hitting screen)
    // More aggressive scaling for spiking effect
    const scale = interpolate(
      progress.value,
      [0, 0.7, 1], // Faster scale change
      [4.0, 1.5, HIT_SCALE]
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
      <Image
        source={require('@/assets/images/volleyball.png')}
        style={styles.volleyballImage}
        contentFit="contain"
      />
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
  volleyballImage: {
    width: VOLLEYBALL_SIZE,
    height: VOLLEYBALL_SIZE,
  },
});
