export type Category = {
  id: string;
  name: string;
  description: string | null;
  cover_image_path: string | null;
};

export type GameAccount = {
  id: string;
  category_id: string;
  game_name: string;
  game_id: string;
  notes: string | null;
  image_path: string | null;
  created_at: string;
};

export type AccountNotes = {
  details: string;
  ownedSkins: string[];
};

export function parseAccountNotes(notes: string | null): AccountNotes {
  if (!notes) return { details: "", ownedSkins: [] };
  const heading = /^สกินที่มีแล้ว:\s*$/m;
  const match = heading.exec(notes);
  if (!match || match.index === undefined) {
    return { details: notes.trim(), ownedSkins: [] };
  }

  const details = notes.slice(0, match.index).trim();
  const ownedSkins = notes
    .slice(match.index + match[0].length)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "))
    .map((line) => line.slice(2).trim())
    .filter(Boolean);

  return { details, ownedSkins };
}
