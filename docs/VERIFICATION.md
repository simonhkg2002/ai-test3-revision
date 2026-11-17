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
- Local API 測試進度不會帶到production；production發佈後另作登入／讀取檢查。
