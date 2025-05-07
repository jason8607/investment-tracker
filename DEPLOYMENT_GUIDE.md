# Yahoo Finance API代理服務部署指南

本指南將幫助您在Vercel上部署Yahoo Finance API代理服務，解決前端應用的CORS跨域問題。

## 部署到Vercel（推薦）

### 方法一：使用Vercel CLI

1. **安裝Vercel CLI**

```bash
npm install -g vercel
```

2. **登入Vercel**

```bash
vercel login
```

3. **部署項目**

```bash
cd investment-tracker  # 進入項目目錄
vercel                 # 部署到Vercel
```

4. **按照提示操作**
   - 選擇您的Vercel帳戶
   - 確認項目設置（通常接受默認值即可）
   - 等待部署完成

5. **禁用Vercel的身份驗證要求（重要！）**
   - 登入[Vercel儀表板](https://vercel.com/dashboard)
   - 選擇您的項目
   - 點擊「Settings」標籤
   - 從左側菜單選擇「Authentication」
   - 關閉「Require Authentication」選項
   - 儲存設置

### 方法二：使用GitHub和Vercel集成

1. **創建GitHub儲存庫**
   - 將代碼推送到新的或現有的GitHub儲存庫

2. **連接Vercel和GitHub**
   - 登入[Vercel](https://vercel.com/)
   - 點擊「New Project」
   - 選擇您的GitHub儲存庫
   - 點擊「Import」

3. **配置部署設置**
   - 框架預設：選擇「Other」
   - 根目錄：保持空白或指定後端代碼所在的目錄
   - 構建命令：`npm install`
   - 輸出目錄：保持空白
   - 點擊「Deploy」

4. **禁用身份驗證要求（同上）**

## 在其他平台部署

如果您在Vercel上遇到身份驗證問題，可以考慮以下替代方案：

### Render.com（推薦替代方案）

1. 註冊[Render](https://render.com/)帳戶
2. 創建新的Web Service
3. 連接您的GitHub儲存庫或直接上傳代碼
4. 設置構建命令：`npm install`
5. 設置啟動命令：`npm start`
6. 選擇免費計劃並部署

### Heroku

1. 創建`Procfile`文件，內容為：`web: node index.js`
2. 安裝[Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)
3. 登入Heroku：`heroku login`
4. 創建應用：`heroku create`
5. 部署：`git push heroku main`

## 測試部署

部署完成後，您可以通過以下方式測試API：

1. **健康檢查**
   - 訪問 `https://您的域名/health`
   - 應返回 `{"status":"healthy","time":"當前時間"}`

2. **測試單個股票**
   - 訪問 `https://您的域名/api/stock/AAPL`
   - 應返回蘋果公司的股票數據

3. **測試多個股票**
   - 訪問 `https://您的域名/api/stocks?symbols=AAPL,MSFT,2330.TW`
   - 應返回多支股票的數據

## 常見問題排解

### 1. 收到429錯誤（Too Many Requests）

- 這表示Yahoo Finance API對請求頻率進行了限制
- 解決方案:
  - 使用不同的IP地址（例如，不同的部署平台）
  - 減少請求頻率
  - 增加緩存時間（已設置為10分鐘）

### 2. 部署成功但API返回錯誤

- 檢查部署日誌
- 確認所有依賴已正確安裝
- 嘗試在本地測試API

### 3. Vercel身份驗證問題

- 確保您已按照上述說明禁用了Vercel的身份驗證要求
- 如果仍有問題，考慮使用Render.com等替代平台

## 前端整合

部署成功後，在前端應用中：

1. 更新API基礎URL
   - 打開`src/utils/stockApi.js`
   - 將`API_BASE_URL`更新為您的部署URL

2. 重新構建並部署前端應用 