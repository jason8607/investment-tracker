<template>
  <div class="min-h-screen">
    <header class="bg-primary text-white p-4 shadow-md">
      <div class="container mx-auto flex justify-between items-center">
        <h1 class="text-xl md:text-2xl font-bold">投資損益小幫手</h1>
        <div class="flex space-x-2">
          <button
            @click="exportData"
            class="btn bg-secondary text-white text-sm px-3 py-1"
          >
            <span class="hidden md:inline">匯出資料</span>
            <span class="md:hidden">匯出</span>
          </button>
          <label
            class="btn bg-secondary text-white text-sm px-3 py-1 cursor-pointer"
          >
            <span class="hidden md:inline">匯入資料</span>
            <span class="md:hidden">匯入</span>
            <input
              type="file"
              accept=".xlsx"
              class="hidden"
              @change="importData"
            />
          </label>
        </div>
      </div>
    </header>

    <nav class="bg-white shadow-sm">
      <div class="container mx-auto">
        <ul class="flex">
          <li v-for="nav in navItems" :key="nav.path">
            <router-link
              :to="nav.path"
              class="block px-4 py-3 hover:bg-gray-100 transition-colors border-b-2"
              :class="
                $route.path === nav.path
                  ? 'border-primary text-primary font-medium'
                  : 'border-transparent'
              "
            >
              {{ nav.name }}
            </router-link>
          </li>
        </ul>
      </div>
    </nav>

    <main class="container mx-auto p-4">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <keep-alive>
            <component :is="Component" :key="$route.path" />
          </keep-alive>
        </transition>
      </router-view>
    </main>

    <footer class="bg-gray-100 text-gray-600 p-4 text-center text-sm">
      <p>投資損益小幫手 &copy; {{ new Date().getFullYear() }}</p>
    </footer>
  </div>
</template>

<script setup>
import * as XLSX from 'xlsx';
import { useStorage } from './utils/storage';

const { getStocks, getRealizedTrades, setStocks, setRealizedTrades } =
  useStorage();

const navItems = [
  { name: '持股管理', path: '/' },
  { name: '已實現收益', path: '/realized' },
  { name: '圖表分析', path: '/charts' },
];

// 匯出 Excel 檔案
const exportData = () => {
  // 創建工作簿
  const wb = XLSX.utils.book_new();

  // 取得資料
  const stocks = getStocks();
  const realized = getRealizedTrades();

  // 轉換持股資料為工作表
  const stocksData = stocks.map((stock) => ({
    股票代碼: stock.symbol,
    股票名稱: stock.name,
    市場: stock.market,
    成本價: stock.cost,
    數量: stock.quantity,
    購買日期: stock.purchaseDate,
  }));

  // 轉換已實現收益資料為工作表
  const realizedData = realized.map((trade) => ({
    股票代碼: trade.symbol,
    股票名稱: trade.name,
    賣出價格: trade.sellPrice,
    數量: trade.quantity,
    成本: trade.cost,
    實現損益: trade.profit,
    日期: trade.date,
  }));

  // 添加工作表到工作簿
  const stocksSheet = XLSX.utils.json_to_sheet(stocksData);
  const realizedSheet = XLSX.utils.json_to_sheet(realizedData);

  XLSX.utils.book_append_sheet(wb, stocksSheet, '持股紀錄');
  XLSX.utils.book_append_sheet(wb, realizedSheet, '已實現收益');

  // 匯出檔案
  XLSX.writeFile(wb, '投資損益資料.xlsx');
};

// 匯入 Excel 檔案
const importData = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const data = new Uint8Array(e.target.result);
    const wb = XLSX.read(data, { type: 'array' });

    // 讀取持股工作表
    const stocksSheet = wb.Sheets['持股紀錄'];
    if (stocksSheet) {
      const stocksData = XLSX.utils.sheet_to_json(stocksSheet);
      const stocks = stocksData.map((row) => ({
        symbol: row['股票代碼'],
        name: row['股票名稱'],
        market: row['市場'],
        cost: parseFloat(row['成本價']),
        quantity: parseInt(row['數量']),
        purchaseDate: row['購買日期'],
      }));
      setStocks(stocks);
    }

    // 讀取已實現收益工作表
    const realizedSheet = wb.Sheets['已實現收益'];
    if (realizedSheet) {
      const realizedData = XLSX.utils.sheet_to_json(realizedSheet);
      const realized = realizedData.map((row) => ({
        symbol: row['股票代碼'],
        name: row['股票名稱'],
        sellPrice: parseFloat(row['賣出價格']),
        quantity: parseInt(row['數量']),
        cost: parseFloat(row['成本']),
        profit: parseFloat(row['實現損益']),
        date: row['日期'],
      }));
      setRealizedTrades(realized);
    }

    // 重置檔案選擇
    event.target.value = '';

    // 顯示成功訊息
    alert('資料匯入成功！');
  };

  reader.readAsArrayBuffer(file);
};
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
