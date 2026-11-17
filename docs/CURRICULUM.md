# 課程設計與出處

## 已知範圍與不確定性
2026-11-17 Simon 表示上次考至 CNN，推測今次是 CNN 之後；老師不考歷史。Test 2 要求數字 matrix 的中間步驟，Test 1 有概念及短程式修正。Simon 補充之前內容也不懂、沒有上課。因此建議從補底路線開始，但主要練習權重放在 CNN 之後。不把這個推測當作正式考試公告。沒有收到試卷、rubric 或配套 ipynb，不能驗證它們。

## 路線
1. Tensor、shape、matrix 與索引（Lab1/Lab2）
2. 神經元、參數、MSE/MAE、softmax/CE（Lect1、3-1、CNN）
3. 訓練、反向傳播、梯度下降（Lect3-1、3-2、Lab3）
4. CNN：逐格卷積、pool、flatten（LectCNN、Lab4）
5. Deep CNN：小核堆疊、shape、參數／運算量（DeepCNN Concepts）
6. Gradient、ReLU、dropout、residual（DeepCNN Concepts）
7. GPU、評估、checkpoint、fine-tuning（DeepCNN Training）
8. RNN：序列、共享參數、逐步狀態（Lect6/Assignment）
9. RNN：shape、readout、參數／state boundary（Lect6/Assignment）
10. LSTM、GRU：gate/state 分工與數值（Lect6/7、Assignment）
11. Next-token：shift、embedding、loss、reshape（Lect7、Demo、Programming Practice）
12. Attention：Q/K/V、dot、softmax、weighted mixture（Lect8、Practice）
13. Attention：完整 matrix、scale、projection、debug（Lect8、Practice）
14. Transformer：embedding、position、LayerNorm、FFN、encoder/decoder（Lect9）

每單元：短講解和 worked example → MC → 邏輯短答 → 數字逐步 → 程式修正 → 間隔重做。混合測驗是原創模擬，非老師試卷；沒有歷史／人物／年份題。

## 核對規則
- 原創小數值變式，附教材 PDF 頁次。
- MC／數值可自動評分；文字及 code 依參考答案及暫定 rubric 自評，不假裝 AI 自動理解／執行。
- 看提示／答案後答對不算獨立作答；不同日期再答對才累積穩定程度。
- 保留精確中間值，只在最後三位小數四捨五入。
- 不把 saved outputs 當成重新執行結果。

## 容易誤教、已修正的地方
- DeepCNN p48 用詞過強；採 homework p9：shortcut 減輕梯度問題，不保證永不消失；F=0 且末端有 ReLU 時全 block 不是所有輸入上的 identity。
- Lect3-2 用 absolute loss 的 sign(error)×x；不要誤套 MSE 的 2×error×x。
- nn.RNN 的兩條 bias 與手寫單 bias 計數分開；manual LSTM chunk 次序與 PyTorch internal gate 次序分開。
- scaled 與 unscaled attention 的數值分開；softmax 沿 key 的每一列，輸出向量不必總和為 1。
- HuberLoss 與 SmoothL1Loss 在一般 delta/beta 下有比例差，不一概視為相同。
- Transformer 講義介紹原始 post-norm encoder-decoder；GPT decoder-only，不能把所有模型當同一完整架構。
- 教材 token 價格只用作題設算術，不當成最新售價。
