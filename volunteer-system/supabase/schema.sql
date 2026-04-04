-- ============================================================
-- ボランティア管理システム - Supabase データベーススキーマ
-- ============================================================
-- Supabase ダッシュボードの SQL Editor で実行してください。
-- ============================================================

-- ============================================================
-- 1. プロフィールテーブル (auth.users を拡張)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id                  UUID        REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name           TEXT        NOT NULL DEFAULT '',
  email               TEXT        NOT NULL DEFAULT '',
  phone               TEXT,
  nationality         TEXT,
  birthday            DATE,
  prefecture          TEXT,
  occupation          TEXT,
  skills              TEXT,
  japanese_level      SMALLINT    CHECK (japanese_level BETWEEN 1 AND 5),
  english_level       SMALLINT    CHECK (english_level BETWEEN 1 AND 5),
  role                TEXT        NOT NULL DEFAULT 'volunteer'
                                  CHECK (role IN ('volunteer', 'admin')),
  address             TEXT,
  nearest_station     TEXT,
  bank_name           TEXT,
  bank_branch         TEXT,
  bank_account_number TEXT,
  bank_account_holder TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 既存DBへの追加カラム（初回実行後に必要な場合）
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS prefecture          TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS occupation          TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS skills              TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address             TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS nearest_station     TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bank_name           TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bank_branch         TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bank_account_number TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bank_account_holder TEXT;

-- ============================================================
-- 2. イベントテーブル
-- ============================================================
CREATE TABLE IF NOT EXISTS public.events (
  id                       UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  title                    TEXT        NOT NULL,
  description              TEXT,
  location                 TEXT,
  event_date               TIMESTAMPTZ NOT NULL,
  registration_start       TIMESTAMPTZ,
  registration_end         TIMESTAMPTZ,
  result_notification_date TIMESTAMPTZ,
  capacity                 INT         CHECK (capacity > 0),
  created_by               UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.events ADD COLUMN IF NOT EXISTS registration_start       TIMESTAMPTZ;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS registration_end         TIMESTAMPTZ;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS result_notification_date TIMESTAMPTZ;

-- ============================================================
-- 3. イベント参加登録テーブル
-- ============================================================
CREATE TABLE IF NOT EXISTS public.event_registrations (
  id                  UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id            UUID        NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id             UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  registered_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status              TEXT        NOT NULL DEFAULT 'applied'
                                  CHECK (status IN ('applied', 'selected', 'rejected')),
  wants_transport_fee BOOLEAN     DEFAULT false,
  wants_honorarium    BOOLEAN     DEFAULT false,
  UNIQUE (event_id, user_id)
);

ALTER TABLE public.event_registrations ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'applied' CHECK (status IN ('applied', 'selected', 'rejected'));
ALTER TABLE public.event_registrations ADD COLUMN IF NOT EXISTS wants_transport_fee BOOLEAN DEFAULT false;
ALTER TABLE public.event_registrations ADD COLUMN IF NOT EXISTS wants_honorarium    BOOLEAN DEFAULT false;

-- ============================================================
-- 4. 管理者ロール確認ヘルパー関数
--    (SECURITY DEFINER でRLSをバイパスして再帰を防ぐ)
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = user_id;
$$;

-- ============================================================
-- 5. 新規ユーザー登録時にプロフィールを自動作成するトリガー
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    phone,
    nationality,
    birthday,
    japanese_level,
    english_level
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NULLIF(NEW.raw_user_meta_data->>'phone', ''),
    NULLIF(NEW.raw_user_meta_data->>'nationality', ''),
    CASE
      WHEN NEW.raw_user_meta_data->>'birthday' IS NOT NULL
        AND NEW.raw_user_meta_data->>'birthday' != ''
      THEN (NEW.raw_user_meta_data->>'birthday')::DATE
      ELSE NULL
    END,
    CASE
      WHEN NEW.raw_user_meta_data->>'japanese_level' IS NOT NULL
        AND NEW.raw_user_meta_data->>'japanese_level' != ''
      THEN (NEW.raw_user_meta_data->>'japanese_level')::SMALLINT
      ELSE NULL
    END,
    CASE
      WHEN NEW.raw_user_meta_data->>'english_level' IS NOT NULL
        AND NEW.raw_user_meta_data->>'english_level' != ''
      THEN (NEW.raw_user_meta_data->>'english_level')::SMALLINT
      ELSE NULL
    END
  )
  ON CONFLICT (id) DO UPDATE SET
    email          = EXCLUDED.email,
    full_name      = EXCLUDED.full_name,
    phone          = COALESCE(EXCLUDED.phone, public.profiles.phone),
    nationality    = COALESCE(EXCLUDED.nationality, public.profiles.nationality),
    birthday       = COALESCE(EXCLUDED.birthday, public.profiles.birthday),
    japanese_level = COALESCE(EXCLUDED.japanese_level, public.profiles.japanese_level),
    english_level  = COALESCE(EXCLUDED.english_level, public.profiles.english_level);
  RETURN NEW;
END;
$$;

-- トリガーを作成（既存の場合は削除してから再作成）
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 6. updated_at を自動更新するトリガー
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profiles_updated ON public.profiles;
CREATE TRIGGER on_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS on_events_updated ON public.events;
CREATE TRIGGER on_events_updated
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- 7. Row Level Security (RLS) の有効化
-- ============================================================
ALTER TABLE public.profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 8. profiles テーブルのポリシー
-- ============================================================

DROP POLICY IF EXISTS "users_select_own_profile"      ON public.profiles;
DROP POLICY IF EXISTS "users_insert_own_profile"      ON public.profiles;
DROP POLICY IF EXISTS "users_update_own_profile"      ON public.profiles;
DROP POLICY IF EXISTS "admin_select_all_profiles"     ON public.profiles;

-- 自分のプロフィールを参照
CREATE POLICY "users_select_own_profile" ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- 自分のプロフィールを作成（トリガーから呼ばれる場合もあるのでSECURITY DEFINERを使用）
CREATE POLICY "users_insert_own_profile" ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 自分のプロフィールを更新
CREATE POLICY "users_update_own_profile" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- 管理者は全プロフィールを参照
CREATE POLICY "admin_select_all_profiles" ON public.profiles
  FOR SELECT
  USING (public.get_user_role(auth.uid()) = 'admin');

-- ============================================================
-- 9. events テーブルのポリシー
-- ============================================================

DROP POLICY IF EXISTS "authenticated_select_events" ON public.events;
DROP POLICY IF EXISTS "admin_insert_events"          ON public.events;
DROP POLICY IF EXISTS "admin_update_events"          ON public.events;
DROP POLICY IF EXISTS "admin_delete_events"          ON public.events;

-- 認証済みユーザーはイベントを参照可能
CREATE POLICY "authenticated_select_events" ON public.events
  FOR SELECT
  TO authenticated
  USING (true);

-- 管理者のみイベントを作成
CREATE POLICY "admin_insert_events" ON public.events
  FOR INSERT
  WITH CHECK (public.get_user_role(auth.uid()) = 'admin');

-- 管理者のみイベントを更新
CREATE POLICY "admin_update_events" ON public.events
  FOR UPDATE
  USING (public.get_user_role(auth.uid()) = 'admin');

-- 管理者のみイベントを削除
CREATE POLICY "admin_delete_events" ON public.events
  FOR DELETE
  USING (public.get_user_role(auth.uid()) = 'admin');

-- ============================================================
-- 10. event_registrations テーブルのポリシー
-- ============================================================

DROP POLICY IF EXISTS "users_select_own_registrations"  ON public.event_registrations;
DROP POLICY IF EXISTS "users_insert_own_registration"   ON public.event_registrations;
DROP POLICY IF EXISTS "users_delete_own_registration"   ON public.event_registrations;
DROP POLICY IF EXISTS "admin_select_all_registrations"  ON public.event_registrations;
DROP POLICY IF EXISTS "admin_delete_any_registration"   ON public.event_registrations;

-- 自分の参加登録を参照
CREATE POLICY "users_select_own_registrations" ON public.event_registrations
  FOR SELECT
  USING (auth.uid() = user_id);

-- 自分でイベントに申し込む
CREATE POLICY "users_insert_own_registration" ON public.event_registrations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 自分の申し込みをキャンセル
CREATE POLICY "users_delete_own_registration" ON public.event_registrations
  FOR DELETE
  USING (auth.uid() = user_id);

-- 管理者は全参加登録を参照
CREATE POLICY "admin_select_all_registrations" ON public.event_registrations
  FOR SELECT
  USING (public.get_user_role(auth.uid()) = 'admin');

-- 管理者はステータスを更新可能
CREATE POLICY "admin_update_any_registration" ON public.event_registrations
  FOR UPDATE
  USING (public.get_user_role(auth.uid()) = 'admin');

-- 管理者は任意の参加登録を削除（参加者の取り消し）
CREATE POLICY "admin_delete_any_registration" ON public.event_registrations
  FOR DELETE
  USING (public.get_user_role(auth.uid()) = 'admin');

-- ============================================================
-- 11. メールテンプレートテーブル
-- ============================================================
CREATE TABLE IF NOT EXISTS public.email_templates (
  id         TEXT        PRIMARY KEY,  -- 'selected' | 'rejected'
  subject    TEXT        NOT NULL,
  body_html  TEXT        NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_manage_email_templates" ON public.email_templates;
CREATE POLICY "admin_manage_email_templates" ON public.email_templates
  USING (public.get_user_role(auth.uid()) = 'admin');

-- 初期テンプレートデータ
INSERT INTO public.email_templates (id, subject, body_html) VALUES
(
  'selected',
  '【当選通知】{{event_title}}への参加が確定しました',
  '<p>{{name}} 様</p><p>この度は「{{event_title}}」にお申し込みいただきありがとうございます。</p><p>選考の結果、<strong>参加が確定</strong>しました。当日のご参加をお待ちしております。</p><p>ご不明な点はお気軽にお問い合わせください。</p><br><p>NPOナタデココ<br>https://natadecoco.org</p>'
),
(
  'rejected',
  '【選考結果】{{event_title}}の選考結果についてお知らせ',
  '<p>{{name}} 様</p><p>この度は「{{event_title}}」にお申し込みいただきありがとうございます。</p><p>誠に恐れながら、今回は定員の関係で<strong>ご参加いただくことが叶いませんでした</strong>。</p><p>またの機会にぜひご参加ください。</p><br><p>NPOナタデココ<br>https://natadecoco.org</p>'
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 12. インデックス（パフォーマンス向上）
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_events_event_date ON public.events(event_date);
CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON public.event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_user_id ON public.event_registrations(user_id);

-- ============================================================
-- 13. 最初の管理者アカウントを設定する方法
-- ============================================================
-- ① Supabase Auth でメール登録してアカウントを作成する
-- ② 以下のSQLで管理者権限を付与する（メールアドレスを変更してください）:
--
-- UPDATE public.profiles
-- SET role = 'admin'
-- WHERE email = 'admin@example.com';
--
-- ============================================================
