# Adventure Readers — Setup & Customization Guide

## What is Adventure Readers?

Adventure Readers is a free, open-source early literacy app designed for children ages 4-5 who are learning to read. It follows a structured, pedagogically aligned phonics scope and sequence, guiding children from individual letter sounds through blending, high-frequency words, and sentence reading. Built by a former 1st grade teacher who taught in Boston & Oakland.

### What makes it different

- **Parent-recorded sounds** — No robotic computer voice. A parent or teacher records every sound, word, and celebration message. The child hears a familiar, trusted voice throughout.
- **Scaffolded progression** — Every blending activity follows an "I Do → We Do → You Do" model, gradually releasing responsibility to the child.
- **Phonetically accurate** — Glued sounds (am, an, ang, ink, etc.) are never broken apart. Digraphs (sh, ch, th, wh) are treated as single sounds. Suffix -s is visually distinguished from the base word.
- **3 fun themes** — Space Explorer, Ocean Diver, or Nature Ranger. Each theme changes colors, emojis, and terminology throughout.
- **Multi-child support** — Multiple children can use the app with separate profiles, PINs, and progress tracking.

### Curriculum overview (10 units)

| Unit | Focus | Key Skills |
|------|-------|------------|
| 1 | Letter Sounds | All 26 consonants + short vowels |
| 2 | Blending CVC Words | at, mat, sat → map, cap → sit, rip |
| 3 | Digraphs | sh, ch, th, wh, ck |
| 4 | Bonus Letters | ff, ll, ss, zz + glued sound "all" |
| 5 | Glued Sounds | am, an |
| 6 | Suffix -s | sits, dogs, maps (base word + suffix visual) |
| 7 | Glued Sounds ng/nk | ang, ing, ong, ung, ank, ink, onk, unk |
| 8 | Blending Review | Random sample of all blending words |
| 9 | Trick Word Snap | Speed practice with all sight words |
| 10 | Sentence Reading | Multi-word sentences mixing all skills |

Each unit (2-7) includes sentence reading practice and a tip for parents about which level of decodable readers to try at home.

---

## Setting Up Your Own Copy

Each person who sets up their own copy gets their **own URL** — your recordings, profiles, and progress are stored locally in your browser and never shared.

### Prerequisites

- A computer with [Node.js](https://nodejs.org/) installed (version 18 or higher)
- A [GitHub](https://github.com) account
- A [Vercel](https://vercel.com) account (free — sign in with GitHub)

### Step 1: Fork the repository

1. Go to the original repo: `https://github.com/ORIGINAL_OWNER/adventure-readers`
2. Click the **Fork** button (top right)
3. This creates your own copy at `https://github.com/YOUR_USERNAME/adventure-readers`

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **Add New → Project**
3. Import your forked `adventure-readers` repo
4. Framework preset: **Vite** (should auto-detect)
5. Click **Deploy**
6. In about 60 seconds, you'll get your own URL like `adventure-readers-yourname.vercel.app`

That's it! Your app is live at your own unique URL.

### Step 3: Set up the app

1. Open your URL in Chrome or Safari on your phone/tablet
2. Tap **+ Add New Explorer**
3. Choose a theme (Space, Ocean, or Nature)
4. Enter your child's name and set a PIN
5. Go to the Command Station (Mission Control / Dive Station / Ranger Base)
6. **Record the celebration message** — "Great job, [name]!"
7. Optionally re-record any letter sounds or words (the curriculum sounds are pre-built, but you can personalize them)
8. Record blending words, HFW words, and sentence words as prompted

---

## Customization

### Changing themes

The three built-in themes are defined in `src/data/themes.ts`. Each theme controls:
- Colors (background, accents, card gradients)
- Emojis (celebrations, unit icons, rating buttons)
- Labels (Mission Control vs Dive Station vs Ranger Base)

To add a new theme, copy an existing theme object and modify the values.

### Modifying the curriculum

#### Sound cards (`src/data/soundCards.ts`)
Each sound card has:
- `grapheme` — what's displayed (e.g., "Bb", "sh", "ang")
- `phoneme` — IPA notation (e.g., "/b/", "/ʃ/")
- `keyword` — the example word (e.g., "bat", "ship", "fang")
- `emoji` — visual cue
- `type` — consonant, short_vowel, digraph, glued_sound, bonus_letter, or suffix

#### Blending words (`src/data/curriculum.ts`)
Each word has a `sounds` array that breaks the word into its phonetic components:
```typescript
{ word: 'ship', sounds: ['sh', 'i', 'p'], unit: 'K-U3' }
{ word: 'sits', sounds: ['s', 'i', 't', '-s'], unit: 'K-U6', suffix: 1 }
```

**Important rules:**
- Digraphs are single sounds: `'sh'`, `'ch'`, `'th'`, `'wh'`, `'ck'`
- Glued sounds stay together: `'an'`, `'am'`, `'ang'`, `'ink'`, etc.
- Suffix sounds use a `-` prefix: `'-s'` (plays the suffix recording, displays as `s`)
- The `suffix` property indicates how many trailing sounds form the suffix

#### Trick words / HFW (`src/data/trickWords.ts`)
- `phonetic: true` — phonetically regular high-frequency words (can be sounded out)
- `phonetic: false` — true trick/sight words (must be memorized)

#### Sentences (`src/data/curriculum.ts`)
Each sentence word is tagged:
```typescript
{ text: 'The', type: 'trick' }                    // sight word — shown in gold
{ text: 'dog', type: 'phonetic', sounds: ['d', 'o', 'g'] }  // dots under each sound
{ text: 'sits.', type: 'suffix', sounds: ['s', 'i', 't', '-s'], suffix: 1 }  // underline + circle
```

### About the recordings

The app stores all audio recordings in your browser's IndexedDB (not on any server). This means:
- Recordings are **private** — only on your device
- Recordings are **persistent** — they survive page refreshes
- Recordings are **per-browser** — if you switch browsers, you'll need to re-record
- Storage limit is hundreds of MB — plenty for all sounds and words

If you clear your browser data, recordings will be lost. Consider this a feature — it keeps everything local and private.

### For classrooms

If you're a teacher using this with multiple students:
- Each student gets their own profile with a PIN
- Progress is tracked per student
- The parent dashboard shows mastery data per unit
- You can record sounds once — all profiles share the same sound recordings
- The celebration message ("Great job, [name]!") is recorded per child

---

## Technical details

- Built with **React + TypeScript + Vite**
- No backend, no database, no authentication — everything runs in the browser
- Audio recorded via Web Audio API / MediaRecorder
- Stored in IndexedDB (migrated from localStorage for larger capacity)
- Deployed as a static site (Vercel, Netlify, or any static host)

### Local development

```bash
git clone https://github.com/YOUR_USERNAME/adventure-readers.git
cd adventure-readers
npm install
npm run dev
```

Open `http://localhost:5173` in your browser. The preview browser in code editors won't support microphone access — use your actual browser.

### Building for production

```bash
npm run build
```

The output goes to `dist/` — deploy this folder to any static hosting service.

---

## Credits

Built with love for early readers everywhere by a former 1st grade teacher who taught in Boston & Oakland.

If you find this helpful, share it with other parents and teachers!
