-- ==========================================
-- 答题工具 — Supabase 数据库建表 SQL
-- 在 Supabase SQL Editor 中执行此脚本
-- ==========================================

-- 1. 题库套装表
CREATE TABLE question_sets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  perfect_poster_url TEXT DEFAULT '',
  normal_poster_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. 题目表
CREATE TABLE questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  set_id UUID REFERENCES question_sets(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('single', 'multi', 'judge')),
  options JSONB NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. 答题记录表
CREATE TABLE quiz_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  set_id UUID REFERENCES question_sets(id) ON DELETE SET NULL,
  set_name TEXT DEFAULT '',
  score INT DEFAULT 0,
  is_perfect BOOLEAN DEFAULT false,
  right_num INT DEFAULT 0,
  wrong_num INT DEFAULT 0,
  total_num INT DEFAULT 0,
  details JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 索引
CREATE INDEX idx_questions_set_id ON questions(set_id);
CREATE INDEX idx_quiz_records_created_at ON quiz_records(created_at DESC);

-- ==========================================
-- 行级安全策略 (RLS) — 允许匿名读写
-- 注意：anon key 公开发布，仅适合非敏感场景
-- 如果要安全管控，把管理操作改为 service_role key
-- ==========================================

-- question_sets
ALTER TABLE question_sets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read for all" ON question_sets FOR SELECT USING (true);
CREATE POLICY "Enable insert for all" ON question_sets FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all" ON question_sets FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all" ON question_sets FOR DELETE USING (true);

-- questions
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read for all" ON questions FOR SELECT USING (true);
CREATE POLICY "Enable insert for all" ON questions FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all" ON questions FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all" ON questions FOR DELETE USING (true);

-- quiz_records
ALTER TABLE quiz_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read for all" ON quiz_records FOR SELECT USING (true);
CREATE POLICY "Enable insert for all" ON quiz_records FOR INSERT WITH CHECK (true);
