-- ==========================================
-- 青少年答题模块 — 数据库升级 SQL
-- 在 Supabase SQL Editor 中执行此脚本
-- ==========================================

-- 给套装表增加「所属模块」和「科普内容」字段
ALTER TABLE question_sets
  ADD COLUMN IF NOT EXISTS module TEXT DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS science_image TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS science_text TEXT DEFAULT '';

-- 确保已有套装都归为「通用模块」
UPDATE question_sets SET module = 'general' WHERE module IS NULL OR module = '';

-- 说明：
--   module         'general' = 通用模块, 'youth' = 青少年模块
--   science_image  科普图片（Base64 data URL），仅青少年模块使用
--   science_text   科普文字（≤400字），仅青少年模块使用
