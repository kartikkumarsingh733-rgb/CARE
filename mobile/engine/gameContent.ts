// Game content data — all game items live here as static data for Stage 1.
// In Stage 5+, some of this will be served from Cloudflare R2 as a content pack.

// ─── Yaad Rakho (Memory) ─────────────────────────────────────────────────────
// Study phase: show items → Recall phase: pick the one you saw

export interface MemoryItem {
  id: string;
  i18nKey: string;
  emoji: string;
}

export const MEMORY_ITEMS: MemoryItem[] = [
  { id: 'book',     i18nKey: 'item_book',     emoji: '📚' },
  { id: 'spoon',    i18nKey: 'item_spoon',    emoji: '🥄' },
  { id: 'elephant', i18nKey: 'item_elephant', emoji: '🐘' },
  { id: 'apple',    i18nKey: 'item_apple',    emoji: '🍎' },
  { id: 'cup',      i18nKey: 'item_cup',      emoji: '☕' },
  { id: 'fish',     i18nKey: 'item_fish',     emoji: '🐟' },
  { id: 'banana',   i18nKey: 'item_banana',   emoji: '🍌' },
  { id: 'star',     i18nKey: 'item_star',     emoji: '⭐' },
  { id: 'flower',   i18nKey: 'item_flower',   emoji: '🌸' },
  { id: 'car',      i18nKey: 'item_car',      emoji: '🚗' },
  { id: 'key',      i18nKey: 'item_key',      emoji: '🔑' },
  { id: 'orange',   i18nKey: 'item_orange',   emoji: '🍊' },
];

// Generate a memory round: N items to study, plus distractors for recall
export function generateMemoryRound(studyCount: number, optionsCount: number = 3): {
  studyItems: MemoryItem[];
  recallQuestions: Array<{ target: MemoryItem; options: MemoryItem[] }>;
} {
  const shuffled = [...MEMORY_ITEMS].sort(() => Math.random() - 0.5);
  const studyItems = shuffled.slice(0, studyCount);
  const distractors = shuffled.slice(studyCount);

  const recallQuestions = studyItems.map((target) => {
    const wrongOptions = distractors
      .filter(d => d.id !== target.id)
      .slice(0, optionsCount - 1);
    const options = [target, ...wrongOptions].sort(() => Math.random() - 0.5);
    return { target, options };
  });

  return { studyItems, recallQuestions };
}

// ─── Nazar Tez (Attention — Visual Search) ────────────────────────────────────
export interface AttentionItem {
  id: string;
  i18nKey: string;
  emoji: string;
}

export const ATTENTION_ITEMS: AttentionItem[] = [
  { id: 'fish',   i18nKey: 'item_fish',   emoji: '🐟' },
  { id: 'car',    i18nKey: 'item_car',    emoji: '🚗' },
  { id: 'grapes', i18nKey: 'item_grapes', emoji: '🍇' },
  { id: 'spoon',  i18nKey: 'item_spoon',  emoji: '🥄' },
  { id: 'star',   i18nKey: 'item_star',   emoji: '⭐' },
  { id: 'cup',    i18nKey: 'item_cup',    emoji: '☕' },
  { id: 'apple',  i18nKey: 'item_apple',  emoji: '🍎' },
  { id: 'key',    i18nKey: 'item_key',    emoji: '🔑' },
  { id: 'flower', i18nKey: 'item_flower', emoji: '🌸' },
  { id: 'banana', i18nKey: 'item_banana', emoji: '🍌' },
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
  items: Array<{ id: string; i18nKey: string; emoji: string; category: string }>;
  oddItemId: string;
  explanationKey: string;
}

const FRUITS = [
  { id: 'apple',      i18nKey: 'item_apple',      emoji: '🍎', category: 'cat_fruit' },
  { id: 'banana',     i18nKey: 'item_banana',     emoji: '🍌', category: 'cat_fruit' },
  { id: 'orange',     i18nKey: 'item_orange',     emoji: '🍊', category: 'cat_fruit' },
  { id: 'grapes',     i18nKey: 'item_grapes',     emoji: '🍇', category: 'cat_fruit' },
  { id: 'mango',      i18nKey: 'item_mango',      emoji: '🥭', category: 'cat_fruit' },
  { id: 'pineapple',  i18nKey: 'item_pineapple',  emoji: '🍍', category: 'cat_fruit' },
  { id: 'watermelon', i18nKey: 'item_watermelon', emoji: '🍉', category: 'cat_fruit' },
  { id: 'strawberry', i18nKey: 'item_strawberry', emoji: '🍓', category: 'cat_fruit' },
  { id: 'cherry',     i18nKey: 'item_cherry',     emoji: '🍒', category: 'cat_fruit' },
];

const VEHICLES = [
  { id: 'car',        i18nKey: 'item_car',        emoji: '🚗', category: 'cat_vehicle' },
  { id: 'bus',        i18nKey: 'item_bus',        emoji: '🚌', category: 'cat_vehicle' },
  { id: 'train',      i18nKey: 'item_train',      emoji: '🚂', category: 'cat_vehicle' },
  { id: 'bike',       i18nKey: 'item_bike',       emoji: '🚲', category: 'cat_vehicle' },
  { id: 'airplane',   i18nKey: 'item_airplane',   emoji: '✈️', category: 'cat_vehicle' },
  { id: 'boat',       i18nKey: 'item_boat',       emoji: '⛵', category: 'cat_vehicle' },
  { id: 'helicopter', i18nKey: 'item_helicopter', emoji: '🚁', category: 'cat_vehicle' },
  { id: 'tractor',    i18nKey: 'item_tractor',    emoji: '🚜', category: 'cat_vehicle' },
  { id: 'scooter',    i18nKey: 'item_scooter',    emoji: '🛵', category: 'cat_vehicle' },
];

const ANIMALS = [
  { id: 'dog',        i18nKey: 'item_dog',        emoji: '🐶', category: 'cat_animal' },
  { id: 'cat',        i18nKey: 'item_cat',        emoji: '🐱', category: 'cat_animal' },
  { id: 'elephant',   i18nKey: 'item_elephant',   emoji: '🐘', category: 'cat_animal' },
  { id: 'fish',       i18nKey: 'item_fish',       emoji: '🐟', category: 'cat_animal' },
  { id: 'bird',       i18nKey: 'item_bird',       emoji: '🐦', category: 'cat_animal' },
  { id: 'monkey',     i18nKey: 'item_monkey',     emoji: '🐒', category: 'cat_animal' },
  { id: 'lion',       i18nKey: 'item_lion',       emoji: '🦁', category: 'cat_animal' },
  { id: 'tiger',      i18nKey: 'item_tiger',      emoji: '🐅', category: 'cat_animal' },
  { id: 'bear',       i18nKey: 'item_bear',       emoji: '🐻', category: 'cat_animal' },
];

export function generateOddOneOutRound(itemCount: number): OddOneOutRound {
  const categories = [
    { name: 'fruits', data: FRUITS, text: 'fruits' },
    { name: 'vehicles', data: VEHICLES, text: 'vehicles' },
    { name: 'animals', data: ANIMALS, text: 'animals' }
  ];
  
  // Pick random base category
  const baseCatIndex = Math.floor(Math.random() * categories.length);
  const baseCategory = categories[baseCatIndex];
  
  // Pick random odd category
  const oddCatIndex = (baseCatIndex + 1 + Math.floor(Math.random() * (categories.length - 1))) % categories.length;
  const oddCategory = categories[oddCatIndex];

  // Pick (itemCount - 1) base items
  const shuffledBase = [...baseCategory.data].sort(() => Math.random() - 0.5);
  const baseItems = shuffledBase.slice(0, Math.min(itemCount - 1, shuffledBase.length));
  
  // Pick 1 odd item
  const shuffledOdd = [...oddCategory.data].sort(() => Math.random() - 0.5);
  const oddItem = shuffledOdd[0];

  const items = [...baseItems, oddItem].sort(() => Math.random() - 0.5);
  
  return {
    items,
    oddItemId: oddItem.id,
    explanationKey: `${oddItem.i18nKey}|${oddCategory.text}|${baseCategory.text}` // Storing format to compute in UI
  };
}

export const ODD_ONE_OUT_ROUNDS: OddOneOutRound[] = [
  {
    items: [
      { id: 'banana', i18nKey: 'item_banana', emoji: '🍌', category: 'cat_fruit' },
      { id: 'car',    i18nKey: 'item_car',    emoji: '🚗', category: 'cat_vehicle' },
      { id: 'orange', i18nKey: 'item_orange', emoji: '🍊', category: 'cat_fruit' },
      { id: 'apple',  i18nKey: 'item_apple',  emoji: '🍎', category: 'cat_fruit' },
    ],
    oddItemId: 'car',
    explanationKey: 'item_car|cat_vehicle|cat_fruits',
  },
  {
    items: [
      { id: 'dog',  i18nKey: 'item_dog',  emoji: '🐶', category: 'cat_animal' },
      { id: 'cat',  i18nKey: 'item_cat',  emoji: '🐱', category: 'cat_animal' },
      { id: 'bus',  i18nKey: 'item_bus',  emoji: '🚌', category: 'cat_vehicle' },
      { id: 'fish', i18nKey: 'item_fish', emoji: '🐟', category: 'cat_animal' },
    ],
    oddItemId: 'bus',
    explanationKey: 'item_bus|cat_vehicle|cat_animals',
  },
  {
    items: [
      { id: 'mango',  i18nKey: 'item_mango',  emoji: '🥭', category: 'cat_fruit' },
      { id: 'grapes', i18nKey: 'item_grapes', emoji: '🍇', category: 'cat_fruit' },
      { id: 'train',  i18nKey: 'item_train',  emoji: '🚂', category: 'cat_vehicle' },
      { id: 'apple',  i18nKey: 'item_apple',  emoji: '🍎', category: 'cat_fruit' },
    ],
    oddItemId: 'train',
    explanationKey: 'item_train|cat_vehicle|cat_fruits',
  },
  {
    items: [
      { id: 'car',      i18nKey: 'item_car',      emoji: '🚗', category: 'cat_vehicle' },
      { id: 'elephant', i18nKey: 'item_elephant', emoji: '🐘', category: 'cat_animal' },
      { id: 'bike',     i18nKey: 'item_bike',     emoji: '🚲', category: 'cat_vehicle' },
      { id: 'bus',      i18nKey: 'item_bus',      emoji: '🚌', category: 'cat_vehicle' },
    ],
    oddItemId: 'elephant',
    explanationKey: 'item_elephant|cat_animal|cat_vehicles',
  },
  {
    items: [
      { id: 'cat',    i18nKey: 'item_cat',    emoji: '🐱', category: 'cat_animal' },
      { id: 'dog',    i18nKey: 'item_dog',    emoji: '🐶', category: 'cat_animal' },
      { id: 'orange', i18nKey: 'item_orange', emoji: '🍊', category: 'cat_fruit' },
      { id: 'fish',   i18nKey: 'item_fish',   emoji: '🐟', category: 'cat_animal' },
    ],
    oddItemId: 'orange',
    explanationKey: 'item_orange|cat_fruit|cat_animals',
  },
  {
    items: [
      { id: 'banana', i18nKey: 'item_banana', emoji: '🍌', category: 'cat_fruit' },
      { id: 'mango',  i18nKey: 'item_mango',  emoji: '🥭', category: 'cat_fruit' },
      { id: 'dog',    i18nKey: 'item_dog',    emoji: '🐶', category: 'cat_animal' },
      { id: 'grapes', i18nKey: 'item_grapes', emoji: '🍇', category: 'cat_fruit' },
    ],
    oddItemId: 'dog',
    explanationKey: 'item_dog|cat_animal|cat_fruits',
  },
];

// ─── Mera Din (Daily Routine Recall — Sequence Ordering) ─────────────────────
export interface RoutineItem {
  id: string;
  i18nKey: string;
  emoji: string;
  order: number;  // correct position in sequence
}

export interface RoutineRound {
  titleKey: string;
  instructionKey: string;
  items: RoutineItem[];
}

export const ROUTINE_ROUNDS: RoutineRound[] = [
  {
    titleKey: 'routine_morn_title',
    instructionKey: 'routine_morn_inst',
    items: [
      { id: 'wakeup',    i18nKey: 'item_wakeup',    emoji: '☀️',  order: 1 },
      { id: 'washface',  i18nKey: 'item_washface',  emoji: '💧',  order: 2 },
      { id: 'dressed',   i18nKey: 'item_dressed',   emoji: '👕',  order: 3 },
      { id: 'tea',       i18nKey: 'item_tea',       emoji: '☕',  order: 4 },
      { id: 'readpaper', i18nKey: 'item_readpaper', emoji: '📰',  order: 5 },
      { id: 'breakfast', i18nKey: 'item_breakfast', emoji: '🍳',  order: 6 },
    ],
  },
  {
    titleKey: 'routine_eve_title',
    instructionKey: 'routine_eve_inst',
    items: [
      { id: 'eveningwalk', i18nKey: 'item_eveningwalk', emoji: '🚶', order: 1 },
      { id: 'freshen',     i18nKey: 'item_freshen',     emoji: '🚿', order: 2 },
      { id: 'tv',          i18nKey: 'item_tv',          emoji: '📺', order: 3 },
      { id: 'dinner',      i18nKey: 'item_dinner',      emoji: '🍽️', order: 4 },
      { id: 'medicine',    i18nKey: 'item_medicine',    emoji: '💊', order: 5 },
      { id: 'sleep',       i18nKey: 'item_sleep',       emoji: '🛌', order: 6 },
    ],
  },
  {
    titleKey: 'routine_meal_title',
    instructionKey: 'routine_meal_inst',
    items: [
      { id: 'washands',  i18nKey: 'item_washands',  emoji: '🙌', order: 1 },
      { id: 'sit',       i18nKey: 'item_sit',       emoji: '🪑', order: 2 },
      { id: 'serve',     i18nKey: 'item_serve',     emoji: '🍲', order: 3 },
      { id: 'eat',       i18nKey: 'item_eat',       emoji: '🍛', order: 4 },
      { id: 'rinse',     i18nKey: 'item_rinse',     emoji: '🧹', order: 5 },
      { id: 'rest',      i18nKey: 'item_rest',      emoji: '🛋️', order: 6 },
    ],
  },
];

export function generateRoutineRound(roundIndex: number, sequenceLength: number): RoutineRound {
  const baseRound = ROUTINE_ROUNDS[roundIndex % ROUTINE_ROUNDS.length];
  // limit sequence length to what's available
  const len = Math.min(sequenceLength, baseRound.items.length);
  
  // Create a sub-sequence of the required length
  const slicedItems = baseRound.items.slice(0, len).map((item, i) => ({
    ...item,
    order: i + 1, // recalculate order just to be safe
  }));

  return {
    ...baseRound,
    items: slicedItems,
  };
}
