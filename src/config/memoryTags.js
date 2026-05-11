export const MEMORY_TAGS = [
  {
    id: "happy",
    label: "Mutlu",
    emoji: "😊",
    color: "bg-amber-500/15 text-amber-200 border-amber-400/40",
  },
  {
    id: "miss",
    label: "Özledim",
    emoji: "🥺",
    color: "bg-sky-500/15 text-sky-200 border-sky-400/40",
  },
  {
    id: "funny",
    label: "Komik",
    emoji: "😂",
    color: "bg-violet-500/15 text-violet-200 border-violet-400/40",
  },
  {
    id: "trip",
    label: "Gezi",
    emoji: "✈️",
    color: "bg-cyan-500/15 text-cyan-200 border-cyan-400/40",
  },
  {
    id: "special",
    label: "Özel gün",
    emoji: "💝",
    color: "bg-pink-500/15 text-pink-200 border-pink-400/40",
  },
  {
    id: "surprise",
    label: "Sürpriz",
    emoji: "🎁",
    color: "bg-orange-500/15 text-orange-200 border-orange-400/40",
  },
  {
    id: "heart",
    label: "Kalp",
    emoji: "❤️",
    color: "bg-rose-500/15 text-rose-200 border-rose-400/40",
  },
  {
    id: "food",
    label: "Yemek",
    emoji: "🍽️",
    color: "bg-amber-600/15 text-amber-100 border-amber-500/35",
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
