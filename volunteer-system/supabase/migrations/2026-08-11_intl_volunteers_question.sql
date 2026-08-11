-- ============================================================
-- intl_volunteers: 説明会「希望日」の廃止 ＋ 任意の質問欄の追加
-- ------------------------------------------------------------
-- 背景: 説明会の日程は申込後にメールで案内する運用へ変更したため、
--       フォームの preferred_session（NOT NULL）を廃止し、
--       任意入力の question カラムを追加する。
--
-- 実行方法: Supabase Dashboard → SQL Editor に貼り付けて実行。
--           （schema.sql は最新の完成形に更新済み。既存DBには本SQLを流す）
-- 冪等: DROP/ADD とも IF EXISTS / IF NOT EXISTS で複数回実行しても安全。
-- ============================================================

ALTER TABLE public.intl_volunteers DROP COLUMN IF EXISTS preferred_session;
ALTER TABLE public.intl_volunteers ADD COLUMN IF NOT EXISTS question TEXT;
