export type Game = {
  id: number;
  platform: string;
  platform_app_id: string;
  title: string;
  igdb_id: number | null;
  release_year: number | null;
  genres: string[];
  summary: string | null;
  cover_url: string | null;
  playtime_min: number;
  last_played: number | null;
  platforms?: string[]; // wypełniane przy dedupie cross-platform (B-6): lista platform danego tytułu
};

export type Shelf = {
  title: string;
  items: Game[];
};
