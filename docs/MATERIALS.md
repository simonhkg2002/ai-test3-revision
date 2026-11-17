# 教材處理紀錄

更新：2026-11-17。24份 PDF，合計 710頁。逐份擷取後分批讀取；頁碼均為PDF頁次。

原PDF、完整擷取及圖頁只留本機 `.materials/`，不進公開repo。主線教材全文讀取；舊課按頁索引及相關重點閱讀，並非聲稱逐字讀完全部歷史／介面操作／每段程式。

| 教材 | 頁數 | 狀態 | 教學用途與限制 |
|---|---:|---|---|
| COMP3057-Lect-6-7-Assignment.pdf | 11 | 主線全文＋答案核對 | RNN state、shape、參數、LSTM gate、CE、state reset；課程 rnn/rnn-shape/lstm/language。 |
| COMP3057-Lect-6-7-Programming-Practice-Questions.pdf | 2 | 全文核對 | 11詞表、21/3句組合split；embedding16/hidden32、shift/reshape、validation不更新。未提供配套notebook。 |
| COMP3057-Lect-8-Attention-Practice.pdf | 10 | 全文＋簡答核對 | 20題情境及matrix；QKV分工、scale、projection、方向、debug；以原創變式重寫。 |
| Demo-07-Numeric-LSTM.pdf | 4 | 全文核對 | 數字序列MSE、(B,T,F) shapes、saved outputs不是重跑證明；不背某seed的輸出。 |
| Lab-02-Data.pdf | 6 | 全文核對 | HWC/BCHW、channel、slice、sliding windows、batch、device。 |
| Lab-03-Training-Answers.pdf | 4 | 全文核對 | Linear、MSE、zero_grad/backward/step、float target、no_grad；不重新訓練原run。 |
| Lab-04-CNN-Answers.pdf | 6 | 逐頁索引＋核心程式核對 | 2D filters、Conv2d、LeNet、feature shape、CE及訓練；沒有原ipynb可fresh-kernel驗證。 |
| Lect-1-Homework.pdf | 25 | 逐頁索引＋非歷史計算／程式重點核對 | tensor、neuron、loss、參數更新與Boolean logic；歷史題排除。完整題文只留本機。 |
| Lect-1-Lab-Handout.pdf | 20 | 逐頁索引＋tensor／更新相關頁核對 | rank/shape/dtype/device、index、reshape、stack/cat、點乘、gradient；Colab介面教學非考試主線。 |
| Lect-1.pdf | 69 | 逐頁索引＋概念重點核對 | 資料、參數、訓練／測試；人物／年份／歷史排除。 |
| Lect-2-Homework.pdf | 16 | 逐頁索引＋shape／window重點核對 | RGB元素、crop/slice、window=N-W、token算術；不用作當前價格資訊。 |
| lect-2.pdf | 75 | 逐頁索引＋資料重點核對 | ground truth、背景偏差、圖像數值、sequence次序、token、window、datasets。p14為圖頁，未逐圖解讀。 |
| Lect-3-1-Homework.pdf | 26 | 逐頁索引＋loss／update重點核對 | MSE/MAE、linear預測、曲線、手寫SGD；未附原notebook，不聲稱重跑原例。 |
| Lect-3-1.pdf | 69 | 逐頁索引＋核心頁核對 | 參數、MSE/MAE/Huber、SGD、train/test、under/overfit；Huber/SmoothL1比例差已提醒。 |
| Lect-3-2.pdf | 41 | 逐頁索引＋反傳計算頁核對 | absolute loss用sign(error)×x，chain rule、learning rate；與squared loss公式分清。 |
| Lect-6.pdf | 47 | 主線全文＋p31圖像核對 | sequence、RNN、time/layer/hidden、手寫及PyTorch shapes、LSTM/GRU；gate圖已視覺核對。 |
| Lect-7.pdf | 31 | 主線全文核對 | token、next-token、自監督shift、BOS/END、CE、多位置平均、logits reshape。新聞及歷史不出題。 |
| Lect-8-Attention.pdf | 52 | 主線全文核對 | QKV情境、projection、dot/scale/row-softmax/AV；unscaled與scaled答案分開。 |
| Lect-9-Transformer-v3.pdf | 25 | 主線全文＋p6架構圖核對 | embedding、position、FFN、LayerNorm、encoder/decoder、mask/cross；歷史／model年代不出題。 |
| Lect-CNN-Homework-Answers.pdf | 14 | 逐頁索引＋shape程式核對 | Conv/MaxPool/AvgPool/RGB及深層結構；相接channel與flatten題型。 |
| Lect-CNN.pdf | 75 | 逐頁索引＋核心計算頁核對 | 卷積、stride/padding、pool、Conv2d、分類scores/CE、sigmoid/tanh；歷史人物排除。 |
| Lect-DeepCNN-Concepts-Calculations-Homework.pdf | 12 | 主線全文＋答案核對 | 10題：小核、nonlinearity、gradient、dropout、residual、memory、topk、shape及operation order。 |
| Lect-DeepCNN-Training-Homework-Answers.pdf | 10 | 主線全文核對 | 訓練loop、weighted loss、eval/no_grad、best deepcopy、freeze/unfreeze、preprocess、fair comparison。 |
| Lect-DeepCNN.pdf | 60 | 主線全文核對 | CUDA實作、OOM、gradient、ReLU/dropout、VGG/ResNet與evaluation；不採p48的絕對保證語句。 |
