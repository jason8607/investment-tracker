# 投資損益小幫手 - GitHub Pages 部署教學

本教學將指導你如何將「投資損益小幫手」部署到 GitHub Pages，讓你可以通過網路隨時訪問你的投資追蹤工具。

## 方法一：使用已構建好的檔案（最簡單）

### 步驟 1：建立 GitHub 帳號

如果你還沒有 GitHub 帳號，請先在 [GitHub](https://github.com/) 上註冊。

### 步驟 2：創建新倉庫

1. 登入 GitHub 後，點擊右上角「+」按鈕，選擇「New repository」
2. 倉庫名稱填寫 `investment-tracker`（或你喜歡的名稱）
3. 設置為「Public」（如果想設為私有，需要額外設置）
4. 點擊「Create repository」

### 步驟 3：上傳檔案

1. 在新建的倉庫頁面，點擊「uploading an existing file」連結
2. 將 `dist` 目錄中的所有檔案拖放到上傳區域（**注意：是 dist 目錄中的檔案，不是 dist 目錄本身**）
3. 點擊「Commit changes」按鈕

### 步驟 4：啟用 GitHub Pages

1. 在倉庫頁面，點擊「Settings」標籤
2. 在左側菜單中找到「Pages」
3. 在「Source」部分，從「Branch」下拉選單中選擇「main」
4. 點擊「Save」按鈕

### 步驟 5：訪問你的網站

GitHub Pages 啟用後（通常需要幾分鐘），你就可以通過以下網址訪問你的投資損益小幫手：

```
https://你的用戶名.github.io/investment-tracker/
```

## 方法二：從源碼構建並部署（適合開發者）

### 步驟 1：克隆倉庫

```bash
git clone https://github.com/你的用戶名/investment-tracker.git
cd investment-tracker
```

### 步驟 2：安裝依賴並構建

```bash
npm install
npm run build
```

### 步驟 3：部署到 GitHub Pages

可以使用 gh-pages 套件來簡化部署過程：

```bash
# 安裝 gh-pages 套件
npm install --save-dev gh-pages

# 添加部署腳本到 package.json
# 在 "scripts" 部分添加: "deploy": "gh-pages -d dist"

# 執行部署
npm run deploy
```

之後，你的網站就會被部署到 GitHub Pages 的 gh-pages 分支上。

## 常見問題

### 1. 股價資料不更新

由於 CORS 限制，在本地直接打開 HTML 檔案時，股價即時更新功能可能無法正常工作。請確保你是通過 HTTP/HTTPS 訪問應用，例如使用 GitHub Pages。

### 2. 如何備份我的資料？

點擊頁面頂部的「匯出資料」按鈕，可以下載一個 Excel 檔案，其中包含你的所有持股和已實現收益記錄。

### 3. 如何還原備份？

點擊頁面頂部的「匯入資料」按鈕，然後選擇之前匯出的 Excel 檔案即可還原資料。

### 4. 部署後網站顯示空白頁面

如果部署後訪問網址顯示空白頁面，請檢查瀏覽器控制台是否有錯誤提示。常見原因包括：

- 資源路徑問題：確保 `vite.config.js` 中設置了正確的 `base` 路徑
- CORS 錯誤：某些瀏覽器對本地存儲有嚴格限制，嘗試使用無痕模式或其他瀏覽器

### 5. 如何更新已部署的應用？

只需重復上述步驟，重新上傳新版本的構建檔案即可替換舊版本。 