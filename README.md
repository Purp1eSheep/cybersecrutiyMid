# Midterm Review

純靜態的刷題網站：Vite + React + TypeScript + Tailwind CSS，可掛在 GitHub Pages。沒有後端，所有進度存在瀏覽器的 localStorage。

> **注意**：`src/data/questions.json` 內建的 25 題是**示範資料**，不是教授提供的題目。拿到正式題目後請整份替換，再執行 `npm run validate`。

## 功能

- 三種模式：順序、隨機（題目與選項打亂）、錯題本
- 章節篩選（含「全部章節混合」）與「只練未作答」
- 單選、是非題；作答後立即顯示對錯、正確答案與詳解
- 錯題本：連續答對 2 次才移出，保留歷史錯誤次數
- 統計：總正確率、各章正確率、已作答題數、連續練習天數
- 續練：重新整理或關掉瀏覽器後，回到原本的模式與題號
- 深／淺色主題（預設深色，也可跟隨系統）、設定頁（主題與答對後自動下一題）、手機優先版面、鍵盤快捷鍵
- 建置前自動驗證題庫格式

## 開發

```bash
npm install
npm run dev
```

其他指令：

```bash
npm run validate   # 只驗證題庫
npm run typecheck  # TypeScript 檢查
npm run build      # validate + typecheck + 產生 dist/
npm run preview    # 預覽 dist/
```

## 修改題庫

1. 編輯 `src/data/questions.json`（格式見 [SCHEMA.md](./SCHEMA.md)）
2. 執行 `npm run validate`
3. 修正錯誤後 commit，push 即會重新部署

題庫是唯一的資料來源；網站沒有站內編輯器，正式流程就是「改檔 → 驗證 → commit」。

## 部署到 GitHub Pages

1. 建立 repo，把這個專案推上 `main`
2. 到 repo 的 **Settings → Pages → Build and deployment**，Source 選 **GitHub Actions**
3. push 後 `.github/workflows/deploy.yml` 會自動 build 並部署

`vite.config.ts` 使用 `base: './'`，因此掛在 `https://<user>.github.io/<repo>/` 子路徑也能正常運作。頁面已加上 `noindex`，不會被搜尋引擎索引。

## 鍵盤快捷鍵

| 按鍵 | 功能 |
| --- | --- |
| `1`–`4` | 選擇第 1–4 個選項（是非題為 `1`＝正確、`2`＝錯誤） |
| `Enter` | 確認答案；已公布答案時前往下一題 |
| `←` / `→` | 上一題／下一題 |

## 進度儲存

- localStorage key：`midterm-review:v1`
- 內容：每題作答次數／正確次數／連續答對次數、每日作答量、上次練習的佇列與題號、主題與練習設定
- 換裝置或清除瀏覽器資料後不會同步
- 「設定」頁可重設所有進度

## 專案結構

```
src/
├─ App.tsx                # 頁面切換、作答與進度狀態
├─ data/questions.json    # 題庫
├─ schema.ts              # zod 驗證規則
├─ types.ts
├─ lib/
│  ├─ questions.ts        # 章節、篩選
│  ├─ shuffle.ts          # 洗牌與固定選項
│  ├─ stats.ts            # 正確率、錯題規則、連續天數
│  └─ storage.ts          # localStorage 與主題
├─ components/
└─ pages/                 # Dashboard / Practice / WrongBook / Stats
scripts/validate.ts       # npm run validate
```

## 目前的限制

- 單一題庫、單選與是非題
- 沒有站內編輯器、Markdown、LaTeX、計時器、跨裝置同步
- 題目與選項是純文字；需要程式碼區塊時使用 `code` 欄位
