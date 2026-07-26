export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const MAX_PAGES = 12;
export const MAX_OPTIONS = 10;

export function getDateKey(date) {
  const d = date instanceof Date ? date : new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function isFutureDate(dateKey) {
  return dateKey > getDateKey(new Date());
}

export function calculateCurrentStreak(data) {
  const today = new Date();
  let currentValue = null;
  let startOffset = 0;

  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = getDateKey(d);
    if (data[key] !== undefined && data[key] !== null && data[key] !== '') {
      currentValue = data[key];
      startOffset = i;
      break;
    }
  }

  if (currentValue === null) return { streak: 0, value: null };

  let streak = 1;
  for (let i = startOffset + 1; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = getDateKey(d);
    if (data[key] === currentValue) {
      streak++;
    } else {
      break;
    }
  }

  return { streak, value: currentValue };
}

export function calculateAnyStreak(data) {
  const today = new Date();
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = getDateKey(d);
    const value = data[key];
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export const BUILTIN_ICONS = {
  'rate-my-day': '⭐',
  'mood': '😊',
  'health': '❤️',
  'sleep': '🌙',
  'productivity': '✅',
  'reading': '📖',
  'self-care': '🛁',
};

const KEYWORD_ICONS = [
  { keywords: ['water', 'drink', 'hydration'], icon: '💧' },
  { keywords: ['exercise', 'workout', 'gym', 'fitness', 'walk', 'run'], icon: '💪' },
  { keywords: ['sleep', 'rest', 'nap'], icon: '🌙' },
  { keywords: ['study', 'learn', 'school', 'college', 'coding', 'code'], icon: '📚' },
  { keywords: ['book', 'read', 'novel'], icon: '📖' },
  { keywords: ['food', 'meal', 'eat', 'diet', 'cook'], icon: '🍽️' },
  { keywords: ['mood', 'feel', 'emotion', 'happy', 'sad'], icon: '😊' },
  { keywords: ['money', 'finance', 'expense', 'save'], icon: '💰' },
  { keywords: ['habit', 'routine', 'task', 'todo'], icon: '✅' },
  { keywords: ['health', 'sick', 'medicine', 'pain'], icon: '❤️' },
  { keywords: ['skin', 'face'], icon: '✨' },
  { keywords: ['hair'], icon: '💇' },
  { keywords: ['travel', 'trip', 'vacation'], icon: '✈️' },
  { keywords: ['meditation', 'mindful', 'yoga'], icon: '🧘' },
  { keywords: ['music', 'song'], icon: '🎵' },
  { keywords: ['movie', 'film', 'show'], icon: '🎬' },
  { keywords: ['game', 'play'], icon: '🎮' },
  { keywords: ['art', 'draw', 'paint'], icon: '🎨' },
  { keywords: ['photo', 'picture'], icon: '📷' },
  { keywords: ['plant', 'garden'], icon: '🌱' },
  { keywords: ['pet', 'dog', 'cat'], icon: '🐾' },
  { keywords: ['clean', 'tidy'], icon: '🧹' },
  { keywords: ['shop', 'buy'], icon: '🛍️' },
  { keywords: ['work', 'job', 'career'], icon: '💼' },
  { keywords: ['weather', 'sun', 'rain'], icon: '🌤️' },
];

const FALLBACK_ICONS = ['🌸', '🍃', '🌙', '✨', '💗', '🌈', '🦋', '🍄', '🌷', '💎', '🔮', '🎈'];

export function getPageIcon(page) {
  if (page.isBuiltin && BUILTIN_ICONS[page.id]) {
    return BUILTIN_ICONS[page.id];
  }
  const lowerName = page.name.toLowerCase();
  for (const mapping of KEYWORD_ICONS) {
    if (mapping.keywords.some(kw => lowerName.includes(kw))) {
      return mapping.icon;
    }
  }
  let hash = 0;
  for (let i = 0; i < page.name.length; i++) {
    hash = page.name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % FALLBACK_ICONS.length;
  return FALLBACK_ICONS[index];
}
