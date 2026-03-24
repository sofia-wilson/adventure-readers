# Adventure Readers

A free early literacy app that helps children (ages 4-5) learn to read — from letter sounds all the way to reading sentences.

Built by a former 1st grade teacher who taught in Boston & Oakland.

## Try it

**[adventure-readers.vercel.app](https://adventure-readers.vercel.app/)**

1. Tap **+ Add New Explorer**
2. Pick a theme (Space, Ocean, or Nature)
3. Enter your child's name and set a PIN
4. Start with Unit 1!

The app comes with pre-recorded sounds and words, so you can start right away. Head to the Command Station to record a personalized celebration message for your child.

## What does it teach?

A structured phonics program across 10 units:

| Unit | What your child learns |
|------|----------------------|
| 1 | All letter sounds (a-z) |
| 2 | Blending simple words (cat, sit, map) + first sight words |
| 3 | Digraphs — sh, ch, th, wh, ck |
| 4 | Bonus letters — ff, ll, ss, zz |
| 5 | Glued sounds — am, an |
| 6 | Suffix -s (dog → dogs, sit → sits) |
| 7 | Glued sounds — ng and nk (king, pink, song) |
| 8-9 | Review — blending & sight word speed practice |
| 10 | Sentence reading — putting it all together |

After completing the program, your child will be ready to start reading Level A/B/C books independently.

## What makes it special?

- **Phonetically correct sequencing.** Glued sounds like "ang" in *fang* and "an" in *can* are taught as single sounds — not broken apart letter by letter. This prevents common mistakes that free apps often miss.
- **I Do → We Do → You Do scaffolding.** Every blending activity models first, practices together, then lets the child try independently.
- **Adaptive practice.** The app tracks which sounds and words your child has mastered. When they return to a unit, it only shows what still needs practice.
- **3 fun themes.** Space Explorer, Ocean Diver, or Nature Ranger — each changes the colors, emojis, and feel of the entire app.
- **Multiple children.** Each child gets their own profile with separate progress tracking. Great for families or classrooms.

## Good to know

- **Progress is saved in your browser.** All recordings and data stay on your device — nothing is sent to any server. Pick one device for your child's practice and stick with it.
- **Switching devices?** Use the Export/Import feature in the Command Station to move data between devices.
- **Each browser is separate.** Safari and Chrome on the same device have independent data.

## Want your own copy?

Anyone can fork this and deploy their own version for free:

1. Click **Fork** at the top of this page
2. Go to [vercel.com](https://vercel.com), sign in with GitHub, and import your fork
3. Click **Deploy** — you'll have your own private URL in about a minute

For customization details (themes, words, sentences), see [GUIDE.md](GUIDE.md).

## Example: How I customized this for my son

I made a **Space Transformers** version for my son Liam — removed multi-profile, hardcoded his name, and added Transformer-themed celebrations. Deployed to a separate private URL. Took about 10 minutes.

You can do the same — dinosaurs, princesses, superheroes, whatever your child loves.

## Need help customizing? Use Claude Code

[Claude Code](https://claude.ai/download) is a free AI coding assistant that can read your project and make changes for you — no coding experience needed.

**How to use it:**

1. Download [Claude Code](https://claude.ai/download) and open it
2. Tell it to open your forked project folder (e.g., *"Open my adventure-readers folder"*)
3. Paste a link to this repo so it understands the project: `https://github.com/sofia-wilson/adventure-readers`
4. Then just describe what you want in plain language — it will find the right files and make the changes

**Example prompts you can try:**

- *"Change the theme to dinosaurs — use dinosaur emojis and rename the units to dinosaur names"* → It will update the theme file with new colors, emojis, and labels
- *"Remove the multi-profile system and hardcode my daughter's name as Emma"* → It will simplify the app to skip the profile picker and go straight to Emma's home screen
- *"Add 3 new practice sentences to Unit 5 using glued sounds"* → It will add sentences to the curriculum file with the correct phonetic breakdowns
- *"Make the celebration sound play a chime instead of applause"* → It will update the audio code

You don't need to know where anything is in the code — just describe what you want and Claude Code will handle the rest.

## Credits

Built with love for early readers everywhere.
