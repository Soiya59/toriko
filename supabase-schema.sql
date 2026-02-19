-- ============================================================
-- lib/supabase-data.ts の itemToRow / RankingRow / CategoryRow に
-- 完全に合わせた Supabase 用テーブル定義
-- ============================================================

-- カテゴリー（categories）
-- CategoryRow: id, name, image_url
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  image_url TEXT
);

-- ランキング項目（ranking_items）
-- RankingRow / itemToRow: id, category_id, name, score, eaten_at, comment, image_url, rank
CREATE TABLE IF NOT EXISTS ranking_items (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  score NUMERIC(3, 2) NOT NULL,
  eaten_at DATE NOT NULL,
  comment TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  rank INTEGER NOT NULL DEFAULT 0
);

-- スコア・ランクでの検索・並び替え用インデックス
CREATE INDEX IF NOT EXISTS idx_ranking_items_category_score
  ON ranking_items (category_id, score DESC);

-- フルコースのスロット割り当て（1スロット1行。将来のマルチユーザー用に user_id を用意）
CREATE TABLE IF NOT EXISTS full_course (
  slot_key TEXT NOT NULL,
  dish_id TEXT REFERENCES ranking_items(id) ON DELETE SET NULL,
  user_id TEXT NOT NULL DEFAULT 'default',
  PRIMARY KEY (user_id, slot_key)
);

COMMENT ON TABLE categories IS 'カテゴリー（料理ジャンル・旅行・思い出など）';
COMMENT ON TABLE ranking_items IS 'ランキング項目（料理・スポットなど）。itemToRow の payload とカラム名を一致させる';
COMMENT ON COLUMN ranking_items.eaten_at IS '食べた日・訪問日など（アプリ側の date を保存時に eaten_at に変換）';
COMMENT ON COLUMN ranking_items.rank IS 'カテゴリー内の順位（recalcRankAndCategoryImage で再計算）';
COMMENT ON TABLE full_course IS '人生のフルコース：スロット（前菜・スープ等）に割り当てた料理ID。user_id は将来の認証用';
