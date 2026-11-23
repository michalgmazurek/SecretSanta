# Losowanie prezentów

Prosta aplikacja mobilna (Expo / React Native) do losowania, kto komu kupuje prezent.
Wpisujesz imiona, losujesz, a potem każdy po kolei stuka swoje imię i widzi swoją osobę.
Nikt nie wylosuje siebie. Dane zostają w pamięci telefonu (AsyncStorage).

## Uruchomienie

```bash
npm install
npx expo install --fix   # dopasowuje wersje paczek do Expo SDK
npx expo start
```

Zeskanuj kod QR aplikacją **Expo Go** (Android / iOS).

## Wersja w przeglądarce (GitHub Pages)

```bash
npm run web      # podgląd lokalny
npm run deploy   # build do dist/ i publikacja na gałąź gh-pages
```

Strona: https://michalgmazurek.github.io/SecretSanta/

Licznik unikatowych wejść: w konsoli przeglądarki na stronie wpisz `await __wejscia`.

## Build do sklepów

```bash
npm i -g eas-cli
eas build -p android   # albo: -p ios
```

Przed publikacją zmień `bundleIdentifier` i `package` w `app.json`.
