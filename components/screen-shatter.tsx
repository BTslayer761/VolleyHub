import React, { useEffect } from 'react';
import { StyleSheet, Dimensions, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const GRID_COLS = 8;
const GRID_ROWS = 12;
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
      duration: 400,
      easing: Easing.out(Easing.ease),
    });

    // Navigate after a short delay for smooth transition
    const timer = setTimeout(() => {
      onComplete();
    }, 300);

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
  const opacity = useSharedValue(1);

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

    // Smoother explosion with less randomness
    const explosionDistance = distance * 1.2;
    
    // Stagger animation based on distance from center
    const delay = (distance / maxDistance) * 100;

    // Duration based on distance for smoother effect
    const duration = 350 + (distance / maxDistance) * 150;

    // Animate tile flying away with sequence for smoother effect
    translateX.value = withDelay(
      delay,
      withSequence(
        withTiming(dirX * explosionDistance * 0.3, {
          duration: duration * 0.3,
          easing: Easing.out(Easing.quad),
        }),
        withTiming(dirX * explosionDistance, {
          duration: duration * 0.7,
          easing: Easing.out(Easing.cubic),
        })
      )
    );

    translateY.value = withDelay(
      delay,
      withSequence(
        withTiming(dirY * explosionDistance * 0.3, {
          duration: duration * 0.3,
          easing: Easing.out(Easing.quad),
        }),
        withTiming(dirY * explosionDistance, {
          duration: duration * 0.7,
          easing: Easing.out(Easing.cubic),
        })
      )
    );

    rotate.value = withDelay(
      delay,
      withTiming((Math.random() - 0.5) * 360, {
        duration,
        easing: Easing.out(Easing.cubic),
      })
    );

    scale.value = withDelay(
      delay,
      withTiming(0.8, {
        duration: duration * 0.5,
        easing: Easing.out(Easing.quad),
      })
    );

    opacity.value = withDelay(
      delay,
      withSequence(
        withTiming(0.7, {
          duration: duration * 0.3,
          easing: Easing.out(Easing.quad),
        }),
        withTiming(0, {
          duration: duration * 0.7,
          easing: Easing.out(Easing.cubic),
        })
      )
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
          backgroundColor: '#FFFFFF',
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
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
});
