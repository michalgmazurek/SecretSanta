#!/usr/bin/env node
// Strojenie czapki na „L” w tytule + publikacja na GitHub Pages.
//
//   npm run hat -- x=+10 y=-5 r=+3 s=+8     zmiana o tyle (znak wymagany)
//   npm run hat -- x:-30 r:0                ustawienie na dokładną wartość
//   npm run hat -- --no-deploy x=+2         tylko zmiana pliku, bez publikacji
//   npm run hat                             pokaż bieżące wartości
//
// Kierunki: x+ = w prawo, x- = w lewo, y+ = w dół, y- = w górę,
// r+ = obrót zgodnie z ruchem wskazówek zegara (w prawo), r- = przeciwnie, s = szerokość w px.
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const file = join(root, 'hat.json');
const KEYS = { x: 'x', y: 'y', r: 'rotate', s: 'size' };
const URL = 'https://michalgmazurek.github.io/SecretSanta/';

const hat = JSON.parse(readFileSync(file, 'utf8'));
const args = process.argv.slice(2);
const deploy = !args.includes('--no-deploy');
const before = { ...hat };

for (const a of args.filter((x) => !x.startsWith('--'))) {
  const rel = a.match(/^([xyrs])=([+-]\d+(?:\.\d+)?)$/);
  const abs = a.match(/^([xyrs]):(-?\d+(?:\.\d+)?)$/);
  if (!rel && !abs) {
    console.error(`Nie rozumiem: ${a}  (zmiana: x=+10 y=-5 r=+3 s=+8, wartość: x:-30 r:0)`);
    process.exit(1);
  }
  const [, k, num] = rel || abs;
  hat[KEYS[k]] = rel ? hat[KEYS[k]] + Number(num) : Number(num);
}

const show = (o) => `x=${o.x} y=${o.y} rotate=${o.rotate}° size=${o.size}px`;
if (JSON.stringify(before) === JSON.stringify(hat)) {
  console.log(`czapka: ${show(hat)}`);
  if (!args.length) process.exit(0);
}
writeFileSync(file, `${JSON.stringify(hat, null, 2)}\n`);
console.log(`było:   ${show(before)}\njest:   ${show(hat)}`);
if (!deploy) process.exit(0);

execSync('npm run deploy --silent', { cwd: root, stdio: ['ignore', 'ignore', 'inherit'] });
const bundle = readdirSync(join(root, 'dist/_expo/static/js/web'))[0];
for (let i = 0; i < 30; i++) {
  const html = await fetch(URL, { cache: 'no-store' }).then((r) => r.text()).catch(() => '');
  if (html.includes(bundle)) {
    console.log(`online: ${URL}`);
    process.exit(0);
  }
  await new Promise((r) => setTimeout(r, 5000));
}
console.log('opublikowane, ale GitHub Pages jeszcze nie podał nowej wersji (spróbuj za chwilę)');
