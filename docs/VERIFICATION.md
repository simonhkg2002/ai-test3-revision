# 驗證紀錄

更新：2026-11-17（香港）

## User story
訪客輸入 PIN → 讀一小節 → MC／計算核對或短答／code 自評 → 本機保存＋POST → D1 → 另一個登入裝置 GET 讀回 → UI 顯示同步進度。

## 已通過
- TypeScript：`npx tsc --noEmit`。
- Node 六組 tests：題庫完整性、36道固定數字題的獨立 oracle、空白／錯誤輸入、香港日期與重溫規則、離線／遠端紀錄合併、14個變式家族各100個seed。
- Vinext production build。
- Local API smoke：錯／對PIN、未登入401、跨origin403、bad event400、獨立cookie clients共用D1、同UUID重試不重複、logout失效。
- Browser UI：登入錯誤、首頁、逐節學習接MC、答錯、答對、提示、完整輪次結果、下一個題型、短答rubric、逐步數值、程式參考答案。
- 390×844 手機首頁、選單及計算題；沒有橫向overflow。桌面已視覺核對。未使用實體手機。
- Browser console：上述流程未見error。

## 限制
- 短答／code 是使用者自評；沒有執行使用者Python，亦沒有AI自動判卷。
- 六組測試不是對所有可能輸入的數學證明。沒有重跑原PDF的完整PyTorch訓練；原notebook未提供。
- 教材主線全文核對，舊課按頁索引及相關頁閱讀，詳細狀態見 MATERIALS.md。
- 共用PIN是簡單入口，非個人帳戶。原創課程內容公開。
- Local API 測試進度不會帶到production。正式網站已驗證PIN登入與D1 GET讀取，UI顯示「已同步」，正式進度為全新。

## 正式發佈後核對

- Sites原生部署結果：succeeded，version1，runtime env revision1。
- 正式URL已在瀏覽器開啟；PIN 4321登入成功，D1讀取成功，沒有console error。
- 390×844手機再次核對：closed drawer inert/aria-hidden；open drawer令背景inert且焦點正確；Escape可關閉。
- 已還原預設桌面viewport並保留正式網站tab。正式首頁截圖存於ignored outputs。
- GitHub已push main，API回報visibility=PUBLIC。沒有追蹤PDF、完整擷取、.dev.vars或.env檔。

## 2026-11-18：例子優先的教學修訂
- Unit01 拆為11節，單一數字／向量／矩陣用HTML格子展示；每節有不計分觀察題。
- 瀏覽器已測：錯誤選項有解釋、可重選；下一節不沿用上一題的已選答案；矩陣行列標籤及例題在窄畫面無橫向溢出。
- 7組Node tests、TypeScript及production build通過；數字題答案oracle保持通過。
- 全部單元先顯示既有worked example，再顯示概念解說。Unit01重新編寫；其餘單元未逐段重寫。
- 沒有修改正式練習題ID、評分規則或資料庫schema。
