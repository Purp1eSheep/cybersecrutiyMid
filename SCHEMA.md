# 題庫格式規格

題庫只有一個檔案：`src/data/questions.json`。網站建置時會直接把它打包進去，所以格式錯誤會在 `npm run validate` 或 `npm run build` 時被擋下來。

## 給另一個 AI 的產題提示詞（可直接複製）

> 請把以下題目整理成 JSON，並嚴格遵守：
>
> - 檔案結構為 `{ "meta": { "title": string, "version": number, "updated": "YYYY-MM-DD" }, "questions": [...] }`
> - 每題欄位：`id`、`type`、`chapter`、`source`（可選）、`question`、`code`（可選）、`options`（僅單選）、`answer`、`explanation`（可選）、`fixedOptions`（可選）
> - `type` 只能是 `"single"`（單選）或 `"tf"`（是非）；**不要產生多選題**
> - `answer` 一律是陣列，且**剛好一個元素**：單選放選項 key，例如 `["B"]`；是非題放 `["T"]` 或 `["F"]`
> - 單選題的 `options` 是 `[{ "key": "A", "text": "..." }, ...]`，key 不可重複
> - 是非題**不要**提供 `options`
> - 不要使用 Markdown、HTML、LaTeX。題目與選項都是純文字；需要程式碼或指令時放進 `code` 欄位（用 `\n` 換行）
> - `id` 使用 `q001`、`q002`… 格式，**全題庫唯一且不要重複使用**（進度與錯題本用 id 對應）
> - `chapter` 請沿用原始題目清單的分類名稱，同一章節的字串必須完全一致
> - 若選項包含「以上皆是／以上皆非」，請放在最後一個，並在 `fixedOptions` 填入它的 key（例如 `["D"]`）
> - 輸出必須是合法 JSON：不能有註解、不能有結尾逗號
>
> 完成後請確認 `answer` 指向的 key 真的存在於 `options` 中。

## 完整範例

```json
{
  "meta": {
    "title": "資安期中考題庫",
    "version": 1,
    "updated": "2026-10-19"
  },
  "questions": [
    {
      "id": "q001",
      "type": "single",
      "chapter": "密碼學",
      "source": "期中考題庫 p.3 #12",
      "question": "下列何者「不是」雜湊函數的特性？",
      "code": null,
      "options": [
        { "key": "A", "text": "單向性（不可逆）" },
        { "key": "B", "text": "固定長度的輸出" },
        { "key": "C", "text": "相同輸入必定得到相同輸出" },
        { "key": "D", "text": "可用金鑰還原原始訊息" }
      ],
      "answer": ["D"],
      "explanation": "雜湊函數是單向的，無法從雜湊值還原原始訊息。"
    },
    {
      "id": "q002",
      "type": "tf",
      "chapter": "存取控制",
      "question": "多因素驗證（MFA）可以降低密碼外洩後被冒用的風險。",
      "answer": ["T"],
      "explanation": "即使密碼外洩，攻擊者仍缺少其他驗證因素。"
    }
  ]
}
```

## 欄位說明

| 欄位 | 必填 | 說明 |
| --- | --- | --- |
| `meta.title` | ✓ | 題庫名稱，顯示在首頁 |
| `meta.version` | ✓ | 正整數，自行遞增 |
| `meta.updated` | | 日期字串，顯示在首頁 |
| `questions[].id` | ✓ | 全題庫唯一。**不要重複使用舊 id 給新題目**，否則統計會對到錯的題目 |
| `questions[].type` | ✓ | `"single"` 或 `"tf"` |
| `questions[].chapter` | | 章節名稱。省略時歸類為「未分類」 |
| `questions[].source` | | 出處，例如「課本 p.42 #7」 |
| `questions[].question` | ✓ | 題目本文，純文字，可包含換行 |
| `questions[].code` | | 程式碼／指令區塊，以等寬字顯示；用 `\n` 換行 |
| `questions[].options` | 單選必填 | 至少兩個選項，`key` 不可重複 |
| `questions[].answer` | ✓ | 長度必須為 1 的陣列 |
| `questions[].explanation` | | 詳解，作答後顯示 |
| `questions[].fixedOptions` | | 不參與洗牌的選項 key；通常用於「以上皆是」 |

## 驗證規則

`npm run validate` 會檢查：

- JSON 是否可解析
- `id` 是否重複
- `type` 是否合法
- 單選題是否至少兩個選項、選項 key 是否重複
- `answer` 是否指向存在的選項
- 是非題是否誤帶 `options`、`answer` 是否為 `T` / `F`
- `fixedOptions` 是否指向存在的選項

Build 前會自動執行驗證，GitHub Actions 因此不會部署壞掉的題庫。

## 洗牌與「以上皆是」

- 隨機模式會打亂題目順序與選項順序；順序模式保留原始順序。
- 選項文字符合「以上皆是／以上皆非／兩者皆是／兩者皆非／以上皆對／全部皆是／全部皆非／all of the above／none of the above」時，會自動固定在最後。
- 自動偵測抓不到時，用 `fixedOptions` 指定。

## 題型限制

目前只支援單選與是非。若之後出現多選題，需要同時修改 `src/types.ts`、`src/schema.ts`、作答與批改邏輯，不是只改 JSON 就能支援。
