-- ============================================================
-- Supabase の categories テーブル用 初期シードデータ
-- アプリは Supabase から取得するため、ここで投入したカテゴリが
-- 登録フォームの選択肢・カテゴリ一覧に表示される
-- ============================================================

-- カテゴリー一覧（ID・名前）
-- cat-1  かき氷
-- cat-2  カレーライス
-- cat-3  チャーハン（手作り）
-- cat-4  ハンバーグ
-- cat-5  ラーメン
-- cat-6  寿司
-- cat-7  焼肉
-- cat-8  餃子
-- cat-9  パスタ
-- cat-10 うどん

INSERT INTO categories (id, name, image_url)
VALUES
  ('cat-1',  'かき氷',           NULL),
  ('cat-2',  'カレーライス',     NULL),
  ('cat-3',  'チャーハン（手作り）', NULL),
  ('cat-4',  'ハンバーグ',       NULL),
  ('cat-5',  'ラーメン',         NULL),
  ('cat-6',  '寿司',             NULL),
  ('cat-7',  '焼肉',             NULL),
  ('cat-8',  '餃子',             NULL),
  ('cat-9',  'パスタ',           NULL),
  ('cat-10', 'うどん',           NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  image_url = COALESCE(EXCLUDED.image_url, categories.image_url);
