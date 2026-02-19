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

COMMENT ON TABLE categories IS 'カテゴリー（料理ジャンル・旅行・思い出など）';
COMMENT ON TABLE ranking_items IS 'ランキング項目（料理・スポットなど）。itemToRow の payload とカラム名を一致させる';
COMMENT ON COLUMN ranking_items.eaten_at IS '食べた日・訪問日など（アプリ側の date を保存時に eaten_at に変換）';
COMMENT ON COLUMN ranking_items.rank IS 'カテゴリー内の順位（recalcRankAndCategoryImage で再計算）';

-- ============================================================
-- 既存テーブルがある場合：不足カラムのみ追加する例
-- ============================================================
-- categories に image_url がない場合:
-- ALTER TABLE categories ADD COLUMN IF NOT EXISTS image_url TEXT;

-- ranking_items が既にあり、カラム名が違う／足りない場合（itemToRow と一致させる）:
-- ALTER TABLE ranking_items ADD COLUMN IF NOT EXISTS eaten_at DATE;
-- ALTER TABLE ranking_items ADD COLUMN IF NOT EXISTS rank INTEGER NOT NULL DEFAULT 0;
-- 注意: date カラムを eaten_at にリネームする場合:
-- ALTER TABLE ranking_items RENAME COLUMN date TO eaten_at;
