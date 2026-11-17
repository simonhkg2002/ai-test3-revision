# Loop — AI Test 3 溫習桌

從零補底的 COMP3057 溫習網站。繁體中文解釋、英文術語；以 CNN 之後為主線，保留必要基礎，不設歷史題。

- 14 個單元、120 道原創題目，另有 14 組可換數字的計算題。
- 概念與 worked example → MC → 邏輯短答 → 逐步 matrix／數值 → code 修正。
- 每日短練、錯題重做、混合小測、公式速查、七日計劃。
- PIN 登入、雲端共用進度、本機待同步佇列、進度 JSON 備份。
- 不把一次答對當掌握；提示與自評獨立標記，跨香港日期重測。

網站：https://simon-ai-test3.simonhkg.chatgpt.site

簡單 PIN：`4321`。這是共用學習桌，持同一 PIN 者可讀寫同一進度；公開 source code 的課程內容不受 PIN 保密。不要用來保存私密資料。

## 第一次使用

1. 輸入 PIN，點「繼續學習」，由 Unit 01 開始。
2. 一次只讀一小節，再用自己的話講一次。
3. 看完例子後做 MC，再依序練短答、計算及 code。
4. 每天先做一輪錯題；換數字重算，隔日再閉卷重做。
5. 換裝置前確認頂部顯示「已同步」。未提交的答題草稿留在當前頁面；已提交的進度跨裝置同步。

MC／數值自動核對。短答與程式提供參考答案及暫定評分點，由使用者自評，瀏覽器不執行 Python。沒有連接付費 AI API。

## 教材與續接

- [進度與下一次接續](docs/PROGRESS.md)
- [逐份教材處理紀錄](docs/MATERIALS.md)
- [課程設計、出處與限制](docs/CURRICULUM.md)
- [驗證紀錄](docs/VERIFICATION.md)

原始 24 份 PDF 和完整擷取只保留在使用者本機，不包含於公開 repository。頁碼指原 PDF 頁次。Test 3 範圍以學生回憶推測，並非老師正式公告；未取得配套 ipynb、考卷或評分準則。

## 本機啟動

Node >=22.13（測試腳本使用 Node24 原生 TypeScript）；`npm ci` 後：

```sh
npm run build
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_left_eternity.sql
npm start -- --port 5173 --var STUDY_PIN:4321 --var SESSION_SECRET:local-preview-only
```

上方 secret 只作本機預覽；正式環境須用獨立長隨機值，存於 hosting 的 runtime secrets。不要 commit `.dev.vars` 或正式憑證。Local D1 與 production 分開，migration 只在新本機資料庫執行一次。

```sh
node --experimental-strip-types --test tests/study.test.mjs
npx tsc --noEmit
python3 tests/api-smoke.py
```

API smoke 只對 `127.0.0.1:5173` 的本機資料庫建立測試紀錄。正式網站由 Sites 發佈；`.openai/hosting.json` 保留網站 ID，D1 schema-only migration 在部署時套用。

`data/course.json` 是網站題庫；`scripts/author-course.py` 是其可重建來源。改內容時更新兩者，再執行數值 oracle 測試。`.materials/`、`outputs/`、build 及 runtime state 均不入 Git。
