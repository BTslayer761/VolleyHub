import React from 'react';
import { View, StyleSheet } from 'react-native';

type Props = {
  size: number;
};

export function Volleyball({ size }: Props) {
  const radius = size / 2;
  const lineWidth = Math.max(3, size / 35);
  const center = size / 2;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Outer shadow for depth */}
      <View
        style={[
          styles.outerShadow,
          {
            width: size * 1.2,
            height: size * 1.2,
            borderRadius: radius * 1.2,
          },
        ]}
      />
      
      {/* Main volleyball sphere with 3D effect */}
      <View
        style={[
          styles.sphere,
          {
            width: size,
            height: size,
            borderRadius: radius,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: size * 0.2 },
            shadowOpacity: 0.6,
            shadowRadius: size * 0.3,
            elevation: 15,
          },
        ]}>
        {/* Radial gradient effect using multiple overlays */}
        {/* Top highlight (light source from top-left) */}
        <View
          style={[
            styles.highlightTop,
            {
              width: size * 0.6,
              height: size * 0.6,
              borderRadius: size * 0.3,
              top: size * 0.1,
              left: size * 0.1,
            },
          ]}
        />
        
        {/* Bottom shadow (darker area) */}
        <View
          style={[
            styles.shadowBottom,
            {
              width: size * 0.7,
              height: size * 0.7,
              borderRadius: size * 0.35,
              bottom: size * 0.1,
              right: size * 0.1,
            },
          ]}
        />
        
        {/* Yellow background circle */}
        <View
          style={[
            styles.backgroundCircle,
            {
              width: size,
              height: size,
              borderRadius: radius,
              backgroundColor: '#FFD700',
              borderWidth: lineWidth * 1.5,
              borderColor: '#0066CC',
            },
          ]}>
          {/* Main vertical curve (left side) */}
          <View
            style={[
              styles.arc,
              {
                width: size * 0.5,
                height: size,
                borderLeftWidth: lineWidth,
                borderLeftColor: '#0066CC',
                borderRadius: size * 0.25,
                left: size * 0.15,
                top: 0,
              },
            ]}
          />
          {/* Main vertical curve (right side) */}
          <View
            style={[
              styles.arc,
              {
                width: size * 0.5,
                height: size,
                borderRightWidth: lineWidth,
                borderRightColor: '#0066CC',
                borderRadius: size * 0.25,
                right: size * 0.15,
                top: 0,
              },
            ]}
          />
          {/* Horizontal curve (top) */}
          <View
            style={[
              styles.arc,
              {
                width: size,
                height: size * 0.5,
                borderTopWidth: lineWidth,
                borderTopColor: '#0066CC',
                borderRadius: size * 0.25,
                top: size * 0.15,
                left: 0,
              },
            ]}
          />
          {/* Horizontal curve (bottom) */}
          <View
            style={[
              styles.arc,
              {
                width: size,
                height: size * 0.5,
                borderBottomWidth: lineWidth,
                borderBottomColor: '#0066CC',
                borderRadius: size * 0.25,
                bottom: size * 0.15,
                left: 0,
              },
            ]}
          />
          {/* Diagonal lines for more detail */}
          <View
            style={[
              styles.diagonal,
              {
                width: size * 0.85,
                height: lineWidth,
                backgroundColor: '#0066CC',
                top: center,
                left: center - (size * 0.85) / 2,
                transform: [{ rotate: '45deg' }],
              },
            ]}
          />
          <View
            style={[
              styles.diagonal,
              {
                width: size * 0.85,
                height: lineWidth,
                backgroundColor: '#0066CC',
                top: center,
                left: center - (size * 0.85) / 2,
                transform: [{ rotate: '-45deg' }],
              },
            ]}
          />
        </View>
        
        {/* Bright highlight spot */}
        <View
          style={[
            styles.brightHighlight,
            {
              width: size * 0.25,
              height: size * 0.25,
              borderRadius: size * 0.125,
              top: size * 0.2,
              left: size * 0.2,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  outerShadow: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.7,
    shadowRadius: 15,
    elevation: 12,
  },
  sphere: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#FFD700',
  },
  highlightTop: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#fff',
    shadowOffset: { width: -3, height: -3 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  shadowBottom: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  backgroundCircle: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  arc: {
    position: 'absolute',
  },
  diagonal: {
    position: 'absolute',
  },
  brightHighlight: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    shadowColor: '#fff',
    shadowOffset: { width: -2, height: -2 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
});
