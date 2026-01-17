import React, { useEffect } from 'react';
import { StyleSheet, Dimensions, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const GRID_COLS = 12;
const GRID_ROWS = 18;
const TILE_WIDTH = SCREEN_WIDTH / GRID_COLS;
const TILE_HEIGHT = SCREEN_HEIGHT / GRID_ROWS;

type Props = {
  onComplete: () => void;
};

export function ScreenShatter({ onComplete }: Props) {
  const tiles = Array.from({ length: GRID_COLS * GRID_ROWS }, (_, i) => i);
  const fadeProgress = useSharedValue(0);

  useEffect(() => {
    // Start fade immediately
    fadeProgress.value = withTiming(1, {
      duration: 200,
      easing: Easing.out(Easing.ease),
    });

    // Navigate very quickly - almost immediately
    const timer = setTimeout(() => {
      onComplete();
    }, 150);

    return () => clearTimeout(timer);
  }, [onComplete]);

  const containerStyle = useAnimatedStyle(() => {
    return {
      opacity: 1 - fadeProgress.value * 0.3, // Slight fade for smoothness
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

    // Randomize the explosion
    const randomFactor = 0.7 + Math.random() * 0.6;
    const explosionDistance = distance * randomFactor * 2;

    // Very fast shatter - immediate
    const duration = 200 + Math.random() * 150;

    // Animate tile flying away immediately
    translateX.value = withTiming(
      dirX * explosionDistance,
      {
        duration,
        easing: Easing.out(Easing.cubic),
      }
    );

    translateY.value = withTiming(
      dirY * explosionDistance,
      {
        duration,
        easing: Easing.out(Easing.cubic),
      }
    );

    rotate.value = withTiming(
      (Math.random() - 0.5) * 1080,
      {
        duration,
        easing: Easing.out(Easing.cubic),
      }
    );

    opacity.value = withTiming(0, {
      duration,
      easing: Easing.out(Easing.cubic),
    });
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate.value}deg` },
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
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
});
