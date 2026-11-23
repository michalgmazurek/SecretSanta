import { useEffect, useState } from 'react';
import {
  Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View, useColorScheme,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'losowanie-v1';
const EMPTY = { names: [], pairs: null, seen: [] };

const light = { bg: '#E9EEF2', card: '#FFFFFF', ink: '#1B2A3A', muted: '#5C6B7A', accent: '#C8102E', line: '#CFD8E0' };
const dark = { bg: '#141C24', card: '#1E2A35', ink: '#E7EDF2', muted: '#9AA8B5', accent: '#FF5A6E', line: '#2E3D4B' };

// Tasowanie + cykl: ka?dy daje nast?pnej osobie, wi?c nikt nie trafi na siebie.
function draw(names) {
  const a = [...names];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  const pairs = {};
  a.forEach((n, i) => { pairs[n] = a[(i + 1) % a.length]; });
  return pairs;
}

function Main() {
  const c = useColorScheme() === 'dark' ? dark : light;
  const st = styles(c);
  const [s, setS] = useState(EMPTY);
  const [loaded, setLoaded] = useState(false);
  const [input, setInput] = useState('');
  const [err, setErr] = useState('');
  const [showing, setShowing] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((r) => { if (r) setS(JSON.parse(r)); })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const update = (next) => {
    setS(next);
    AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
  };

  const add = () => {
    const v = input.trim();
    setErr('');
    if (!v) return;
    if (s.names.some((n) => n.toLowerCase() === v.toLowerCase())) {
      setErr('To imi? ju? jest na li?cie.');
      return;
    }
    update({ ...s, names: [...s.names, v] });
    setInput('');
  };

  const open = (n) => {
    const reveal = () => {
      setShowing(n);
      if (!s.seen.includes(n)) update({ ...s, seen: [...s.seen, n] });
    };
    if (s.seen.includes(n)) {
      Alert.alert('Ju? sprawdzone', `${n} ju? widzia?(a) wynik. Pokaza? jeszcze raz?`, [
        { text: 'Anuluj', style: 'cancel' },
        { text: 'Poka?', onPress: reveal },
      ]);
    } else reveal();
  };

  const reset = () => Alert.alert('Zacz?? od nowa?', 'Usunie imiona i wynik losowania.', [
    { text: 'Anuluj', style: 'cancel' },
    { text: 'Usu?', style: 'destructive', onPress: () => { setShowing(null); update(EMPTY); } },
  ]);

  if (!loaded) return <View style={st.screen} />;

  return (
    <SafeAreaView style={st.screen}>
      <StatusBar style={c === dark ? 'light' : 'dark'} />
      <View style={st.wrap}>
        <Text style={st.h1}>Losowanie prezentów</Text>

        {showing ? (
          <View style={st.reveal}>
            <Text style={st.text}>{showing},</Text>
            <Text style={st.text}>kupujesz prezent dla:</Text>
            <Text style={st.who}>{s.pairs[showing]}</Text>
            <Pressable style={st.btn} onPress={() => setShowing(null)}>
              <Text style={st.btnText}>Zapami?tane, ukryj</Text>
            </Pressable>
          </View>
        ) : s.pairs ? (
          <>
            <Text style={st.sub}>Podaj telefon kolejnej osobie. Stuknij swoje imi?.</Text>
            <FlatList
              data={s.names}
              keyExtractor={(n) => n}
              renderItem={({ item }) => {
                const seen = s.seen.includes(item);
                return (
                  <Pressable style={st.item} onPress={() => open(item)}>
                    <Text style={[st.text, seen && st.muted]}>{item}</Text>
                    {seen && <Text style={st.muted}>? sprawdzone</Text>}
                  </Pressable>
                );
              }}
            />
          </>
        ) : (
          <>
            <Text style={st.sub}>Wpisz imiona. Nikt nie wylosuje siebie.</Text>
            <View style={st.row}>
              <TextInput
                style={st.input}
                value={input}
                onChangeText={setInput}
                onSubmitEditing={add}
                placeholder="Imi?"
                placeholderTextColor={c.muted}
                returnKeyType="done"
                blurOnSubmit={false}
              />
              <Pressable style={st.btn} onPress={add}><Text style={st.btnText}>Dodaj</Text></Pressable>
            </View>
            <Text style={st.err}>{err}</Text>
            <FlatList
              data={s.names}
              keyExtractor={(n) => n}
              renderItem={({ item, index }) => (
                <View style={st.item}>
                  <Text style={st.text}>{item}</Text>
                  <Pressable
                    hitSlop={12}
                    accessibilityLabel={`Usu? ${item}`}
                    onPress={() => update({ ...s, names: s.names.filter((_, i) => i !== index) })}
                  >
                    <Text style={[st.muted, { fontSize: 22 }]}>×</Text>
                  </Pressable>
                </View>
              )}
            />
            <Pressable
              style={[st.btn, st.big, s.names.length < 2 && { opacity: 0.4 }]}
              disabled={s.names.length < 2}
              onPress={() => update({ ...s, pairs: draw(s.names), seen: [] })}
            >
              <Text style={[st.btnText, { fontSize: 18 }]}>Losuj</Text>
            </Pressable>
          </>
        )}

        <Pressable style={st.ghost} onPress={reset}>
          <Text style={st.muted}>Zacznij od nowa</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return <SafeAreaProvider><Main /></SafeAreaProvider>;
}

const styles = (c) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.bg },
  wrap: { flex: 1, padding: 18, width: '100%', maxWidth: 480, alignSelf: 'center' },
  h1: { fontSize: 32, fontWeight: '800', color: c.ink, marginBottom: 6, letterSpacing: -0.5 },
  sub: { color: c.muted, fontSize: 16, marginBottom: 18 },
  text: { color: c.ink, fontSize: 17 },
  muted: { color: c.muted, fontSize: 15 },
  row: { flexDirection: 'row', gap: 8 },
  input: {
    flex: 1, borderWidth: 2, borderColor: c.line, borderRadius: 10, paddingHorizontal: 14,
    paddingVertical: 12, fontSize: 17, color: c.ink, backgroundColor: c.card,
  },
  btn: { backgroundColor: c.accent, borderRadius: 10, paddingVertical: 12, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  big: { paddingVertical: 16, marginTop: 8 },
  err: { color: c.accent, minHeight: 22, marginTop: 6 },
  item: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: c.card, borderRadius: 10, paddingVertical: 14, paddingHorizontal: 14, marginBottom: 6,
  },
  reveal: { backgroundColor: c.card, borderRadius: 16, padding: 28, alignItems: 'center', marginTop: 12 },
  who: { fontSize: 40, fontWeight: '800', color: c.accent, marginVertical: 16, textAlign: 'center' },
  ghost: { alignSelf: 'center', marginTop: 20, paddingVertical: 10, paddingHorizontal: 16, borderWidth: 2, borderColor: c.line, borderRadius: 10 },
});
