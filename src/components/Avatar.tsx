// Avatar Component - Shows photo with colored placeholder fallback

import React, { useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { typography } from '../theme';

// Elegant sunset palette
const AVATAR_COLORS = [
  '#D9853B',
  '#C4956C',
  '#9B8FAA',
  '#A67A52',
  '#8E7F76',
  '#B37B58',
  '#E5A05C',
  '#7D6F8E',
];

const getColorForName = (name: string): string => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

interface AvatarProps {
  name: string;
  photo?: string | null;
  size: number;
  color?: string;
}

export default function Avatar({ name, photo, size, color }: AvatarProps) {
  const [failed, setFailed] = useState(false);

  const bgColor = color || getColorForName(name);
  const fontSize = size * 0.42;

  if (photo && !failed) {
    return (
      <Image
        source={{ uri: photo }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bgColor,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text style={{ fontSize, fontWeight: typography.weights.semibold, color: '#FFFFFF' }}>
        {name.charAt(0).toUpperCase()}
      </Text>
    </View>
  );
}
