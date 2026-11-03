// 从 Supabase 导出各模块题库到 data/<module>.json
// 用法：node build-static-data.js
// 后台增删题目后运行一次，再 git push，手机端即可直接加载题库，不再依赖 supabase.co
//
// 图片处理：数据库里的 Base64 图片会被拆成单独文件存到 img/sets/，
// JSON 里只保留相对路径，避免每套题的图挤在同一个 JSON 里拖慢手机加载。
const fs = require("fs");
const path = require("path");

const SUPABASE_URL = "https://zhfstrwlgrbhudggsesz.supabase.co";
const SUPABASE_KEY = "sb_publishable_Q6exosUWFwf1g9Lpzo9ugw_ylZdznuG";
const MODULES = ["general", "youth", "popular", "scenic", "trail"];
const OUT_DIR = path.join(__dirname, "data");
const IMG_DIR = path.join(__dirname, "img", "sets");

async function api(pathname) {
  const resp = await fetch(SUPABASE_URL + "/rest/v1/" + pathname, {
    headers: { apikey: SUPABASE_KEY, Authorization: "Bearer " + SUPABASE_KEY }
  });
  if (!resp.ok) throw new Error(pathname + " -> " + resp.status + " " + (await resp.text()));
  return resp.json();
}

// Base64 data URL → 独立文件；已是 http 链接则原样返回
function extractImage(value, filename) {
  if (!value) return "";
  if (!value.startsWith("data:")) return value;
  const m = /^data:image\/(\w+);base64,(.*)$/.exec(value);
  if (!m) return "";
  const ext = m[1] === "jpeg" ? "jpg" : m[1];
  const file = filename + "." + ext;
  if (!fs.existsSync(IMG_DIR)) fs.mkdirSync(IMG_DIR, { recursive: true });
  fs.writeFileSync(path.join(IMG_DIR, file), Buffer.from(m[2], "base64"));
  return "img/sets/" + file;
}

async function main() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR);

  for (const m of MODULES) {
    const sets = await api(
      "question_sets?select=id,name,module,science_image,science_text,perfect_poster_url,normal_poster_url,created_at" +
      "&module=eq." + m + "&order=created_at.asc"
    );
    const out = [];
    for (const s of sets) {
      const qs = await api(
        "questions?select=id,type,title,answer,options&set_id=eq." + s.id + "&order=created_at.asc"
      );
      if (!qs.length) continue;
      out.push({
        id: s.id,
        name: s.name,
        science_image: extractImage(s.science_image, s.id + "-science"),
        science_text: s.science_text || "",
        perfect_poster_url: extractImage(s.perfect_poster_url, s.id + "-perfect"),
        normal_poster_url: extractImage(s.normal_poster_url, s.id + "-normal"),
        questions: qs
      });
    }

    const file = path.join(OUT_DIR, m + ".json");
    fs.writeFileSync(file, JSON.stringify(out));
    const qc = out.reduce((n, s) => n + s.questions.length, 0);
    console.log(`${m}: ${out.length} 套 / ${qc} 题 → data/${m}.json (${(fs.statSync(file).size / 1024).toFixed(1)}KB)`);
  }

  // 版本号：entry.html 用它判断页面是否过期（GitHub Pages 会缓存 HTML 最多 10 分钟）
  const build = new Date().toISOString().replace(/[-:T.]/g, "").slice(0, 14);
  fs.writeFileSync(path.join(OUT_DIR, "version.json"), JSON.stringify({ build }));
  console.log("版本号:", build, "→ data/version.json");
}

main().catch(e => { console.error("导出失败:", e.message); process.exit(1); });
