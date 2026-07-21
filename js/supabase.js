// Supabase 客户端初始化
const SUPABASE_URL = 'https://zhfstrwlgrbhudggsesz.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Q6exosUWFwf1g9Lpzo9ugw_ylZdznuG';

let supabase = null;
try {
  supabase = supabase || window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.log('Supabase 初始化成功', supabase);
} catch(e) {
  console.error('Supabase 初始化失败:', e);
}

// 确保全局可访问
if (typeof window !== 'undefined') {
  window._supabase = supabase;
}
