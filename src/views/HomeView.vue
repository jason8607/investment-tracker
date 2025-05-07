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

    <!-- 市場分佈統計圖 -->
    <div v-if="stocks.length > 0" class="card bg-white p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- 圓餅圖：市場分佈 -->
        <div>
          <h3 class="text-lg font-bold mb-3">市場分佈</h3>
          <div class="h-64 flex items-center justify-center">
            <MarketPieChart
              :tw-value="marketData && marketData.tw ? marketData.tw.value : 0"
              :us-value="marketData && marketData.us ? marketData.us.value : 0"
            />
          </div>
          <div class="grid grid-cols-2 gap-4 mt-3">
            <div class="bg-gray-50 p-3 rounded-lg">
              <h4 class="text-sm text-gray-500">台股占比</h4>
              <p class="font-semibold">
                {{
                  marketDistribution && marketDistribution.tw
                    ? marketDistribution.tw.toFixed(2)
                    : '0.00'
                }}%
              </p>
            </div>
            <div class="bg-gray-50 p-3 rounded-lg">
              <h4 class="text-sm text-gray-500">美股占比</h4>
              <p class="font-semibold">
                {{
                  marketDistribution && marketDistribution.us
                    ? marketDistribution.us.toFixed(2)
                    : '0.00'
                }}%
              </p>
            </div>
          </div>
        </div>

        <!-- 長條圖：各市場報酬率比較 -->
        <div>
          <h3 class="text-lg font-bold mb-3">市場表現</h3>
          <div class="h-64 flex items-center justify-center">
            <MarketBarChart
              :tw-profit="
                marketData && marketData.tw ? marketData.tw.profit : 0
              "
              :us-profit="
                marketData && marketData.us ? marketData.us.profit : 0
              "
              :tw-cost="marketData && marketData.tw ? marketData.tw.cost : 0"
              :us-cost="marketData && marketData.us ? marketData.us.cost : 0"
            />
          </div>
          <div class="grid grid-cols-2 gap-4 mt-3">
            <div
              v-if="marketData && marketData.tw"
              class="bg-gray-50 p-3 rounded-lg"
              :class="getPriceClass(marketData.tw.profit)"
            >
              <h4 class="text-sm text-gray-500">台股損益</h4>
              <p class="font-semibold">
                {{ marketData.tw.profit > 0 ? '+' : ''
                }}{{ formatMoney(marketData.tw.profit) }}
                <span class="text-xs">
                  ({{
                    marketData.tw.cost > 0
                      ? (
                          (marketData.tw.profit / marketData.tw.cost) *
                          100
                        ).toFixed(2) + '%'
                      : '0%'
                  }})
                </span>
              </p>
            </div>
            <div v-else class="bg-gray-50 p-3 rounded-lg">
              <h4 class="text-sm text-gray-500">台股損益</h4>
              <p class="font-semibold">NT$0</p>
            </div>
            <div
              v-if="marketData && marketData.us"
              class="bg-gray-50 p-3 rounded-lg"
              :class="getPriceClass(marketData.us.profit)"
            >
              <h4 class="text-sm text-gray-500">美股損益</h4>
              <p class="font-semibold">
                {{ marketData.us.profit > 0 ? '+' : ''
                }}{{ formatMoney(marketData.us.profit) }}
                <span class="text-xs">
                  ({{
                    marketData.us.cost > 0
                      ? (
                          (marketData.us.profit / marketData.us.cost) *
                          100
                        ).toFixed(2) + '%'
                      : '0%'
                  }})
                </span>
              </p>
            </div>
            <div v-else class="bg-gray-50 p-3 rounded-lg">
              <h4 class="text-sm text-gray-500">美股損益</h4>
              <p class="font-semibold">US$0</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 標籤切換和按鈕 -->
    <div class="flex justify-between items-center mb-4">
      <div class="tabs">
        <button
          @click="activeTab = 'all'"
          class="tab-btn mr-2 px-4 py-2 rounded-lg"
          :class="activeTab === 'all' ? 'bg-primary text-white' : 'bg-gray-100'"
        >
          全部持股
        </button>
        <button
          @click="activeTab = 'tw'"
          class="tab-btn mr-2 px-4 py-2 rounded-lg"
          :class="activeTab === 'tw' ? 'bg-primary text-white' : 'bg-gray-100'"
        >
          台股
        </button>
        <button
          @click="activeTab = 'us'"
          class="tab-btn px-4 py-2 rounded-lg"
          :class="activeTab === 'us' ? 'bg-primary text-white' : 'bg-gray-100'"
        >
          美股
        </button>
      </div>
      <div class="flex items-center">
        <button @click="showAddForm = true" class="btn btn-primary mr-2">
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
    </div>

    <!-- 持股列表 -->
    <div class="card">
      <div
        v-if="filteredStocks.length === 0"
        class="text-center py-6 text-gray-500"
      >
        {{
          activeTab === 'all'
            ? '尚未新增持股資料，請點擊「新增持股」按鈕開始追蹤。'
            : `尚無${activeTab === 'tw' ? '台股' : '美股'}資料。`
        }}
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
            <tr v-for="(stock, index) in filteredStocks" :key="index">
              <td>{{ stock.symbol }}</td>
              <td>{{ stock.name }}</td>
              <td>{{ stock.market }}</td>
              <td>{{ stock.quantity }}</td>
              <td>
                {{ formatCostPrice(stock.cost, getStockCurrency(stock)) }}
              </td>
              <td :class="getPriceClass(getStockChange(stock))">
                {{ formatStockPrice(stock) }}
              </td>
              <td>
                {{
                  getStockPrice(stock)
                    ? formatMoney(
                        stock.quantity * getStockPrice(stock),
                        getStockCurrency(stock),
                      )
                    : '載入中...'
                }}
              </td>
              <td :class="getStockProfitClass(stock, getStockPrice(stock))">
                {{ getIndividualStockProfit(stock) }}
              </td>
              <td>
                <div class="flex space-x-2">
                  <button
                    @click="editStock(getStockIndex(stock))"
                    class="text-primary text-sm"
                  >
                    編輯
                  </button>
                  <button
                    @click="deleteStockConfirm(getStockIndex(stock))"
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
              @blur="fetchStockName"
            />
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1">股票名稱</label>
            <input
              v-model="stockForm.name"
              required
              class="input w-full"
              placeholder="自動獲取，或手動輸入"
              :disabled="isLoadingName"
            />
            <div v-if="isLoadingName" class="text-sm text-gray-500 mt-1">
              正在獲取股票名稱...
            </div>
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
  getStockName,
} from '../utils/stockApi';
import { useStorage } from '../utils/storage';
import MarketPieChart from '../components/MarketPieChart.vue';
import MarketBarChart from '../components/MarketBarChart.vue';

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
const activeTab = ref('all'); // 'all', 'tw', 'us'

// 持股表單
const stockForm = reactive({
  symbol: '',
  name: '',
  market: '台股',
  cost: 0,
  quantity: 0,
  purchaseDate: new Date().toISOString().split('T')[0],
});

// 添加獲取股票名稱的相關狀態和方法
const isLoadingName = ref(false);

// 當股票代碼變更時，自動獲取股票名稱
const fetchStockName = async () => {
  if (!stockForm.symbol) return;

  isLoadingName.value = true;
  try {
    const name = await getStockName(stockForm.symbol);
    if (name) {
      stockForm.name = name;
      console.log(`自動獲取股票名稱: ${stockForm.symbol} -> ${name}`);
    }
  } catch (error) {
    console.error('獲取股票名稱失敗:', error);
  } finally {
    isLoadingName.value = false;
  }
};

// 根據當前標籤過濾股票
const filteredStocks = computed(() => {
  if (activeTab.value === 'all') {
    return stocks.value;
  } else if (activeTab.value === 'tw') {
    return stocks.value.filter((stock) => {
      const currency = getStockCurrency(stock);
      return currency === 'TWD';
    });
  } else if (activeTab.value === 'us') {
    return stocks.value.filter((stock) => {
      const currency = getStockCurrency(stock);
      return currency === 'USD';
    });
  }
  return stocks.value;
});

// 計算屬性 - 依照不同市場
const marketData = computed(() => {
  // 計算每個市場的總投資成本和總市值
  const data = {
    tw: { cost: 0, value: 0, profit: 0 },
    us: { cost: 0, value: 0, profit: 0 },
  };

  if (!stocks.value || stocks.value.length === 0) {
    return data;
  }

  stocks.value.forEach((stock) => {
    const currency = getStockCurrency(stock);
    const cost = stock.cost * stock.quantity;
    const price = getStockPrice(stock);
    // 確保價格是有效數字
    if (!price || isNaN(price)) return;

    const value = price * stock.quantity;

    // 轉換為台幣計算總計
    if (currency === 'USD') {
      const convertedCost = cost * exchangeRate.value;
      const convertedValue = value * exchangeRate.value;
      data.us.cost += convertedCost;
      data.us.value += convertedValue;
      data.us.profit += convertedValue - convertedCost;
    } else {
      data.tw.cost += cost;
      data.tw.value += value;
      data.tw.profit += value - cost;
    }
  });

  return data;
});

// 計算屬性
const totalCost = computed(() => {
  if (!marketData.value || !marketData.value.tw || !marketData.value.us)
    return 0;
  return marketData.value.tw.cost + marketData.value.us.cost;
});

const totalValue = computed(() => {
  if (!marketData.value || !marketData.value.tw || !marketData.value.us)
    return 0;
  return marketData.value.tw.value + marketData.value.us.value;
});

const totalProfit = computed(() => {
  if (!totalValue.value || !totalCost.value) return 0;
  return totalValue.value - totalCost.value;
});

const totalProfitPercentage = computed(() => {
  if (totalCost.value === 0) return 0;
  return (totalProfit.value / totalCost.value) * 100;
});

// 計算各市場占比 - 用於圓餅圖
const marketDistribution = computed(() => {
  if (!marketData.value || !marketData.value.tw || !marketData.value.us) {
    return { tw: 0, us: 0 };
  }

  const twValue = marketData.value.tw.value || 0;
  const usValue = marketData.value.us.value || 0;
  const total = twValue + usValue;

  if (total === 0) return { tw: 0, us: 0 };

  return {
    tw: (twValue / total) * 100,
    us: (usValue / total) * 100,
  };
});

// 獲取股票在原始陣列中的索引
const getStockIndex = (stock) => {
  return stocks.value.findIndex((s) => s.symbol === stock.symbol);
};

// 方法
const loadStocks = () => {
  try {
    console.log('載入持股數據...');
    stocks.value = getStocks() || [];
    refreshPrices(false); // 不顯示加載提示
  } catch (error) {
    console.error('載入持股數據失敗', error);
    stocks.value = [];
  }
};

const refreshPrices = async (showLoading = true) => {
  if (!stocks.value || stocks.value.length === 0) return;

  // 只有在明確指定需要顯示加載提示時才設置 loading 狀態
  if (showLoading) {
    loading.value = true;
  }

  try {
    const symbols = stocks.value.map((stock) => stock.symbol).filter((s) => s);

    if (symbols.length === 0) {
      loading.value = false;
      return;
    }

    console.log('正在更新以下股票價格:', symbols.join(', '));
    const results = await getMultipleStockPrices(symbols);

    if (!results || results.length === 0) {
      console.warn('未獲取到任何股票價格數據');
      loading.value = false;
      return;
    }

    // 更新價格
    const pricesObj = {};
    results.forEach((result) => {
      if (!result) return;

      // 使用 originalSymbol 作為 key，這樣可以匹配前端保存的 symbol 格式
      const key = result.originalSymbol || result.symbol;
      if (key) {
        pricesObj[key] = result;
      }
    });

    console.log('已更新價格數據:', Object.keys(pricesObj).join(', '));
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
    // 不管成功與否，都關閉加載提示
    if (showLoading) {
      loading.value = false;
    }
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

// 獲取用於計算總計的價格（轉換為台幣）
const getConvertedPrice = (stock) => {
  const price = getStockPrice(stock);
  const currency = getStockCurrency(stock);

  if (currency === 'USD') {
    return price * exchangeRate.value;
  }

  return price;
};

// 格式化金額
const formatMoney = (amount, currency = 'TWD') => {
  // 自定義貨幣符號顯示
  const currencySymbol = currency === 'USD' ? 'US$' : 'NT$';

  // 格式化數字
  const formattedNumber = new Intl.NumberFormat('zh-TW', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

  // 組合符號和數字
  return `${currencySymbol}${formattedNumber}`;
};

// 從價格對象中獲取股票價格的幫助函數
const getStockPrice = (stock) => {
  if (!stock || !stockPrices.value) return 0;

  // 嘗試使用不同的可能的鍵來獲取價格數據
  const priceData =
    stockPrices.value[stock.symbol] ||
    stockPrices.value[`${stock.symbol}.TW`] ||
    Object.values(stockPrices.value).find(
      (p) =>
        p &&
        (p.originalSymbol === stock.symbol ||
          p.symbol === stock.symbol ||
          p.symbol === `${stock.symbol}.TW`),
    );

  if (!priceData) return 0;

  // 返回原始價格（不做匯率轉換）
  return priceData.price || 0;
};

// 獲取股票的貨幣類型
const getStockCurrency = (stock) => {
  if (!stock) return 'TWD';

  // 如果是美股，直接返回USD
  if (stock.market === '美股') return 'USD';

  // 嘗試從API數據獲取
  if (stockPrices.value) {
    const priceData =
      stockPrices.value[stock.symbol] ||
      stockPrices.value[`${stock.symbol}.TW`] ||
      Object.values(stockPrices.value).find(
        (p) =>
          p &&
          (p.originalSymbol === stock.symbol ||
            p.symbol === stock.symbol ||
            p.symbol === `${stock.symbol}.TW`),
      );

    if (priceData && priceData.currency) {
      return priceData.currency;
    }
  }

  // 根據市場判斷，默認台股使用TWD，美股使用USD
  return stock.market === '美股' ? 'USD' : 'TWD';
};

// 格式化股票價格顯示
const formatStockPrice = (stock) => {
  const price = getStockPrice(stock);
  if (!price) return '載入中...';

  const currency = getStockCurrency(stock);
  // 使用與成本價一致的格式
  const currencySymbol = currency === 'USD' ? 'US$' : 'NT$';
  return `${currencySymbol}${price.toFixed(2)}`;
};

// 獲取股票漲跌的幫助函數
const getStockChange = (stock) => {
  if (!stock || !stockPrices.value) return 0;

  // 嘗試使用不同的可能的鍵來獲取價格數據
  const priceData =
    stockPrices.value[stock.symbol] ||
    stockPrices.value[`${stock.symbol}.TW`] ||
    Object.values(stockPrices.value).find(
      (p) =>
        p &&
        (p.originalSymbol === stock.symbol ||
          p.symbol === stock.symbol ||
          p.symbol === `${stock.symbol}.TW`),
    );

  return priceData?.change || 0;
};

// 獲取個別股票損益
const getIndividualStockProfit = (stock) => {
  if (!stock) return '載入中...';

  const price = getStockPrice(stock);
  if (!price) return '載入中...';

  const cost = stock.cost * stock.quantity;
  const value = price * stock.quantity;
  const profit = value - cost;
  const profitPercentage = cost > 0 ? (profit / cost) * 100 : 0;
  const currency = getStockCurrency(stock);

  const sign = profit >= 0 ? '+' : '';
  return `${sign}${formatMoney(
    profit,
    currency,
  )} (${sign}${profitPercentage.toFixed(2)}%)`;
};

// 獲取股票損益樣式
const getStockProfitClass = (stock, currentPrice) => {
  if (!stock || !currentPrice) return '';

  const cost = stock.cost * stock.quantity;
  const value = currentPrice * stock.quantity;
  const profit = value - cost;

  return profit > 0 ? 'positive' : profit < 0 ? 'negative' : '';
};

// 格式化表格中顯示的成本價
const formatCostPrice = (cost, currency) => {
  if (cost === null || cost === undefined) return '-';

  // 貨幣符號
  const currencySymbol = currency === 'USD' ? 'US$' : 'NT$';
  return `${currencySymbol}${cost.toFixed(2)}`;
};

// 頁面載入時
onMounted(async () => {
  try {
    // 先嘗試從localStorage讀取匯率
    const cachedRate = localStorage.getItem('exchange-rate-cache');
    if (cachedRate) {
      const parsed = JSON.parse(cachedRate);
      if (parsed.USD_TWD) {
        exchangeRate.value = parsed.USD_TWD;
        console.log(`從緩存讀取匯率: 1 USD = ${exchangeRate.value} TWD`);
      }
    }

    // 載入持股數據
    loadStocks();

    // 獲取最新匯率
    const rate = await getUSDToTWDRate();
    if (rate && !isNaN(rate)) {
      exchangeRate.value = rate;
      console.log(`設置匯率: 1 USD = ${rate} TWD`);
      // 取得匯率後重新整理價格
      refreshPrices();
    }
  } catch (error) {
    console.error('頁面初始化時發生錯誤', error);
  }
});
</script>
