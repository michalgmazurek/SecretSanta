import { useEffect, useState } from 'react';
import {
  Alert, FlatList, Platform, Pressable, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SantaHat from './SantaHat';

const KEY = 'losowanie-v1';
const EMPTY = { names: [], pairs: null, seen: [] };

const c = {
  bg: '#000000',
  card: 'rgba(0, 18, 6, 0.88)',
  ink: '#00FF41',
  bright: '#CCFFD8',
  muted: '#1FA34A',
  line: '#0B5D1E',
  red: '#E0262B',
};

const mono = Platform.select({
  web: '"JetBrains Mono", "Courier New", monospace',
  ios: 'Courier',
  default: 'monospace',
});
const term = Platform.select({ web: 'VT323, "Courier New", monospace', ios: 'Courier', default: 'monospace' });
const glow = { textShadowColor: 'rgba(0, 255, 65, 0.75)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10 };

// Alert.alert nie działa w przeglądarce (react-native-web), więc tam używamy window.confirm.
function ask(title, message, okText, onOk, destructive) {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n\n${message}`)) onOk();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Anuluj', style: 'cancel' },
    { text: okText, style: destructive ? 'destructive' : 'default', onPress: onOk },
  ]);
}

// Tasowanie + cykl: każdy daje następnej osobie, więc nikt nie trafi na siebie.
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

function Cursor() {
  const [on, setOn] = useState(true);
  useEffect(() => {
    const t = setInterval(() => setOn((v) => !v), 530);
    return () => clearInterval(t);
  }, []);
  return <Text style={{ opacity: on ? 1 : 0 }}>_</Text>;
}

// Wypisuje tekst znak po znaku, jak terminal.
function Typed({ text, style }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    setN(0);
    const t = setInterval(() => setN((v) => (v >= text.length ? v : v + 1)), 90);
    return () => clearInterval(t);
  }, [text]);
  return <Text style={style}>{text.slice(0, n)}<Cursor /></Text>;
}

function Button({ label, onPress, disabled, big }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed, hovered }) => [
        st.btn, big && st.big,
        (pressed || hovered) && !disabled && st.btnActive,
        disabled && { opacity: 0.35 },
      ]}
    >
      {({ pressed, hovered }) => (
        <Text style={[st.btnText, big && { fontSize: 18 }, (pressed || hovered) && !disabled && { color: '#000' }]}>
          [ {label} ]
        </Text>
      )}
    </Pressable>
  );
}

function Main() {
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
      setErr('ERR: to imię już jest na liście');
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
      ask('Już sprawdzone', `${n} już widział(a) wynik. Pokazać jeszcze raz?`, 'Pokaż', reveal);
    } else reveal();
  };

  const reset = () => ask('Zacząć od nowa?', 'Usunie imiona i wynik losowania.', 'Usuń',
    () => { setShowing(null); update(EMPTY); }, true);

  if (!loaded) return <View style={st.screen} />;

  return (
    <SafeAreaView style={st.screen}>
      <StatusBar style="light" />
      <View style={st.wrap}>
        <View style={st.titleRow}>
          <Text style={st.h1}>Losowanie prezentów<Cursor /></Text>
          <SantaHat />
        </View>

        {showing ? (
          <View style={st.reveal}>
            <Text style={st.sub}>&gt; decrypt --dla {showing}</Text>
            <Text style={st.text}>{showing}, kupujesz prezent dla:</Text>
            <Typed text={s.pairs[showing]} style={st.who} />
            <Button label="Zapamiętane, ukryj" onPress={() => setShowing(null)} />
          </View>
        ) : s.pairs ? (
          <>
            <Text style={st.sub}>&gt; Podaj telefon kolejnej osobie. Stuknij swoje imię.</Text>
            <FlatList
              data={s.names}
              keyExtractor={(n) => n}
              renderItem={({ item }) => {
                const seen = s.seen.includes(item);
                return (
                  <Pressable style={st.item} onPress={() => open(item)}>
                    <Text style={[st.text, seen && st.muted]}>{seen ? '  ' : '> '}{item}</Text>
                    {seen && <Text style={st.muted}>[✓ sprawdzone]</Text>}
                  </Pressable>
                );
              }}
            />
          </>
        ) : (
          <>
            <Text style={st.sub}>&gt; Wpisz imiona. Nikt nie wylosuje siebie.</Text>
            <View style={st.row}>
              <TextInput
                style={st.input}
                value={input}
                onChangeText={setInput}
                onSubmitEditing={add}
                placeholder="imię_"
                placeholderTextColor={c.line}
                returnKeyType="done"
                blurOnSubmit={false}
                autoCapitalize="words"
              />
              <Button label="Dodaj" onPress={add} />
            </View>
            <Text style={st.err}>{err}</Text>
            <FlatList
              data={s.names}
              keyExtractor={(n) => n}
              renderItem={({ item, index }) => (
                <View style={st.item}>
                  <Text style={st.text}>
                    <Text style={st.muted}>{String(index + 1).padStart(2, '0')} </Text>{item}
                  </Text>
                  <Pressable
                    hitSlop={12}
                    accessibilityLabel={`Usuń ${item}`}
                    onPress={() => update({ ...s, names: s.names.filter((_, i) => i !== index) })}
                  >
                    <Text style={[st.muted, { fontSize: 20 }]}>×</Text>
                  </Pressable>
                </View>
              )}
            />
            <Button
              label="Losuj"
              big
              disabled={s.names.length < 2}
              onPress={() => update({ ...s, pairs: draw(s.names), seen: [] })}
            />
          </>
        )}

        <Pressable style={st.ghost} onPress={reset}>
          <Text style={st.muted}>$ rm -rf losowanie</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return <SafeAreaProvider><Main /></SafeAreaProvider>;
}

const st = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Platform.OS === 'web' ? 'transparent' : c.bg },
  wrap: { flex: 1, padding: 18, paddingTop: 48, width: '100%', maxWidth: 480, alignSelf: 'center' },
  titleRow: { position: 'relative', marginBottom: 6 },
  h1: { fontFamily: term, fontSize: 44, lineHeight: 46, color: c.ink, ...glow },
  sub: { fontFamily: mono, color: c.muted, fontSize: 14, marginBottom: 18 },
  text: { fontFamily: mono, color: c.ink, fontSize: 16 },
  muted: { fontFamily: mono, color: c.muted, fontSize: 14 },
  row: { flexDirection: 'row', gap: 8 },
  input: {
    flex: 1, fontFamily: mono, borderWidth: 1, borderColor: c.ink, borderRadius: 4, paddingHorizontal: 12,
    paddingVertical: 12, fontSize: 16, color: c.ink, backgroundColor: c.card, outlineStyle: 'none',
  },
  btn: {
    borderWidth: 1, borderColor: c.ink, backgroundColor: 'rgba(0, 255, 65, 0.08)', borderRadius: 4,
    paddingVertical: 12, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center',
  },
  btnActive: { backgroundColor: c.ink },
  btnText: { fontFamily: mono, color: c.ink, fontWeight: '700', fontSize: 15 },
  big: { paddingVertical: 16, marginTop: 8 },
  err: { fontFamily: mono, color: c.red, minHeight: 22, marginTop: 6, fontSize: 14 },
  item: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: c.card, borderLeftWidth: 2, borderLeftColor: c.ink,
    paddingVertical: 12, paddingHorizontal: 14, marginBottom: 6,
  },
  reveal: {
    backgroundColor: c.card, borderWidth: 1, borderColor: c.ink, borderRadius: 4,
    padding: 24, alignItems: 'center', marginTop: 12,
  },
  who: { fontFamily: term, fontSize: 56, color: c.bright, marginVertical: 18, textAlign: 'center', ...glow },
  ghost: {
    alignSelf: 'center', marginTop: 20, paddingVertical: 8, paddingHorizontal: 14,
    borderWidth: 1, borderColor: c.line, borderRadius: 4, borderStyle: 'dashed',
  },
});

