-- ============================================================
-- ExpenseScanner — Supabase 数据库初始化脚本
-- 文件: supabase/int.sql
-- 用法: 将此文件内容复制粘贴到 Supabase > SQL Editor 中执行
-- ⚠️  此脚本会先删除旧表再重建，请勿在生产环境有数据时执行
-- ============================================================

-- 开启 UUID 扩展（Supabase 默认已启用）
create extension if not exists "uuid-ossp";

-- ============================================================
-- 先删除旧表（含依赖），避免 "column does not exist" 错误
-- ============================================================
drop table if exists expenses cascade;

-- ============================================================
-- 表: expenses（支出记录）
-- 对应前端 Expense 接口 (src/types.ts)
-- ============================================================
create table expenses (
  id           uuid primary key default uuid_generate_v4(),

  -- 商家名称，例如 "Starbucks"、"Uber"
  merchant     text not null,

  -- 分类，对应前端 Category 类型
  -- 枚举值: 'Food & Drink' | 'Transport' | '住房' | '数码' | '旅行' | '医疗' | '学习' | '运动' | 'Other'
  category     text not null,

  -- 日期字符串，格式如 "Oct 27, 2023"
  date         text not null,

  -- 金额（正数）
  amount       numeric(10, 2) not null default 0,

  -- 对应 CATEGORIES 中的 icon 字符串，如 "Utensils"、"Car"
  icon         text not null default 'CircleEllipsis',

  -- 对应 CATEGORIES 中的 bg 颜色 class，如 "bg-orange-100"
  color        text not null default 'bg-slate-100',

  -- 是否为周期性消费
  is_recurring boolean not null default false,

  -- 记录创建时间（UTC）
  created_at   timestamp with time zone not null default timezone('utc', now())
);

-- ============================================================
-- 分类取值约束（单独添加，避免内联约束的兼容性问题）
-- ============================================================
alter table expenses
  add constraint chk_expenses_amount
    check (amount >= 0);

alter table expenses
  add constraint chk_expenses_category
    check (category in (
      'Food & Drink',
      'Transport',
      '住房',
      '数码',
      '旅行',
      '医疗',
      '学习',
      '运动',
      'Other'
    ));

-- ============================================================
-- 索引：加速按时间和分类查询
-- ============================================================
create index idx_expenses_created_at
  on expenses (created_at desc);

create index idx_expenses_category
  on expenses (category);

-- ============================================================
-- Row Level Security（RLS）
-- 目前关闭 RLS，允许匿名用户读写（开发/测试阶段）
-- ============================================================
alter table expenses disable row level security;

-- ============================================================
-- 种子数据（与前端 MOCK_EXPENSES 对应，可选）
-- ============================================================
insert into expenses (merchant, category, date, amount, icon, color) values
  ('Starbucks',      'Food & Drink', 'Oct 27, 2023', 5.40,   'Utensils',   'bg-orange-100'),
  ('Uber',           'Transport',    'Oct 27, 2023', 19.00,  'Car',        'bg-blue-100'),
  ('IKEA',           '住房',          'Oct 26, 2023', 89.20,  'Home',       'bg-indigo-100'),
  ('Apple Store',    '数码',          'Oct 25, 2023', 45.00,  'Smartphone', 'bg-purple-100'),
  ('Delta Airlines', '旅行',          'Sep 24, 2023', 215.50, 'Plane',      'bg-sky-100');
