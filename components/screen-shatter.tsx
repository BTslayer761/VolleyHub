import React, { useEffect } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withTiming
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const GRID_COLS = 6; // Reduced for better performance
const GRID_ROWS = 10; // Reduced for better performance
const TILE_WIDTH = SCREEN_WIDTH / GRID_COLS;
const TILE_HEIGHT = SCREEN_HEIGHT / GRID_ROWS;

type Props = {
  onComplete: () => void;
};

export function ScreenShatter({ onComplete }: Props) {
  const tiles = Array.from({ length: GRID_COLS * GRID_ROWS }, (_, i) => i);
  const containerOpacity = useSharedValue(1);

  useEffect(() => {
    // Fade out container smoothly
    containerOpacity.value = withTiming(0, {
      duration: 250,
      easing: Easing.out(Easing.ease),
    });

    // Navigate after a short delay for smooth transition
    const timer = setTimeout(() => {
      onComplete();
    }, 200);

    return () => clearTimeout(timer);
  }, [onComplete]);

  const containerStyle = useAnimatedStyle(() => {
    return {
      opacity: containerOpacity.value,
    };
  });

  return (
    <Animated.View style={[styles.container, containerStyle]} pointerEvents="none">
      {tiles.map((index) => (
        <ShatterTile key={index} index={index} />
      ))}
    </Animated.View>
  );
}

function ShatterTile({ index }: { index: number }) {
  const row = Math.floor(index / GRID_COLS);
  const col = index % GRID_COLS;

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.95); // Slightly transparent to show login screen behind

  useEffect(() => {
    // Calculate center of screen
    const centerX = SCREEN_WIDTH / 2;
    const centerY = SCREEN_HEIGHT / 2;

    // Calculate tile center
    const tileX = col * TILE_WIDTH + TILE_WIDTH / 2;
    const tileY = row * TILE_HEIGHT + TILE_HEIGHT / 2;

    // Calculate direction from center
    const deltaX = tileX - centerX;
    const deltaY = tileY - centerY;

    // Distance from center
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const maxDistance = Math.sqrt(
      (SCREEN_WIDTH / 2) ** 2 + (SCREEN_HEIGHT / 2) ** 2
    );

    // Normalize direction
    const dirX = deltaX / distance;
    const dirY = deltaY / distance;

    // Optimized explosion distance
    const explosionDistance = distance * 1.5;
    
    // Reduced stagger for smoother, faster animation
    const delay = (distance / maxDistance) * 50;

    // Shorter duration for smoother, faster effect
    const duration = 250 + (distance / maxDistance) * 100;

    // Simplified animation for better performance - single timing instead of sequence
    translateX.value = withDelay(
      delay,
      withTiming(dirX * explosionDistance, {
        duration,
        easing: Easing.out(Easing.cubic),
      })
    );

    translateY.value = withDelay(
      delay,
      withTiming(dirY * explosionDistance, {
        duration,
        easing: Easing.out(Easing.cubic),
      })
    );

    rotate.value = withDelay(
      delay,
      withTiming((Math.random() - 0.5) * 720, {
        duration,
        easing: Easing.out(Easing.cubic),
      })
    );

    scale.value = withDelay(
      delay,
      withTiming(0.3, {
        duration,
        easing: Easing.out(Easing.cubic),
      })
    );

    opacity.value = withDelay(
      delay,
      withTiming(0, {
        duration,
        easing: Easing.out(Easing.cubic),
      })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate.value}deg` },
        { scale: scale.value },
      ],
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View
      style={[
        styles.tile,
        {
          left: col * TILE_WIDTH,
          top: row * TILE_HEIGHT,
          width: TILE_WIDTH,
          height: TILE_HEIGHT,
          // Semi-transparent so login screen shows through as it shatters
          // Using a very light overlay that still shows the login screen
          backgroundColor: 'rgba(255, 255, 255, 0.3)',
          borderColor: 'rgba(0, 0, 0, 0.15)',
        },
        animatedStyle,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2000,
  },
  tile: {
    position: 'absolute',
    borderWidth: 0.5,
  },
});
