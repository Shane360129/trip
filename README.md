# Travel Log

文青風格的旅遊規劃 App — 像旅遊手冊一樣的翻頁式體驗。

## 開發

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # 產出 dist/
npm run typecheck
```

## 部署

Push 到 `main`（或 `claude/website-optimization-fMFuf`）時，GitHub Actions
會自動 build 並部署到 GitHub Pages。

首次使用前：
1. Repo Settings → Pages → Source 選 **"GitHub Actions"**
2. Firebase Console → Authentication → 啟用 **Anonymous** 登入
3. Firebase Console → Firestore Rules，貼上 `firestore.rules` 內容後 Publish

## 架構

- `src/types.ts` — 型別定義
- `src/firebase.ts` — Firebase 初始化 + 匿名登入
- `src/store/` — Zustand stores（tripStore 即時同步 Firestore；uiStore 控制 UI）
- `src/themes/` — 主題系統（Kraft / Vintage / Washi / Journal）
- `src/utils/migrate.ts` — 舊資料 → 新 schema 的相容轉換
- `src/components/BookLayout.tsx` — 章節色邊 + 頁眉頁腳 + 翻頁動畫
- `src/chapters/` — 各章節（Cover, TOC, Itinerary, Placeholder...）

## 路線圖

- **Phase 1**（已完成）— 基礎架構、Cover、TOC、Itinerary、主題、PWA
- **Phase 2** — 攻略/購物/分帳章節移植，行前清單、美食卡片、相簿
- **Phase 3** — Block-based 自由筆記頁、深度主題編輯器、貼紙拖曳、PDF 匯出

舊版單檔 App 保留在 `legacy/`。
