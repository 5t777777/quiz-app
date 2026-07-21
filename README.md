# 答题助手 — 纯网页版

> 无需微信小程序、无需服务器、扫码即用、免费部署

## 功能

- 📝 电脑端管理后台：创建题库套装、上传海报、逐条录入题目、CSV 批量导入
- 🎲 随机派题：用户打开网页随机分配一套题目
- 📋 支持单选、多选、判断题
- ✅ 即时评分：提交后立刻出分，逐题对照答案
- 🏆 海报自动生成：满分金色海报 + 非满分绿色海报
- 📱 移动端优化：大按钮适合手机触控
- 📤 微信扫码：自动生成二维码，微信扫一扫即可答题

## 部署步骤（5 分钟）

### 1. 注册 Supabase（免费数据库）

1. 打开 [supabase.com](https://supabase.com) → 用 GitHub 账号登录
2. 点击「New project」→ 输入项目名 → 设置数据库密码 → 选择地区（Asia Pacific 最快）→ Create
3. 等待数据库创建完成（约 1 分钟）
4. 进入项目 → Settings → API → 复制 **URL** 和 **anon public key**
5. SQL Editor → 新建查询 → 粘贴 `supabase-schema.sql` 全部内容 → 点击 Run
6. Storage → 新建 Bucket → 名称填 `posters` → 勾选「Public bucket」→ Create

### 2. 配置代码

编辑 `js/supabase.js`，替换以下两行：

```js
const SUPABASE_URL = 'https://abc123.supabase.co';  // 你的 Supabase URL
const SUPABASE_ANON_KEY = 'eyJhbG...';               // 你的 anon key
```

### 3. 部署到 Vercel（免费托管）

1. 把整个 `quiz-web` 文件夹推送到 GitHub 仓库
2. 打开 [vercel.com](https://vercel.com) → 用 GitHub 登录
3. 点击「Import」→ 选择你的仓库 → Deploy
4. 部署成功后获得域名如 `https://quiz-xxx.vercel.app`

### 4. 使用

- **管理员电脑打开** `https://你的域名/admin.html`
  - 创建题库套装、上传海报
  - 逐条添加题目或 CSV 批量导入
- **用户手机扫码** → 自动进入首页 → 开始答题
- 答题完成自动出分 + 生成海报

## CSV 批量导入格式

```csv
题目,题型,正确答案,选项A,选项B,选项C,选项D
微信在哪一年上线？,单选,B,2012年,2011年,2013年,2014年
微信支持哪些功能？,多选,AB,聊天,支付,看视频,玩游戏
微信是腾讯的产品,判断,A,正确,错误
```

- 题型：`单选` / `多选` / `判断`
- 单选答案写一个字母（如 `B`）
- 多选答案写多个字母连在一起（如 `AB`、`ACD`）
- 判断答案（`A`=正确, `B`=错误）

## 海报配置

- 可以在管理后台为每个套装上传两张海报
- **满分海报**：得 100 分时展示
- **鼓励海报**：未满分时展示
- 如果不传海报，系统自动生成纯色背景海报

## 项目文件结构

```
quiz-web/
├── index.html          # 首页：答题入口 + 二维码
├── quiz.html           # 答题页（移动端优化）
├── result.html         # 结果页 + Canvas 海报生成
├── admin.html          # 管理后台（套装 + 题目 + 记录）
├── css/common.css      # 公共样式
├── js/supabase.js      # Supabase 连接配置
├── supabase-schema.sql # 数据库建表 SQL
├── vercel.json         # Vercel 配置
└── README.md
```
