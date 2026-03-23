export type ThemeId = 'space' | 'ocean' | 'nature';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  appTitle: string;
  subtitle: (name: string) => string;
  bgGradient: string;
  bgBodyColor: string;
  bgParticleColor: string;
  accentColor: string;
  accentGradient: string;
  unitNames: string[];
  unitColors: string[];
  setupLabel: string;
  setupEmoji: string;
  celebrationEmojis: string[];
  streakEmojis: Array<{ emoji: string; bg: string }>;
  goodRatingEmoji: string;
  okRatingEmoji: string;
  tryAgainEmoji: string;
  profileColors: string[];
  launchWord: string;
  explorerWord: string;
  cardGradient: string;
  titleEmojis: [string, string];
  blendingLabel: string;
  blendingEmoji: string;
}

const spaceTheme: ThemeConfig = {
  id: 'space',
  name: 'Space Explorer',
  appTitle: 'Adventure Readers',
  subtitle: (name) => name ? `${name}'s Galaxy of Sounds!` : 'Your reading adventure starts here!',
  bgGradient: 'linear-gradient(180deg, #0a0a2e 0%, #1a1a4e 40%, #0d0d3a 100%)',
  bgBodyColor: '#0a0a2e',
  bgParticleColor: '#ffffff',
  accentColor: '#FFD700',
  accentGradient: 'linear-gradient(135deg, #FFD700, #FF8A00)',
  unitNames: ['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'Galaxy'],
  unitColors: ['#A0522D', '#DEB887', '#4169E1', '#CD5C5C', '#DAA520', '#F4A460', '#87CEEB', '#4682B4', '#BC8F8F', '#9C27B0'],
  setupLabel: 'Mission Control',
  setupEmoji: '🎙️',
  celebrationEmojis: ['⭐', '🌟', '✨', '💫', '🚀', '🌠', '🎆'],
  streakEmojis: [
    { emoji: '🌟', bg: '#FFD700' }, { emoji: '🚀', bg: '#4FC3F7' },
    { emoji: '🪐', bg: '#CE93D8' }, { emoji: '💫', bg: '#FF8A65' },
    { emoji: '🌌', bg: '#81C784' }, { emoji: '☄️', bg: '#FFD54F' },
    { emoji: '🏅', bg: '#4FC3F7' }, { emoji: '⭐', bg: '#FFD700' },
  ],
  goodRatingEmoji: '🚀',
  okRatingEmoji: '🪐',
  tryAgainEmoji: '☄️',
  profileColors: ['#CD7F32', '#B0B0B0', '#4FC3F7', '#81C784', '#CE93D8', '#FF8A65', '#FFD54F', '#4DB6AC'],
  launchWord: 'Launch!',
  explorerWord: 'Explorer',
  cardGradient: 'linear-gradient(135deg, #2a2a5e, #1a1a4e)',
  titleEmojis: ['🚀', '🌟'],
  blendingLabel: 'Blending Launchpad',
  blendingEmoji: '🚀',
};

const oceanTheme: ThemeConfig = {
  id: 'ocean',
  name: 'Ocean Diver',
  appTitle: 'Adventure Readers',
  subtitle: (name) => name ? `${name}'s Ocean of Sounds!` : 'Your reading adventure starts here!',
  bgGradient: 'linear-gradient(180deg, #0a1628 0%, #0d2b45 40%, #1a4a6e 100%)',
  bgBodyColor: '#0a1628',
  bgParticleColor: '#7dd3fc',
  accentColor: '#00BCD4',
  accentGradient: 'linear-gradient(135deg, #00BCD4, #0097A7)',
  unitNames: ['Coral Reef', 'Starfish Cove', 'Dolphin Bay', 'Seahorse Lagoon', 'Turtle Beach', 'Whale Deep', 'Jellyfish Glow', 'Octopus Cave', 'Shark Fin Pass', 'Treasure Trove'],
  unitColors: ['#FF7043', '#FFAB91', '#4FC3F7', '#80DEEA', '#A5D6A7', '#4DD0E1', '#CE93D8', '#EF5350', '#78909C', '#FFD700'],
  setupLabel: 'Dive Station',
  setupEmoji: '🤿',
  celebrationEmojis: ['🐬', '🌊', '🐚', '🦀', '🐠', '🐙', '🦈'],
  streakEmojis: [
    { emoji: '🐬', bg: '#4FC3F7' }, { emoji: '🌊', bg: '#00BCD4' },
    { emoji: '🐚', bg: '#FFAB91' }, { emoji: '🦀', bg: '#FF7043' },
    { emoji: '🐠', bg: '#FFD54F' }, { emoji: '🐙', bg: '#CE93D8' },
    { emoji: '🦈', bg: '#78909C' }, { emoji: '🐳', bg: '#4FC3F7' },
  ],
  goodRatingEmoji: '🐬',
  okRatingEmoji: '🐠',
  tryAgainEmoji: '🦀',
  profileColors: ['#FF7043', '#4FC3F7', '#80DEEA', '#A5D6A7', '#CE93D8', '#FFAB91', '#4DD0E1', '#FFD54F'],
  launchWord: 'Dive in!',
  explorerWord: 'Diver',
  cardGradient: 'linear-gradient(135deg, #0d2b45, #1a4a6e)',
  titleEmojis: ['🌊', '🐬'],
  blendingLabel: 'Blending Deep Dive',
  blendingEmoji: '🤿',
};

const natureTheme: ThemeConfig = {
  id: 'nature',
  name: 'Nature Ranger',
  appTitle: 'Adventure Readers',
  subtitle: (name) => name ? `${name}'s Trail of Sounds!` : 'Your reading adventure starts here!',
  bgGradient: 'linear-gradient(180deg, #0a1a0a 0%, #1a2e1a 40%, #1e3320 100%)',
  bgBodyColor: '#0a1a0a',
  bgParticleColor: '#a5d6a7',
  accentColor: '#8BC34A',
  accentGradient: 'linear-gradient(135deg, #8BC34A, #558B2F)',
  unitNames: ['Sunflower Meadow', 'Butterfly Garden', 'Fox Den', 'Owl Hollow', 'Frog Pond', 'Bear Cave', 'Eagle Peak', 'Rabbit Warren', 'Deer Trail', 'Rainbow Falls'],
  unitColors: ['#FFD54F', '#CE93D8', '#FF8A65', '#8D6E63', '#66BB6A', '#A1887F', '#90CAF9', '#FFCC80', '#C8E6C9', '#E040FB'],
  setupLabel: 'Ranger Base',
  setupEmoji: '🏕️',
  celebrationEmojis: ['🦋', '🌻', '🌈', '🍀', '🐝', '🦊', '🦉'],
  streakEmojis: [
    { emoji: '🦋', bg: '#CE93D8' }, { emoji: '🌻', bg: '#FFD54F' },
    { emoji: '🌈', bg: '#E040FB' }, { emoji: '🍀', bg: '#66BB6A' },
    { emoji: '🐝', bg: '#FFCC80' }, { emoji: '🦊', bg: '#FF8A65' },
    { emoji: '🦉', bg: '#8D6E63' }, { emoji: '🌿', bg: '#81C784' },
  ],
  goodRatingEmoji: '🦋',
  okRatingEmoji: '🌻',
  tryAgainEmoji: '🐛',
  profileColors: ['#FFD54F', '#66BB6A', '#FF8A65', '#CE93D8', '#8D6E63', '#FFCC80', '#90CAF9', '#A5D6A7'],
  launchWord: 'Explore!',
  explorerWord: 'Ranger',
  cardGradient: 'linear-gradient(135deg, #1a2e1a, #2a3e2a)',
  titleEmojis: ['🌿', '🦋'],
  blendingLabel: 'Blending Adventure',
  blendingEmoji: '🏔️',
};

const themes: Record<ThemeId, ThemeConfig> = { space: spaceTheme, ocean: oceanTheme, nature: natureTheme };

export function getTheme(id: ThemeId): ThemeConfig {
  return themes[id] || spaceTheme;
}

export const allThemes = [spaceTheme, oceanTheme, natureTheme];
