/**
 * Generates lightweight typographic SVG covers for the sample content.
 * Run: node scripts/generate-covers.mjs
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const outDir = join(process.cwd(), 'public', 'images', 'covers')
mkdirSync(outDir, { recursive: true })

const PAPER = '#F5F4F0'
const INK = '#181818'
const MUTED = '#737373'
const LINE = '#D8D6D0'
const ACCENT = '#E8FF47'

const covers = [
  { file: 'ledger', index: '01', title: 'Ledger', sub: 'Double-entry, three currencies', motif: 'grid' },
  { file: 'ledger-2', index: '01', title: 'Accounts', sub: 'Rates pinned at entry time', motif: 'rows' },
  { file: 'warung-pos', index: '02', title: 'Warung POS', sub: 'Offline-first, one tap', motif: 'blocks' },
  { file: 'warung-pos-2', index: '02', title: 'Rp 1.240.000', sub: 'End-of-day summary', motif: 'rows' },
  { file: 'kelas', index: '03', title: 'Kelas', sub: 'Five things, not a platform', motif: 'grid' },
  { file: 'rasa', index: '04', title: 'Rasa', sub: '12,000 recipes, one search', motif: 'dots' },
  { file: 'rasa-2', index: '04', title: 'bawang merah', sub: 'connected to everything', motif: 'graph' },
  { file: 'tiny-cron', index: '05', title: '0 9 * * 1-5', sub: 'At 09:00, Monday through Friday', motif: 'rows' },
  { file: 'ambient', index: '06', title: 'Ambient', sub: 'It rains in the tab', motif: 'circle' },
  { file: 'peta-banjir', index: '07', title: 'Peta Banjir', sub: 'January 2020', motif: 'dots' },
  { file: 'note-offline', index: '—', title: 'Offline', sub: 'A product decision', motif: 'blocks' },
  { file: 'note-pos', index: '—', title: 'Field notes', sub: 'From a plastic stool', motif: 'rows' },
]

const W = 1600
const H = 1000

function motif(kind) {
  switch (kind) {
    case 'grid': {
      let s = ''
      for (let x = 0; x <= W; x += 100) s += `<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="${LINE}" stroke-width="1"/>`
      for (let y = 0; y <= H; y += 100) s += `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="${LINE}" stroke-width="1"/>`
      return s
    }
    case 'rows': {
      let s = ''
      for (let y = 140; y < H - 100; y += 56) {
        const w = 300 + ((y * 37) % 900)
        s += `<rect x="1000" y="${y}" width="${Math.min(w, 520)}" height="10" fill="${LINE}"/>`
      }
      return s
    }
    case 'blocks': {
      let s = ''
      for (let i = 0; i < 6; i++) {
        const x = 960 + (i % 3) * 200
        const y = 160 + Math.floor(i / 3) * 200
        s += `<rect x="${x}" y="${y}" width="160" height="160" fill="none" stroke="${INK}" stroke-width="2"/>`
      }
      s += `<rect x="1160" y="360" width="160" height="160" fill="${ACCENT}"/>`
      return s
    }
    case 'dots': {
      let s = ''
      for (let x = 100; x < W; x += 60) for (let y = 100; y < H; y += 60) s += `<circle cx="${x}" cy="${y}" r="2" fill="${LINE}"/>`
      s += `<circle cx="1180" cy="400" r="120" fill="none" stroke="${INK}" stroke-width="2"/>`
      s += `<circle cx="1180" cy="400" r="8" fill="${ACCENT}" stroke="${INK}" stroke-width="2"/>`
      return s
    }
    case 'graph': {
      const nodes = [
        [1180, 400],
        [980, 260],
        [1380, 300],
        [1040, 560],
        [1340, 600],
        [1240, 180],
      ]
      let s = ''
      for (let i = 1; i < nodes.length; i++) s += `<line x1="${nodes[0][0]}" y1="${nodes[0][1]}" x2="${nodes[i][0]}" y2="${nodes[i][1]}" stroke="${INK}" stroke-width="1.5"/>`
      for (const [x, y] of nodes) s += `<circle cx="${x}" cy="${y}" r="10" fill="${PAPER}" stroke="${INK}" stroke-width="2"/>`
      s += `<circle cx="1180" cy="400" r="16" fill="${ACCENT}" stroke="${INK}" stroke-width="2"/>`
      return s
    }
    case 'circle':
      return `<circle cx="1180" cy="440" r="220" fill="none" stroke="${INK}" stroke-width="2"/><circle cx="1180" cy="440" r="150" fill="none" stroke="${LINE}" stroke-width="2"/><circle cx="1180" cy="440" r="60" fill="${ACCENT}"/>`
    default:
      return ''
  }
}

for (const c of covers) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${PAPER}"/>
  ${motif(c.motif)}
  <text x="100" y="140" font-family="Inter, Helvetica, Arial, sans-serif" font-size="22" letter-spacing="4" fill="${MUTED}">${c.index} — ${c.file.toUpperCase()}</text>
  <text x="100" y="560" font-family="'Instrument Serif', Georgia, 'Times New Roman', serif" font-size="150" fill="${INK}">${c.title}</text>
  <text x="100" y="640" font-family="Inter, Helvetica, Arial, sans-serif" font-size="30" fill="${MUTED}">${c.sub}</text>
  <line x1="100" y1="${H - 100}" x2="${W - 100}" y2="${H - 100}" stroke="${INK}" stroke-width="1.5"/>
  <text x="100" y="${H - 60}" font-family="Inter, Helvetica, Arial, sans-serif" font-size="20" letter-spacing="3" fill="${MUTED}">FAJAR.CODES</text>
  <text x="${W - 100}" y="${H - 60}" text-anchor="end" font-family="Inter, Helvetica, Arial, sans-serif" font-size="20" letter-spacing="3" fill="${MUTED}">JAKARTA, INDONESIA</text>
</svg>
`
  writeFileSync(join(outDir, `${c.file}.svg`), svg)
}

// Avatar placeholder
const avatar = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000" viewBox="0 0 800 1000">
  <rect width="800" height="1000" fill="#EEEDE8"/>
  <circle cx="400" cy="380" r="150" fill="none" stroke="${INK}" stroke-width="2"/>
  <path d="M130 900 C130 690 670 690 670 900" fill="none" stroke="${INK}" stroke-width="2"/>
  <circle cx="400" cy="380" r="14" fill="${ACCENT}" stroke="${INK}" stroke-width="2"/>
  <text x="60" y="960" font-family="Inter, Helvetica, Arial, sans-serif" font-size="18" letter-spacing="4" fill="${MUTED}">PORTRAIT — PLACEHOLDER</text>
</svg>
`
writeFileSync(join(process.cwd(), 'public', 'images', 'avatar.svg'), avatar)

// Open Graph fallback (SVG; replace with a PNG for best platform support)
const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${PAPER}"/>
  <text x="80" y="110" font-family="Inter, Helvetica, Arial, sans-serif" font-size="20" letter-spacing="4" fill="${MUTED}">01 — INDEX</text>
  <text x="80" y="300" font-family="'Instrument Serif', Georgia, serif" font-size="92" fill="${INK}">Fajar builds useful</text>
  <text x="80" y="400" font-family="'Instrument Serif', Georgia, serif" font-size="92" fill="${INK}">things for the web.</text>
  <circle cx="1060" cy="110" r="22" fill="${ACCENT}"/>
  <line x1="80" y1="530" x2="1120" y2="530" stroke="${INK}" stroke-width="1.5"/>
  <text x="80" y="575" font-family="Inter, Helvetica, Arial, sans-serif" font-size="20" letter-spacing="3" fill="${MUTED}">FAJAR.CODES</text>
  <text x="1120" y="575" text-anchor="end" font-family="Inter, Helvetica, Arial, sans-serif" font-size="20" letter-spacing="3" fill="${MUTED}">JAKARTA, INDONESIA</text>
</svg>
`
writeFileSync(join(process.cwd(), 'public', 'og.svg'), og)

// Gallery placeholders — abstract, monochrome, varied aspect ratios
const galleryDir = join(process.cwd(), 'public', 'images', 'gallery')
mkdirSync(galleryDir, { recursive: true })
const photos = [
  { file: '01', w: 1200, h: 1600, label: 'Kopi pagi', draw: (w, h) => `<circle cx="${w * 0.5}" cy="${h * 0.42}" r="${w * 0.28}" fill="none" stroke="${INK}" stroke-width="3"/><circle cx="${w * 0.5}" cy="${h * 0.42}" r="${w * 0.18}" fill="${ACCENT}"/>` },
  { file: '02', w: 1600, h: 1000, label: 'Sudirman, hujan', draw: (w, h) => Array.from({ length: 40 }, (_, i) => `<line x1="${(i * 41) % w}" y1="0" x2="${((i * 41) % w) - 80}" y2="${h}" stroke="${LINE}" stroke-width="2"/>`).join('') + `<rect x="${w * 0.1}" y="${h * 0.7}" width="${w * 0.8}" height="4" fill="${INK}"/>` },
  { file: '03', w: 1200, h: 1200, label: 'Gerobak, 06:00', draw: (w, h) => `<rect x="${w * 0.2}" y="${h * 0.35}" width="${w * 0.6}" height="${h * 0.35}" fill="none" stroke="${INK}" stroke-width="3"/><circle cx="${w * 0.35}" cy="${h * 0.76}" r="${w * 0.05}" fill="${INK}"/><circle cx="${w * 0.65}" cy="${h * 0.76}" r="${w * 0.05}" fill="${INK}"/><rect x="${w * 0.2}" y="${h * 0.3}" width="${w * 0.6}" height="${h * 0.05}" fill="${ACCENT}"/>` },
  { file: '04', w: 1600, h: 1100, label: 'Peron 2', draw: (w, h) => Array.from({ length: 12 }, (_, i) => `<line x1="0" y1="${h * 0.5 + i * 40}" x2="${w}" y2="${h * 0.5 + i * 40}" stroke="${LINE}" stroke-width="2"/>`).join('') + `<line x1="0" y1="${h * 0.5}" x2="${w}" y2="${h * 0.5}" stroke="${INK}" stroke-width="3"/><circle cx="${w * 0.78}" cy="${h * 0.25}" r="${w * 0.04}" fill="${ACCENT}"/>` },
  { file: '05', w: 1200, h: 1500, label: 'Meja, 01:00', draw: (w, h) => `<rect x="${w * 0.15}" y="${h * 0.2}" width="${w * 0.7}" height="${h * 0.45}" fill="${PAPER}" stroke="${INK}" stroke-width="3"/><rect x="${w * 0.2}" y="${h * 0.26}" width="${w * 0.3}" height="10" fill="${LINE}"/><rect x="${w * 0.2}" y="${h * 0.3}" width="${w * 0.5}" height="10" fill="${LINE}"/><rect x="${w * 0.2}" y="${h * 0.34}" width="${w * 0.4}" height="10" fill="${ACCENT}"/>` },
  { file: '06', w: 1600, h: 1000, label: 'Kelas, hari pertama', draw: (w, h) => Array.from({ length: 14 }, (_, i) => `<rect x="${w * 0.1 + (i % 7) * (w * 0.12)}" y="${h * 0.35 + Math.floor(i / 7) * (h * 0.25)}" width="${w * 0.08}" height="${h * 0.15}" fill="none" stroke="${INK}" stroke-width="2"/>`).join('') + `<rect x="${w * 0.1}" y="${h * 0.15}" width="${w * 0.8}" height="6" fill="${INK}"/>` },
]
for (const p of photos) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${p.w}" height="${p.h}" viewBox="0 0 ${p.w} ${p.h}">
  <rect width="${p.w}" height="${p.h}" fill="#EEEDE8"/>
  ${p.draw(p.w, p.h)}
  <text x="60" y="${p.h - 60}" font-family="Inter, Helvetica, Arial, sans-serif" font-size="22" letter-spacing="4" fill="${MUTED}">${p.label.toUpperCase()} — PLACEHOLDER</text>
</svg>
`
  writeFileSync(join(galleryDir, `${p.file}.svg`), svg)
}

console.log(`Generated ${covers.length} covers, ${photos.length} gallery placeholders, avatar and og image.`)
