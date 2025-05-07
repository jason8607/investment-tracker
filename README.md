# 投資損益小幫手

一個簡單易用的股票投資損益追蹤工具，可計算未實現與已實現收益、產生圖表分析。

![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/jason8607/investment-tracker/deploy.yml?branch=main&label=自動部署)
![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-已部署-success)

## 功能特點

- 🔄 即時股價追蹤（台股、美股）
- 💹 未實現損益計算
- 💰 手動輸入已實現收益記錄
- 📊 圖表分析（持股佔比、總體損益、已實現收益趨勢）
- 📥 匯入 Excel 資料
- 📤 匯出 Excel 備份
- 📱 手機、平板、電腦均可使用（響應式設計）

## 線上體驗

訪問 [https://jason8607.github.io/investment-tracker/](https://jason8607.github.io/investment-tracker/) 立即使用。

## 技術棧

- Vue 3 + Composition API
- Tailwind CSS
- Chart.js
- SheetJS（Excel 匯入/匯出）
- Yahoo Finance API（股價資料）
- GitHub Actions（自動部署）

## 本地開發

```bash
# 安裝依賴
npm install

# 啟動開發服務器
npm run dev

# 構建生產版本
npm run build
```

## 部署說明

本專案使用 GitHub Actions 實現自動化部署，支持以下工作流程：

1. **開發與提交**
   - 修改源代碼
   - 使用 Git 提交並推送到 main 分支：
     ```bash
     git add .
     git commit -m "您的提交信息"
     git push origin main
     ```

2. **自動部署**
   - GitHub Actions 自動觸發構建流程
   - 構建完成後自動部署到 GitHub Pages
   - 無需手動操作

3. **部署狀態檢查**
   - 在 GitHub 倉庫頁面點擊 "Actions" 標籤
   - 查看最新的工作流執行狀態和日誌

4. **訪問部署站點**
   - 部署完成後，可通過 `https://jason8607.github.io/investment-tracker/` 訪問

## 舊方法（已棄用）

以下是手動部署的方法，僅作參考：

<details>
<summary>點擊展開查看舊的部署方法</summary>

### 手動部署到 GitHub Pages

1. **構建專案**：`npm run build`
2. **準備部署檔案**
   - 方法一：將 `dist` 重命名為 `docs` 並上傳
   - 方法二：使用單獨的 `gh-pages` 分支
3. **設定 GitHub Pages**：在 Settings > Pages 中配置

### 快速部署方法

1. 下載打包好的 `dist.zip` 檔案
2. 解壓並上傳到 GitHub 倉庫
3. 啟用 GitHub Pages 功能

</details>

## 本地使用說明

如果不想部署到網路上，也可以直接在本機上使用：

1. 從 [Releases](https://github.com/jason8607/investment-tracker/releases) 下載最新發布版本
2. 解壓到任意資料夾
3. 用瀏覽器直接開啟 `index.html` 檔案

> **注意**：由於瀏覽器安全限制，某些功能（如股價即時更新）在直接開啟 HTML 檔案時可能無法正常工作。如果要完整使用所有功能，建議使用 GitHub Pages 或其他網頁伺服器。

## 授權

MIT 授權 © 2023 Jason 