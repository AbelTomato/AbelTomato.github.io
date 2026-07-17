const avatarPalette = [
  "bg-slate-700",
  "bg-blue-950",
  "bg-violet-950",
  "bg-teal-950",
  "bg-rose-950",
  "bg-amber-950",
] as const;

function hashText(value: string) {
  let hash = 0;

  for (const character of value) {
    hash = (hash << 5) - hash + character.codePointAt(0)!;
    hash |= 0;
  }

  return Math.abs(hash);
}

export function getCommentAvatarInitial(authorName: string) {
  return Array.from(authorName.trim())[0]?.toLocaleUpperCase() ?? "?";
}

export function getCommentAvatarClassName(authorName: string) {
  return avatarPalette[hashText(authorName.trim()) % avatarPalette.length];
}

export function formatCommentTimestamp(createdAt: string) {
  return new Intl.DateTimeFormat("en-CA", {
    dateStyle: "short",
    timeStyle: "short",
    hour12: false,
  })
    .format(new Date(createdAt))
    .replace(", ", " · ");
}

export function getCommentAnchorId(commentId: string) {
  return `comment-${commentId}`;
}