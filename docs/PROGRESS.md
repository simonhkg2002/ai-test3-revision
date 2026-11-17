# AI Test 3 — 接續工作記錄

更新：2026-11-17（香港）

## 先看這裡

- 專案：`/Users/simonwong/Documents/GitHub/ai-test3-revision`
- 公開 GitHub：https://github.com/simonhkg2002/ai-test3-revision
- 網站預定／部署網址：https://simon-ai-test3.simonhkg.chatgpt.site
- 簡單 PIN：4321；正式 PIN 與 session secret 在 Sites runtime secrets，沒有 commit 憑證。
- Sites ID：`appgprj_6afc0804d87081919dd3d1b5d1e0aa2c`，不可重建或猜測新 ID。
- 本地工作起點 `/Users/simonwong/Documents/ChatGPT/AI revision/README.md` 指向本專案。

## 使用者已確認的要求與補充

- 下星期Test3，確實日期未提供。
- 上次考至CNN，Simon推測今次是CNN之後；老師不考歷史。不能當成正式scope公告。
- Test2曾要求數字matrix的步驟變化；Test1為概念及幾行code修正。
- Simon之前內容也不懂、沒有上課：從零補底，再主攻CNN之後。
- 教授式逐步繁中解說，保留英文術語；MC→推理→計算→程式。
- 可跨裝置以連結及PIN使用、反覆做題、錯題回收、間隔重做。
- 太多教材：逐份處理並記在Markdown，讓新對話可接續。
- 參考網站 https://ruby-arch-bloom-clover.grok.me/ ：已瀏覽Desk與Idea。借鑑紙感、簡單導覽、逐步解說，沒有複製其程式或題庫。

## 已完成

- [x] 24份PDF逐份擷取，合計710頁；`.materials/inventory.json` 記錄SHA256、頁數、空字頁。
- [x] 逐份閱讀狀態寫入 MATERIALS.md。主線全文；舊課索引＋相關重點，沒有聲稱逐字讀完全部。
- [x] Lect6 p31 LSTM gate圖、Lect9 p6架構圖已render並視覺核對。
- [x] 14單元、120道原創題；14個可重抽數字的計算家族。
- [x] 短小教學、worked examples、提示、MC、matrix中間值、短答／code自評、混合小測。
- [x] 今日短練按已到達的學習進度挑新題，避免初學即隨機抽到進階題。
- [x] 錯題本、10分鐘／1日／3日／7日重溫、跨香港日期穩定判定。
- [x] PIN server-side session、D1 append-only events、UUID去重、本機待同步、JSON備份。
- [x] TypeScript、6組Node測試、36道數字題獨立oracle、1400個變式seed核對。
- [x] 本機API：兩個獨立cookie clients讀寫同一D1；重試不重複；拒絕未登入及跨origin寫入。
- [x] 桌面／390×844手機UI：登入、逐節教學→MC、錯誤／正確／提示、結果→下一階段、短答、計算、code。
- [x] 公開GitHub repository已建立。
- [x] Source commit已push至公開GitHub與Sites；production部署成功，PIN及D1讀取已驗證。

## 接續時不要重做

1. 先讀本文件、CURRICULUM.md、MATERIALS.md、VERIFICATION.md。
2. 教材來源：`/Users/simonwong/Downloads/AI test3`。完整擷取與render只在ignored `.materials/`。
3. 題庫來源：`scripts/author-course.py`；網站資料：`data/course.json`。內容修改後兩者同步。
4. 學習規則與變式：`lib/study.ts`；DB：`db/schema.ts`；append-only API：`app/api/events/route.ts`。
5. 前端：`app/desk.tsx`、`app/globals.css`；同步hook：`hooks/use-study.ts`。
6. 檢查：`node --experimental-strip-types --test tests/study.test.mjs`、`npx tsc --noEmit`。本機API smoke會建立測試資料，只可跑127.0.0.1。
7. 純短答與Python程式是自評，沒有AI判卷或程式執行，不可改寫成「已自動驗證你的程式」。
8. 發佈依Sites SKILL.md，重用`.openai/hosting.json`的project_id。正式runtime secrets不存檔；Git token只在session memory。
9. 原PDF、擷取文字、私人資料、runtime secrets、輸出archive不push公開GitHub。
10. 對話知識庫只讀了學習偏好；未獲確認，不寫入個人知識庫。

## 尚可改進但不阻擋使用

- 若老師正式公告scope或提供past paper，重新排序權重與對應rubric。
- 若Simon帶回做錯的真題，新增最小變式及針對性解說，保留來源／不確定性。
- 未取得課程ipynb，沒有fresh-kernel完整訓練驗證。
- 同步回應取最近20,000個events；若將來累積超過，改分頁。
- 已提交答案跨裝置；未提交草稿及正在做的輪次不跨裝置。

## 最終發佈紀錄

- 2026-11-17 17:08（香港）正式部署成功。
- URL：https://simon-ai-test3.simonhkg.chatgpt.site
- GitHub visibility：PUBLIC；branch：main。
- 發佈應用程式commit：`256aa51f6e12ce77941ee4eb0ae9d3db1fc8a830`。
- Sites version：1；deployment：`appgdep_6afc199cb318819185b891983ec6eb99`。
- 正式瀏覽器：無須ChatGPT登入即可到PIN頁；4321成功開桌，顯示「已同步」，進度保持全新。沒有把本機測試作答帶到正式資料庫。
- 手機收起選單後不會被鍵盤選到；開啟後焦點移到關閉鍵、Escape可收起。
- 正式預覽截圖：本機ignored `outputs/website-desktop.jpg`、`outputs/mobile.jpg`。
- 上述部署後只補充Markdown發佈／驗證紀錄；應用程式與資料庫schema不再變更。
