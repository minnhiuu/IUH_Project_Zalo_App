import React from 'react'
import { View, Text, StyleSheet, Dimensions } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import Svg, { Circle, Line, G } from 'react-native-svg'

const { width, height } = Dimensions.get('window')

// Network dots decoration component
const NetworkDecoration = () => {
  const dots = [
    { x: 50, y: height - 200, r: 4 },
    { x: 80, y: height - 180, r: 3 },
    { x: 120, y: height - 220, r: 5 },
    { x: 150, y: height - 160, r: 4 },
    { x: 200, y: height - 190, r: 3 },
    { x: 250, y: height - 150, r: 5 },
    { x: 280, y: height - 180, r: 4 },
    { x: 320, y: height - 200, r: 3 },
    { x: 350, y: height - 160, r: 4 },
    { x: width - 50, y: height - 170, r: 5 },
    { x: width - 80, y: height - 190, r: 3 },
    { x: width - 120, y: height - 150, r: 4 }
  ]

  const lines = [
    { x1: 50, y1: height - 200, x2: 80, y2: height - 180 },
    { x1: 80, y1: height - 180, x2: 120, y2: height - 220 },
    { x1: 120, y1: height - 220, x2: 150, y2: height - 160 },
    { x1: 150, y1: height - 160, x2: 200, y2: height - 190 },
    { x1: 200, y1: height - 190, x2: 250, y2: height - 150 },
    { x1: 250, y1: height - 150, x2: 280, y2: height - 180 },
    { x1: 280, y1: height - 180, x2: 320, y2: height - 200 },
    { x1: 320, y1: height - 200, x2: 350, y2: height - 160 },
    { x1: 350, y1: height - 160, x2: width - 120, y2: height - 150 },
    { x1: width - 120, y1: height - 150, x2: width - 80, y2: height - 190 },
    { x1: width - 80, y1: height - 190, x2: width - 50, y2: height - 170 }
  ]

  return (
    <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
      <G>
        {/* Lines */}
        {lines.map((line, index) => (
          <Line
            key={`line-${index}`}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke='rgba(255,255,255,0.3)'
            strokeWidth={1}
          />
        ))}
        {/* Dots */}
        {dots.map((dot, index) => (
          <Circle key={`dot-${index}`} cx={dot.x} cy={dot.y} r={dot.r} fill='rgba(255,255,255,0.6)' />
        ))}
      </G>
    </Svg>
  )
}

export const WelcomeScreen = () => {
  return (
    <LinearGradient
      colors={['#0099FF', '#0088EE', '#0077DD']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      {/* Background pattern - faded chat bubbles */}
      <View style={styles.backgroundPattern}>
        {[...Array(8)].map((_, i) => (
          <View key={i} style={[styles.fadedBubble, { top: 80 + i * 90 }]}>
            <View style={styles.bubbleAvatar} />
            <View style={styles.bubbleContent}>
              <View style={styles.bubbleLine} />
              <View style={[styles.bubbleLine, { width: '70%' }]} />
            </View>
          </View>
        ))}
      </View>

      {/* Network decoration at bottom */}
      <NetworkDecoration />

      {/* Zalo Logo */}
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>Zalo</Text>
      </View>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  backgroundPattern: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.15
  },
  fadedBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20
  },
  bubbleAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
    marginRight: 12
  },
  bubbleContent: {
    flex: 1
  },
  bubbleLine: {
    height: 14,
    backgroundColor: 'white',
    borderRadius: 7,
    marginBottom: 6,
    width: '90%'
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  logoText: {
    fontSize: 72,
    fontWeight: '400',
    color: 'white',
    letterSpacing: 2
  }
})

export default WelcomeScreen
