// Game content data — all game items live here as static data for Stage 1.
// In Stage 5+, some of this will be served from Cloudflare R2 as a content pack.

// ─── Yaad Rakho (Memory) ─────────────────────────────────────────────────────
// Study phase: show items → Recall phase: pick the one you saw

export interface MemoryItem {
  id: string;
  label: string;
  hindiLabel: string;
  emoji: string;
}

export const MEMORY_ITEMS: MemoryItem[] = [
  { id: 'book',     label: 'Book',     hindiLabel: 'किताब',   emoji: '📚' },
  { id: 'spoon',    label: 'Spoon',    hindiLabel: 'चम्मच',   emoji: '🥄' },
  { id: 'elephant', label: 'Elephant', hindiLabel: 'हाथी',    emoji: '🐘' },
  { id: 'apple',    label: 'Apple',    hindiLabel: 'सेब',     emoji: '🍎' },
  { id: 'cup',      label: 'Cup',      hindiLabel: 'कप',      emoji: '☕' },
  { id: 'fish',     label: 'Fish',     hindiLabel: 'मछली',    emoji: '🐟' },
  { id: 'banana',   label: 'Banana',   hindiLabel: 'केला',    emoji: '🍌' },
  { id: 'star',     label: 'Star',     hindiLabel: 'तारा',    emoji: '⭐' },
  { id: 'flower',   label: 'Flower',   hindiLabel: 'फूल',     emoji: '🌸' },
  { id: 'car',      label: 'Car',      hindiLabel: 'गाड़ी',   emoji: '🚗' },
  { id: 'key',      label: 'Key',      hindiLabel: 'चाबी',    emoji: '🔑' },
  { id: 'orange',   label: 'Orange',   hindiLabel: 'संतरा',   emoji: '🍊' },
];

// Generate a memory round: N items to study, plus distractors for recall
export function generateMemoryRound(studyCount: number): {
  studyItems: MemoryItem[];
  recallQuestions: Array<{ target: MemoryItem; options: MemoryItem[] }>;
} {
  const shuffled = [...MEMORY_ITEMS].sort(() => Math.random() - 0.5);
  const studyItems = shuffled.slice(0, studyCount);
  const distractors = shuffled.slice(studyCount);

  const recallQuestions = studyItems.map((target) => {
    const wrongOptions = distractors
      .slice(0, 2)
      .filter(d => d.id !== target.id)
      .slice(0, 2);
    const options = [target, ...wrongOptions].sort(() => Math.random() - 0.5);
    return { target, options };
  });

  return { studyItems, recallQuestions };
}

// ─── Nazar Tez (Attention — Visual Search) ────────────────────────────────────
export interface AttentionItem {
  id: string;
  label: string;
  hindiLabel: string;
  emoji: string;
}

export const ATTENTION_ITEMS: AttentionItem[] = [
  { id: 'fish',   label: 'Fish',   hindiLabel: 'मछली',  emoji: '🐟' },
  { id: 'car',    label: 'Car',    hindiLabel: 'गाड़ी', emoji: '🚗' },
  { id: 'grapes', label: 'Grapes', hindiLabel: 'अंगूर', emoji: '🍇' },
  { id: 'spoon',  label: 'Spoon',  hindiLabel: 'चम्मच', emoji: '🥄' },
  { id: 'star',   label: 'Star',   hindiLabel: 'तारा',  emoji: '⭐' },
  { id: 'cup',    label: 'Cup',    hindiLabel: 'कप',    emoji: '☕' },
  { id: 'apple',  label: 'Apple',  hindiLabel: 'सेब',   emoji: '🍎' },
  { id: 'key',    label: 'Key',    hindiLabel: 'चाबी',  emoji: '🔑' },
  { id: 'flower', label: 'Flower', hindiLabel: 'फूल',   emoji: '🌸' },
  { id: 'banana', label: 'Banana', hindiLabel: 'केला',  emoji: '🍌' },
];

// Generate a visual search round: pick a target, fill grid with distractors
export function generateSearchRound(gridSize: number): {
  target: AttentionItem;
  grid: AttentionItem[];
} {
  const shuffled = [...ATTENTION_ITEMS].sort(() => Math.random() - 0.5);
  const target = shuffled[0];
  const distractors = shuffled.slice(1, gridSize);
  const grid = [target, ...distractors].sort(() => Math.random() - 0.5);
  return { target, grid };
}

// ─── Milan (Patterns — Odd One Out) ───────────────────────────────────────────
export interface OddOneOutRound {
  items: Array<{ id: string; label: string; emoji: string; category: string }>;
  oddItemId: string;
  explanation: string;
}

const FRUITS = [
  { id: 'apple',  label: 'Apple',  emoji: '🍎', category: 'fruit' },
  { id: 'banana', label: 'Banana', emoji: '🍌', category: 'fruit' },
  { id: 'orange', label: 'Orange', emoji: '🍊', category: 'fruit' },
  { id: 'grapes', label: 'Grapes', emoji: '🍇', category: 'fruit' },
  { id: 'mango',  label: 'Mango',  emoji: '🥭', category: 'fruit' },
];

const VEHICLES = [
  { id: 'car',   label: 'Car',   emoji: '🚗', category: 'vehicle' },
  { id: 'bus',   label: 'Bus',   emoji: '🚌', category: 'vehicle' },
  { id: 'train', label: 'Train', emoji: '🚂', category: 'vehicle' },
  { id: 'bike',  label: 'Bike',  emoji: '🚲', category: 'vehicle' },
];

const ANIMALS = [
  { id: 'dog',      label: 'Dog',      emoji: '🐶', category: 'animal' },
  { id: 'cat',      label: 'Cat',      emoji: '🐱', category: 'animal' },
  { id: 'elephant', label: 'Elephant', emoji: '🐘', category: 'animal' },
  { id: 'fish',     label: 'Fish',     emoji: '🐟', category: 'animal' },
];

export const ODD_ONE_OUT_ROUNDS: OddOneOutRound[] = [
  {
    items: [
      { id: 'banana', label: 'Banana', emoji: '🍌', category: 'fruit' },
      { id: 'car',    label: 'Car',    emoji: '🚗', category: 'vehicle' },
      { id: 'orange', label: 'Orange', emoji: '🍊', category: 'fruit' },
      { id: 'apple',  label: 'Apple',  emoji: '🍎', category: 'fruit' },
    ],
    oddItemId: 'car',
    explanation: 'Car is a vehicle, the rest are fruits',
  },
  {
    items: [
      { id: 'dog',  label: 'Dog',  emoji: '🐶', category: 'animal' },
      { id: 'cat',  label: 'Cat',  emoji: '🐱', category: 'animal' },
      { id: 'bus',  label: 'Bus',  emoji: '🚌', category: 'vehicle' },
      { id: 'fish', label: 'Fish', emoji: '🐟', category: 'animal' },
    ],
    oddItemId: 'bus',
    explanation: 'Bus is a vehicle, the rest are animals',
  },
  {
    items: [
      { id: 'mango',  label: 'Mango',  emoji: '🥭', category: 'fruit' },
      { id: 'grapes', label: 'Grapes', emoji: '🍇', category: 'fruit' },
      { id: 'train',  label: 'Train',  emoji: '🚂', category: 'vehicle' },
      { id: 'apple',  label: 'Apple',  emoji: '🍎', category: 'fruit' },
    ],
    oddItemId: 'train',
    explanation: 'Train is a vehicle, the rest are fruits',
  },
  {
    items: [
      { id: 'car',      label: 'Car',      emoji: '🚗', category: 'vehicle' },
      { id: 'elephant', label: 'Elephant', emoji: '🐘', category: 'animal' },
      { id: 'bike',     label: 'Bike',     emoji: '🚲', category: 'vehicle' },
      { id: 'bus',      label: 'Bus',      emoji: '🚌', category: 'vehicle' },
    ],
    oddItemId: 'elephant',
    explanation: 'Elephant is an animal, the rest are vehicles',
  },
  {
    items: [
      { id: 'cat',    label: 'Cat',    emoji: '🐱', category: 'animal' },
      { id: 'dog',    label: 'Dog',    emoji: '🐶', category: 'animal' },
      { id: 'orange', label: 'Orange', emoji: '🍊', category: 'fruit' },
      { id: 'fish',   label: 'Fish',   emoji: '🐟', category: 'animal' },
    ],
    oddItemId: 'orange',
    explanation: 'Orange is a fruit, the rest are animals',
  },
  {
    items: [
      { id: 'banana', label: 'Banana', emoji: '🍌', category: 'fruit' },
      { id: 'mango',  label: 'Mango',  emoji: '🥭', category: 'fruit' },
      { id: 'dog',    label: 'Dog',    emoji: '🐶', category: 'animal' },
      { id: 'grapes', label: 'Grapes', emoji: '🍇', category: 'fruit' },
    ],
    oddItemId: 'dog',
    explanation: 'Dog is an animal, the rest are fruits',
  },
];

// ─── Mera Din (Daily Routine Recall — Sequence Ordering) ─────────────────────
export interface RoutineItem {
  id: string;
  label: string;
  hindiLabel: string;
  emoji: string;
  order: number;  // correct position in sequence
}

export interface RoutineRound {
  title: string;
  instruction: string;
  items: RoutineItem[];
}

export const ROUTINE_ROUNDS: RoutineRound[] = [
  {
    title: 'Put the Morning in Order',
    instruction: 'Tap the pictures in the order you do them each morning. Start with what comes first.',
    items: [
      { id: 'wakeup',    label: 'Wake up',    hindiLabel: 'उठना',          emoji: '☀️',  order: 1 },
      { id: 'washface',  label: 'Wash face',  hindiLabel: 'मुँह धोना',      emoji: '💧',  order: 2 },
      { id: 'dressed',   label: 'Get dressed', hindiLabel: 'कपड़े पहनना',   emoji: '👕',  order: 3 },
      { id: 'tea',       label: 'Have tea',   hindiLabel: 'चाय पीना',       emoji: '☕',  order: 4 },
    ],
  },
  {
    title: 'Put the Evening in Order',
    instruction: 'Tap the pictures in the right order for your evening routine.',
    items: [
      { id: 'eveningwalk', label: 'Evening walk', hindiLabel: 'शाम की सैर',  emoji: '🚶', order: 1 },
      { id: 'freshen',     label: 'Freshen up',   hindiLabel: 'ताज़ा होना',   emoji: '🚿', order: 2 },
      { id: 'dinner',      label: 'Have dinner',  hindiLabel: 'रात का खाना',  emoji: '🍽️', order: 3 },
      { id: 'medicine',    label: 'Take medicine', hindiLabel: 'दवाई लेना',   emoji: '💊', order: 4 },
    ],
  },
  {
    title: 'Put the Meal Routine in Order',
    instruction: 'What do you do before and after eating? Tap in the right order.',
    items: [
      { id: 'washands',  label: 'Wash hands',  hindiLabel: 'हाथ धोना',       emoji: '🙌', order: 1 },
      { id: 'sit',       label: 'Sit down',    hindiLabel: 'बैठना',            emoji: '🪑', order: 2 },
      { id: 'eat',       label: 'Eat food',    hindiLabel: 'खाना खाना',       emoji: '🍛', order: 3 },
      { id: 'rinse',     label: 'Rinse plate', hindiLabel: 'थाली साफ करना',   emoji: '🧹', order: 4 },
    ],
  },
];
