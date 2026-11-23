import { Image, StyleSheet } from 'react-native';
import HAT from './hat.json';

// Czapka na „L” w tytule. Obrazek: assets/santa-hat.png (wzór przerobiony na zieleń, odbity).
// Pozycję, obrót i szerokość ustawia hat.json (zmienia je: npm run hat -- x=+10 r=-5 ...).
const SRC = require('./assets/santa-hat.png');
const RATIO = 389 / 360;

export default function SantaHat() {
  return (
    <Image
      source={SRC}
      nativeID="santa-hat"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      resizeMode="contain"
      style={[s.hat, {
        left: HAT.x, top: HAT.y, width: HAT.size, height: HAT.size * RATIO,
        transform: [{ rotate: `${HAT.rotate}deg` }],
      }]}
    />
  );
}

const s = StyleSheet.create({
  hat: { position: 'absolute', zIndex: 2 },
});
