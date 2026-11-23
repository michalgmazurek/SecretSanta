# Losowanie prezentów

Prosta aplikacja mobilna (Expo / React Native) do losowania, kto komu kupuje prezent.
Wpisujesz imiona, losujesz, a potem ka?dy po kolei stuka swoje imi? i widzi swoj? osob?.
Nikt nie wylosuje siebie. Dane zostaj? w pami?ci telefonu (AsyncStorage).

## Uruchomienie

```bash
npm install
npx expo install --fix   # dopasowuje wersje paczek do Expo SDK
npx expo start
```

Zeskanuj kod QR aplikacj? **Expo Go** (Android / iOS).

## Build do sklepów

```bash
npm i -g eas-cli
eas build -p android   # albo: -p ios
```

Przed publikacj? zmie? `bundleIdentifier` i `package` w `app.json`.
