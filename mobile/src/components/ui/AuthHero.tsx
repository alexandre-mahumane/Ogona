import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';

const hero = require('../../../assets/login/b12b6a32d4a0aae46fdfcc3c18b2f6785bd0f519.jpg');

export function AuthHero() {
  return (
    <View className="h-[200px] w-full overflow-hidden">
      <Image source={hero} style={StyleSheet.absoluteFill} contentFit="cover" />
      <LinearGradient
        colors={['rgba(39, 31, 20, 0.8)', 'rgba(39, 31, 20, 0)']}
        start={{ x: 0.05, y: 1 }}
        end={{ x: 0.85, y: 0.1 }}
        style={StyleSheet.absoluteFill}
      />
      <View className="flex-1 justify-end px-6 pb-4">
        <Text variant="logo">Ogona</Text>
        <Text variant="label-s" className="mt-1 text-ink-inverse">
          Alojamentos em Moçambique
        </Text>
      </View>
    </View>
  );
}
