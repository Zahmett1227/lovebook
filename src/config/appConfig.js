export const INITIAL_YEAR = 2026;
export const MIN_YEAR = 2025;

/** İlişki başlangıcı (ISO yyyy-MM-dd) — “gün birlikte” sayacı için; kendi tarihinize göre güncelleyin. */
export const RELATIONSHIP_START_DATE = '2024-12-11';

export const ALLOWED_USERS = [
  "ahmetkarasakal184@gmail.com",
  "tugba.caglar.2001@gmail.com",
];

/** İki e-postadan sabit çift kimliği (Firestore `couples/{id}`). */
export function generateCoupleId(emailA, emailB) {
  return [...new Set([emailA, emailB])]
    .filter(Boolean)
    .sort()
    .join('_')
    .replace(/[@.]/g, '-');
}

export const USER_PROFILES = {
  "ahmetkarasakal184@gmail.com": {
    displayName: "Ahmet",
    side: "left",
    color: "amber",
  },
  "tugba.caglar.2001@gmail.com": {
    displayName: "Tulu",
    side: "right",
    color: "rose",
  },
};

export const MOOD_OPTIONS = [
  { value: "happy", label: "Mutlu", emoji: "😊" },
  { value: "miss", label: "Özledim", emoji: "💙" },
  { value: "funny", label: "Komik", emoji: "😄" },
  { value: "travel", label: "Gezi", emoji: "✈️" },
  { value: "special", label: "Özel Gün", emoji: "✨" },
  { value: "surprise", label: "Sürpriz", emoji: "🎁" },
  { value: "heart", label: "Kalp", emoji: "❤️" },
];
