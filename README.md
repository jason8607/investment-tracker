# 投資損益小幫手

一個簡單易用的股票投資損益追蹤工具，可計算未實現與已實現收益、產生圖表分析。

## 功能特點

- 🔄 即時股價追蹤（台股、美股）
- 💹 未實現損益計算
- 💰 手動輸入已實現收益記錄
- 📊 圖表分析（持股佔比、總體損益、已實現收益趨勢）
- 📥 匯入 Excel 資料
- 📤 匯出 Excel 備份
- 📱 手機、平板、電腦均可使用（響應式設計）

## 使用工具

- Vue 3 + Composition API
- Tailwind CSS
- Chart.js
- SheetJS（Excel 匯入/匯出）
- Yahoo Finance API（股價資料）

## 本地開發

```bash
# 安裝依賴
npm install

# 啟動開發服務器
npm run dev

# 構建生產版本
npm run build
```

## 部署到 GitHub Pages 教學

1. **建立 GitHub 倉庫**

   在 GitHub 上建立一個新的倉庫，例如：`investment-tracker`

2. **設定 Pages**

   - 在 GitHub 倉庫頁面，點擊 `Settings` -> `Pages`
   - 在 `Source` 部分，選擇 `Deploy from a branch`
   - 在 `Branch` 部分，選擇 `main` 分支和 `/docs` 或 `/` 目錄（取決於你上傳的位置）
   - 點擊 `Save`

3. **構建專案**

   在本地執行構建命令：

   ```bash
   npm run build
   ```

4. **準備部署檔案**

   方法一（直接使用 dist 資料夾）：
   - 將生成的 `dist` 目錄重命名為 `docs`
   - 將 `docs` 資料夾上傳到 GitHub 倉庫的根目錄

   方法二（使用 `gh-pages` 分支）：
   - 創建一個名為 `gh-pages` 的新分支
   - 將 `dist` 資料夾中的所有檔案移動到這個分支的根目錄
   - 推送該分支到 GitHub

5. **訪問你的網站**

   部署完成後，就可以通過以下網址訪問你的網站：
   `https://你的用戶名.github.io/倉庫名稱/`

## 快速部署方法

1. **下載本專案的打包檔案**

   下載 `dist.zip`（其中包含所有已構建好的靜態檔案）

2. **創建 GitHub 倉庫**

   在 GitHub 上創建新倉庫，例如 `investment-tracker`

3. **上傳檔案**

   - 解壓 `dist.zip` 檔案
   - 將解壓出的檔案上傳到 GitHub 倉庫
   - 在 GitHub 倉庫設置中啟用 Pages 功能，選擇 `main` 分支和根目錄

4. **完成！**

   幾分鐘後，你的投資損益小幫手就可以通過 `https://你的用戶名.github.io/investment-tracker/` 訪問了。

## 本地使用說明

如果不想部署到網路上，也可以直接在本機上使用：

1. 下載打包好的 `dist.zip` 檔案
2. 解壓到任意資料夾
3. 用瀏覽器直接開啟 `index.html` 檔案即可使用
   
注意：由於瀏覽器安全限制，某些功能（如股價即時更新）在直接開啟 HTML 檔案時可能無法正常工作。如果要完整使用所有功能，建議使用 GitHub Pages 或其他網頁伺服器。 