<template>
  <div>
    <h2 class="text-xl font-bold mb-4">持股管理</h2>

    <!-- 持股總覽卡片 -->
    <div class="card bg-white p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="p-3 bg-gray-50 rounded-lg">
          <h3 class="text-gray-500 text-sm">總投資成本</h3>
          <p class="text-lg font-semibold">{{ formatMoney(totalCost) }}</p>
        </div>
        <div class="p-3 bg-gray-50 rounded-lg">
          <h3 class="text-gray-500 text-sm">目前總市值</h3>
          <p class="text-lg font-semibold">{{ formatMoney(totalValue) }}</p>
        </div>
        <div class="p-3 bg-gray-50 rounded-lg">
          <h3 class="text-gray-500 text-sm">未實現損益</h3>
          <p class="text-lg font-semibold" :class="getPriceClass(totalProfit)">
            {{ totalProfit > 0 ? '+' : '' }}{{ formatMoney(totalProfit) }}
            <span class="text-sm">
              ({{ totalProfitPercentage > 0 ? '+' : ''
              }}{{ totalProfitPercentage.toFixed(2) }}%)
            </span>
          </p>
        </div>
      </div>
    </div>

    <!-- 新增股票按鈕 -->
    <div class="flex justify-between items-center mb-4">
      <button @click="showAddForm = true" class="btn btn-primary">
        + 新增持股
      </button>
      <div class="flex items-center">
        <span class="text-sm text-gray-500 mr-3"
          >匯率: 1 USD = {{ exchangeRate.toFixed(2) }} TWD</span
        >
        <button
          @click="refreshPrices"
          class="btn bg-gray-100 text-gray-700 flex items-center"
        >
          <span class="mr-1">更新價格</span>
          <span v-if="loading" class="inline-block animate-spin">⟳</span>
        </button>
      </div>
    </div>

    <!-- 持股列表 -->
    <div class="card">
      <div v-if="stocks.length === 0" class="text-center py-6 text-gray-500">
        尚未新增持股資料，請點擊「新增持股」按鈕開始追蹤。
      </div>
      <div v-else class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>代碼</th>
              <th>名稱</th>
              <th>市場</th>
              <th>持有股數</th>
              <th>成本價</th>
              <th>目前價格</th>
              <th>市值</th>
              <th>損益</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(stock, index) in stocks" :key="index">
              <td>{{ stock.symbol }}</td>
              <td>{{ stock.name }}</td>
              <td>{{ stock.market }}</td>
              <td>{{ stock.quantity }}</td>
              <td>{{ formatPrice(stock.cost) }}</td>
              <td :class="getPriceClass(getStockChange(stock))">
                {{ formatStockPrice(stock) }}
              </td>
              <td>
                {{
                  getStockPrice(stock)
                    ? formatMoney(stock.quantity * getStockValuePrice(stock))
                    : '載入中...'
                }}
              </td>
              <td
                :class="getStockProfitClass(stock, getStockValuePrice(stock))"
              >
                {{ getStockProfit(stock, getStockValuePrice(stock)) }}
              </td>
              <td>
                <div class="flex space-x-2">
                  <button
                    @click="editStock(index)"
                    class="text-primary text-sm"
                  >
                    編輯
                  </button>
                  <button
                    @click="deleteStockConfirm(index)"
                    class="text-danger text-sm"
                  >
                    刪除
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 新增持股表單 -->
    <div
      v-if="showAddForm"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10"
    >
      <div class="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 class="text-lg font-bold mb-4">
          {{ editIndex === null ? '新增持股' : '編輯持股' }}
        </h3>
        <form @submit.prevent="saveStock">
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1">股票代碼</label>
            <input
              v-model="stockForm.symbol"
              required
              class="input w-full"
              placeholder="例如：2330.TW 或 AAPL"
            />
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1">股票名稱</label>
            <input
              v-model="stockForm.name"
              required
              class="input w-full"
              placeholder="例如：台積電 或 蘋果"
            />
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1">市場</label>
            <select v-model="stockForm.market" required class="input w-full">
              <option value="台股">台股</option>
              <option value="美股">美股</option>
              <option value="其他">其他</option>
            </select>
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1">成本價</label>
            <input
              v-model.number="stockForm.cost"
              type="number"
              step="0.01"
              required
              class="input w-full"
              placeholder="每股成本"
            />
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1">持有股數</label>
            <input
              v-model.number="stockForm.quantity"
              type="number"
              required
              class="input w-full"
              placeholder="持有數量"
            />
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1">購買日期</label>
            <input
              v-model="stockForm.purchaseDate"
              type="date"
              class="input w-full"
            />
          </div>
          <div class="flex justify-end space-x-3">
            <button
              type="button"
              @click="cancelForm"
              class="btn bg-gray-200 text-gray-800"
            >
              取消
            </button>
            <button type="submit" class="btn btn-primary">儲存</button>
          </div>
        </form>
      </div>
    </div>

    <!-- 刪除確認對話框 -->
    <div
      v-if="showDeleteConfirm !== null"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10"
    >
      <div class="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 class="text-lg font-bold mb-4">確認刪除</h3>
        <p class="mb-4">
          確定要刪除「{{ stocks[showDeleteConfirm]?.name }}」的持股資料嗎？
        </p>
        <div class="flex justify-end space-x-3">
          <button
            @click="showDeleteConfirm = null"
            class="btn bg-gray-200 text-gray-800"
          >
            取消
          </button>
          <button @click="deleteStock()" class="btn btn-danger">
            確認刪除
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import {
  formatPrice,
  formatUSPrice,
  getMultipleStockPrices,
  getPriceClass,
  getUSDToTWDRate,
  convertUSDToTWD,
} from '../utils/stockApi';
import { useStorage } from '../utils/storage';

// 使用儲存工具
const {
  getStocks,
  addStock,
  updateStock,
  deleteStock: removeStock,
} = useStorage();

// 狀態
const stocks = ref([]);
const stockPrices = ref({});
const showAddForm = ref(false);
const editIndex = ref(null);
const showDeleteConfirm = ref(null);
const loading = ref(false);
const exchangeRate = ref(30); // 預設匯率約30新台幣兌1美元

// 持股表單
const stockForm = reactive({
  symbol: '',
  name: '',
  market: '台股',
  cost: 0,
  quantity: 0,
  purchaseDate: new Date().toISOString().split('T')[0],
});

// 計算屬性
const totalCost = computed(() => {
  return stocks.value.reduce(
    (total, stock) => total + stock.cost * stock.quantity,
    0,
  );
});

const totalValue = computed(() => {
  return stocks.value.reduce((total, stock) => {
    const price = getStockValuePrice(stock);
    return total + price * stock.quantity;
  }, 0);
});

const totalProfit = computed(() => {
  return totalValue.value - totalCost.value;
});

const totalProfitPercentage = computed(() => {
  if (totalCost.value === 0) return 0;
  return (totalProfit.value / totalCost.value) * 100;
});

// 方法
const loadStocks = () => {
  stocks.value = getStocks();

  // 如果有持股資料，自動更新價格
  if (stocks.value.length > 0) {
    refreshPrices();
  }
};

const refreshPrices = async () => {
  if (stocks.value.length === 0) return;

  loading.value = true;

  try {
    const symbols = stocks.value.map((stock) => stock.symbol);
    const results = await getMultipleStockPrices(symbols);

    // 更新價格
    const pricesObj = {};
    results.forEach((result) => {
      // 使用 originalSymbol 作為 key，這樣可以匹配前端保存的 symbol 格式
      const key = result.originalSymbol || result.symbol;
      pricesObj[key] = result;
    });

    stockPrices.value = pricesObj;

    // 可選：將價格數據存入 localStorage 以便於其他頁面使用
    try {
      localStorage.setItem(
        'investment-tracker-prices',
        JSON.stringify(pricesObj),
      );
    } catch (error) {
      console.error('無法儲存價格資料到本地存儲', error);
    }
  } catch (error) {
    console.error('更新價格出錯', error);
  } finally {
    loading.value = false;
  }
};

const editStock = (index) => {
  const stock = stocks.value[index];
  editIndex.value = index;

  // 填充表單
  stockForm.symbol = stock.symbol;
  stockForm.name = stock.name;
  stockForm.market = stock.market;
  stockForm.cost = stock.cost;
  stockForm.quantity = stock.quantity;
  stockForm.purchaseDate = stock.purchaseDate || '';

  showAddForm.value = true;
};

const deleteStockConfirm = (index) => {
  showDeleteConfirm.value = index;
};

const deleteStock = () => {
  if (showDeleteConfirm.value !== null) {
    removeStock(showDeleteConfirm.value);
    loadStocks();
    showDeleteConfirm.value = null;
  }
};

const saveStock = () => {
  const newStock = {
    symbol: stockForm.symbol,
    name: stockForm.name,
    market: stockForm.market,
    cost: stockForm.cost,
    quantity: stockForm.quantity,
    purchaseDate: stockForm.purchaseDate,
  };

  if (editIndex.value !== null) {
    updateStock(editIndex.value, newStock);
  } else {
    addStock(newStock);
  }

  // 重新載入資料並更新價格
  loadStocks();

  // 重置表單
  editIndex.value = null;
  showAddForm.value = false;
  resetForm();
};

const cancelForm = () => {
  showAddForm.value = false;
  editIndex.value = null;
  resetForm();
};

const resetForm = () => {
  stockForm.symbol = '';
  stockForm.name = '';
  stockForm.market = '台股';
  stockForm.cost = 0;
  stockForm.quantity = 0;
  stockForm.purchaseDate = new Date().toISOString().split('T')[0];
};

// 格式化金額
const formatMoney = (amount) => {
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// 從價格對象中獲取股票價格的幫助函數
const getStockPrice = (stock) => {
  // 嘗試使用不同的可能的鍵來獲取價格數據
  const priceData =
    stockPrices.value[stock.symbol] ||
    stockPrices.value[`${stock.symbol}.TW`] ||
    Object.values(stockPrices.value).find(
      (p) =>
        p.originalSymbol === stock.symbol ||
        p.symbol === stock.symbol ||
        p.symbol === `${stock.symbol}.TW`,
    );

  if (!priceData) return 0;

  // 返回原始價格（不做匯率轉換）
  return priceData.price || 0;
};

// 獲取用於計算的價格（對於收益率計算）
const getStockValuePrice = (stock) => {
  const price = getStockPrice(stock);
  const priceData =
    stockPrices.value[stock.symbol] ||
    stockPrices.value[`${stock.symbol}.TW`] ||
    Object.values(stockPrices.value).find(
      (p) =>
        p.originalSymbol === stock.symbol ||
        p.symbol === stock.symbol ||
        p.symbol === `${stock.symbol}.TW`,
    );

  if (!priceData) return price;

  // 轉換美股價格為台幣（僅用於計算總市值和收益率）
  if (priceData.currency === 'USD') {
    return price * exchangeRate.value;
  }

  return price;
};

// 格式化價格顯示
const formatStockPrice = (stock) => {
  const price = getStockPrice(stock);
  if (!price) return '載入中...';

  const priceData =
    stockPrices.value[stock.symbol] ||
    stockPrices.value[`${stock.symbol}.TW`] ||
    Object.values(stockPrices.value).find(
      (p) =>
        p.originalSymbol === stock.symbol ||
        p.symbol === stock.symbol ||
        p.symbol === `${stock.symbol}.TW`,
    );

  if (!priceData) return formatPrice(price);

  // 美股顯示美元價格並在括號中顯示台幣
  if (priceData.currency === 'USD') {
    return formatUSPrice(price, exchangeRate.value);
  }

  // 台股直接顯示台幣
  return formatPrice(price, 'TWD');
};

// 獲取股票漲跌的幫助函數
const getStockChange = (stock) => {
  // 嘗試使用不同的可能的鍵來獲取價格數據
  const priceData =
    stockPrices.value[stock.symbol] ||
    stockPrices.value[`${stock.symbol}.TW`] ||
    Object.values(stockPrices.value).find(
      (p) =>
        p.originalSymbol === stock.symbol ||
        p.symbol === stock.symbol ||
        p.symbol === `${stock.symbol}.TW`,
    );

  return priceData?.change || 0;
};

// 獲取股票損益
const getStockProfit = (stock, currentPrice) => {
  if (!currentPrice) return '載入中...';

  const cost = stock.cost * stock.quantity;
  const value = currentPrice * stock.quantity;
  const profit = value - cost;
  const profitPercentage = cost > 0 ? (profit / cost) * 100 : 0;

  const sign = profit >= 0 ? '+' : '';
  return `${sign}${formatMoney(profit)} (${sign}${profitPercentage.toFixed(
    2,
  )}%)`;
};

// 獲取股票損益樣式
const getStockProfitClass = (stock, currentPrice) => {
  if (!currentPrice) return '';

  const cost = stock.cost * stock.quantity;
  const value = currentPrice * stock.quantity;
  const profit = value - cost;

  return profit > 0 ? 'positive' : profit < 0 ? 'negative' : '';
};

// 頁面載入時
onMounted(() => {
  loadStocks();

  // 獲取匯率
  getUSDToTWDRate()
    .then((rate) => {
      exchangeRate.value = rate;
      console.log(`設置匯率: 1 USD = ${rate} TWD`);
      // 取得匯率後重新整理價格
      refreshPrices();
    })
    .catch((error) => {
      console.error('獲取匯率失敗，使用預設值', error);
    });
});
</script>
