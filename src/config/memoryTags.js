export const MEMORY_TAGS = [
  {
    id: "happy",
    label: "Mutlu",
    emoji: "😊",
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  {
    id: "miss",
    label: "Özledim",
    emoji: "🥺",
    color: "bg-blue-100 text-blue-700 border-blue-200",
  },
  {
    id: "funny",
    label: "Komik",
    emoji: "😂",
    color: "bg-purple-100 text-purple-700 border-purple-200",
  },
  {
    id: "trip",
    label: "Gezi",
    emoji: "✈️",
    color: "bg-sky-100 text-sky-700 border-sky-200",
  },
  {
    id: "special",
    label: "Özel gün",
    emoji: "💝",
    color: "bg-pink-100 text-pink-700 border-pink-200",
  },
  {
    id: "surprise",
    label: "Sürpriz",
    emoji: "🎁",
    color: "bg-orange-100 text-orange-700 border-orange-200",
  },
  {
    id: "heart",
    label: "Kalp",
    emoji: "❤️",
    color: "bg-rose-100 text-rose-700 border-rose-200",
  },
  {
    id: "food",
    label: "Yemek",
    emoji: "🍽️",
    color: "bg-amber-100 text-amber-700 border-amber-200",
  },
];

const TAG_ALIASES = {
  travel: "trip",
  important: "special",
};

function normalizeTagId(id) {
  if (!id) return null;
  return TAG_ALIASES[id] ?? id;
}

export function getMemoryTagById(id) {
  const normalizedId = normalizeTagId(id);
  return MEMORY_TAGS.find((tag) => tag.id === normalizedId) || null;
}

export function getMemoryTagEmoji(id) {
  return getMemoryTagById(id)?.emoji || "•";
}

export function getMemoryTagLabel(id) {
  return getMemoryTagById(id)?.label || "";
}

export function normalizeMemoryTagId(id) {
  return normalizeTagId(id);
}
