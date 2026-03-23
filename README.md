# Adventure Readers

A free early literacy app that helps children (ages 4-5) learn to read — from letter sounds all the way to reading sentences.

## What is this?

Adventure Readers is a structured, pedagogically aligned reading program that teaches phonics step by step. Built by a former 1st grade teacher who taught in Boston & Oakland.

Your child will learn:
- **Letter sounds** — all consonants and short vowels
- **Blending** — putting sounds together to read words (c-a-t = cat)
- **Digraphs** — two letters that make one sound (sh, ch, th)
- **Glued sounds** — letter combinations that stick together (an, am, ang, ink)
- **Sight words** — common words that don't follow the rules (the, is, was)
- **Sentence reading** — putting it all together to read real sentences

The program has 10 units that build on each other, with activities at every step to practice what your child is learning.

## What makes it special?

**Phonetically correct sequencing & recordings.** The curriculum is carefully structured to prevent common mistakes that parents and free apps often miss. For example, "ang" in *fang* and "an" in *can* are glued sounds — these sounds can be tricky when a child attempts to read them separately by individual letter-sound. The app handles this correctly throughout, so your child learns the right way from the start.

**Customizable Voice Recordings.** A parent or teacher can record a custom celebratory message to each child! The app comes with pre-recordings for sounds and words from the program, but you can choose to re-record these in your own voice if you'd like.

**Step-by-step scaffolding.** Every blending activity uses an "I Do, We Do, You Do" approach — the app models first, then practices together, then lets the child try independently.

**Fun themes.** Choose from Space Explorer, Ocean Diver, or Nature Ranger. Each theme changes the colors, emojis, and feel of the entire app.

**Multiple children.** Each child gets their own profile with progress tracking. Great for families with siblings or classrooms.

**Decodable reader tips.** After each unit's sentence practice, parents get a tip about what level of books to try at home.

## Try it

Visit the live app: **[adventure-readers.vercel.app](https://adventure-readers.vercel.app/)**

1. Tap **+ Add New Explorer**
2. Pick a theme
3. Enter your child's name
4. Head to the Command Station to record sounds and words
5. Start with Unit 1!

## Want your own copy?

Anyone can create their own version of this app — for free. Your copy runs on its own separate website, so your recordings and data are completely private.

**You'll need:**
- A free [GitHub](https://github.com) account
- A free [Vercel](https://vercel.com) account

**Steps:**
1. Click the **Fork** button at the top of this page — this creates your own copy of the code
2. Go to [vercel.com](https://vercel.com), sign in with GitHub, and import your forked repo
3. Click Deploy — in about a minute, you'll have your own URL
4. Open your URL, create a profile, and start recording!

That's it. No coding required.

## Want to customize it?

If you (or someone you know) is comfortable editing code, you can customize:

- **Themes** — add new color schemes and emojis (`src/data/themes.ts`)
- **Words** — change which blending words are practiced (`src/data/curriculum.ts`)
- **Sentences** — add or modify the practice sentences (`src/data/curriculum.ts`)
- **Sight words** — adjust which words are taught per unit (`src/data/trickWords.ts`)

See [GUIDE.md](GUIDE.md) for detailed customization instructions.

## Curriculum at a glance

| Unit | What your child learns |
|------|----------------------|
| 1 | All letter sounds (a-z) |
| 2 | Blending simple words (cat, sit, map) + first sight words |
| 3 | Digraphs — sh, ch, th, wh, ck |
| 4 | Bonus letters — ff, ll, ss, zz |
| 5 | Glued sounds — am, an |
| 6 | Suffix -s (dog → dogs, sit → sits) |
| 7 | Glued sounds — ng and nk (king, pink, song) |
| 8 | Review — blending practice across all units |
| 9 | Review — sight word speed practice |
| 10 | Sentence reading — putting it all together |

After completing the program, your child will have a strong foundation in early literacy and will be ready to start reading Level A/B/C books independently.

## Example: How I customized this for my son

I wanted a personal version just for my son Liam — no multi-profile setup, just his name, and a **Space Transformers** theme because he loves Transformers. Here's what I did:

1. **Copied the project** into a new folder
2. **Removed the profile picker** — the app goes straight to the home screen with Liam's name hardcoded
3. **Customized the Space theme** — changed the title to "Liam's Space Transformers," swapped in robot and lightning bolt emojis (🤖⚡🦾), and added Transformer-themed streak celebrations like "AUTOBOTS, ROLL OUT!" and "OPTIMUS APPROVES!"
4. **Created a private GitHub repo** so the code isn't visible to anyone else
5. **Deployed to a separate Vercel URL** — completely independent from the public version

The whole thing took about 10 minutes and Liam loves it.

You can do the same — make it dinosaur-themed, princess-themed, superhero-themed, whatever your child is into. The theme system is designed to be easy to modify.

## Need help customizing? Use Claude Code

If you're not a developer, you can use [Claude Code](https://claude.ai/download) to help you customize the app. Claude Code is an AI coding assistant that can read your project and make changes for you.

Here are some things you can ask it to do:

- *"Change the theme to dinosaurs — use dinosaur emojis and rename the units to dinosaur names"*
- *"Remove the multi-profile system and hardcode my daughter's name as Emma"*
- *"Add 3 new sentences to Unit 5 using glued sounds"*
- *"Change the celebration message to say ROAR instead of GREAT JOB"*

Just open your forked project in Claude Code, describe what you want, and it will make the changes. No coding experience needed.

## Privacy

All recordings and progress data are stored **locally in your browser** — nothing is sent to any server. Each person's copy of the app is completely independent.

## Credits

Built with love for early readers everywhere by a former 1st grade teacher who taught in Boston & Oakland.
