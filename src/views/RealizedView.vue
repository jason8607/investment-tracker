<template>
  <div>
    <h2 class="text-xl font-bold mb-4">已實現收益</h2>

    <!-- 已實現總覽卡片 -->
    <div class="card bg-white p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="p-3 bg-gray-50 rounded-lg">
          <h3 class="text-gray-500 text-sm">總實現收益</h3>
          <p
            class="text-lg font-semibold"
            :class="totalProfit >= 0 ? 'positive' : 'negative'"
          >
            {{ totalProfit > 0 ? '+' : '' }}{{ formatMoney(totalProfit) }}
          </p>
        </div>
        <div class="p-3 bg-gray-50 rounded-lg">
          <h3 class="text-gray-500 text-sm">總交易次數</h3>
          <p class="text-lg font-semibold">{{ trades.length }} 次</p>
        </div>
        <div class="p-3 bg-gray-50 rounded-lg">
          <h3 class="text-gray-500 text-sm">平均報酬率</h3>
          <p
            class="text-lg font-semibold"
            :class="averageROI >= 0 ? 'positive' : 'negative'"
          >
            {{ averageROI > 0 ? '+' : '' }}{{ averageROI.toFixed(2) }}%
          </p>
        </div>
      </div>
    </div>

    <!-- 市場分佈統計圖 -->
    <div v-if="trades.length > 0" class="card bg-white p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- 圓餅圖：市場分佈 -->
        <div>
          <h3 class="text-lg font-bold mb-3">市場分佈</h3>
          <div class="h-64 flex items-center justify-center">
            <MarketPieChart
              :tw-value="marketData.tw.profit"
              :us-value="marketData.us.profit"
            />
          </div>
          <div class="grid grid-cols-2 gap-4 mt-3">
            <div class="bg-gray-50 p-3 rounded-lg">
              <h4 class="text-sm text-gray-500">台股占比</h4>
              <p class="font-semibold">
                {{ marketDistribution.tw.toFixed(2) }}%
              </p>
            </div>
            <div class="bg-gray-50 p-3 rounded-lg">
              <h4 class="text-sm text-gray-500">美股占比</h4>
              <p class="font-semibold">
                {{ marketDistribution.us.toFixed(2) }}%
              </p>
            </div>
          </div>
        </div>

        <!-- 長條圖：各市場報酬率比較 -->
        <div>
          <h3 class="text-lg font-bold mb-3">市場表現</h3>
          <div class="h-64 flex items-center justify-center">
            <MarketBarChart
              :tw-profit="marketData.tw.profit"
              :us-profit="marketData.us.profit"
              :tw-cost="marketData.tw.cost"
              :us-cost="marketData.us.cost"
            />
          </div>
          <div class="grid grid-cols-2 gap-4 mt-3">
            <div
              class="bg-gray-50 p-3 rounded-lg"
              :class="marketData.tw.profit >= 0 ? 'positive' : 'negative'"
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
            <div
              class="bg-gray-50 p-3 rounded-lg"
              :class="marketData.us.profit >= 0 ? 'positive' : 'negative'"
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
          全部交易
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
      <button @click="showAddForm = true" class="btn btn-primary">
        + 新增已實現收益
      </button>
    </div>

    <!-- 已實現收益列表 -->
    <div class="card">
      <div
        v-if="filteredTrades.length === 0"
        class="text-center py-6 text-gray-500"
      >
        {{
          activeTab === 'all'
            ? '尚未新增已實現收益資料，請點擊「新增已實現收益」按鈕進行新增。'
            : `尚無${activeTab === 'tw' ? '台股' : '美股'}已實現交易資料。`
        }}
      </div>
      <div v-else class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>日期</th>
              <th>代碼</th>
              <th>名稱</th>
              <th>市場</th>
              <th>賣出價格</th>
              <th>數量</th>
              <th>總成本</th>
              <th>實現損益</th>
              <th>報酬率</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(trade, index) in filteredTrades" :key="index">
              <td>{{ formatDate(trade.date) }}</td>
              <td>{{ trade.symbol }}</td>
              <td>{{ trade.name }}</td>
              <td>
                {{
                  trade.market ||
                  (isTradeInMarket(trade, '台股') ? '台股' : '美股')
                }}
              </td>
              <td>{{ formatPrice(trade.sellPrice) }}</td>
              <td>{{ trade.quantity }}</td>
              <td>{{ formatMoney(trade.cost) }}</td>
              <td :class="trade.profit >= 0 ? 'positive' : 'negative'">
                {{ trade.profit > 0 ? '+' : '' }}{{ formatMoney(trade.profit) }}
              </td>
              <td :class="trade.profit >= 0 ? 'positive' : 'negative'">
                {{ calculateROI(trade) }}
              </td>
              <td>
                <div class="flex space-x-2">
                  <button
                    @click="editTrade(getTradeIndex(trade))"
                    class="text-primary text-sm"
                  >
                    編輯
                  </button>
                  <button
                    @click="deleteTradeConfirm(getTradeIndex(trade))"
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

    <!-- 新增已實現收益表單 -->
    <div
      v-if="showAddForm"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10"
    >
      <div class="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 class="text-lg font-bold mb-4">
          {{ editIndex === null ? '新增已實現收益' : '編輯已實現收益' }}
        </h3>
        <form @submit.prevent="saveTrade">
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1">股票代碼</label>
            <input
              v-model="tradeForm.symbol"
              required
              class="input w-full"
              placeholder="例如：2330.TW 或 AAPL"
            />
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1">股票名稱</label>
            <input
              v-model="tradeForm.name"
              required
              class="input w-full"
              placeholder="例如：台積電 或 蘋果"
            />
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1">市場</label>
            <select v-model="tradeForm.market" required class="input w-full">
              <option value="台股">台股</option>
              <option value="美股">美股</option>
              <option value="其他">其他</option>
            </select>
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1">賣出價格</label>
            <input
              v-model.number="tradeForm.sellPrice"
              type="number"
              step="0.01"
              required
              class="input w-full"
              placeholder="每股賣出價格"
            />
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1">數量</label>
            <input
              v-model.number="tradeForm.quantity"
              type="number"
              required
              class="input w-full"
              placeholder="賣出數量"
            />
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1">買入價格</label>
            <input
              v-model.number="tradeForm.buyPrice"
              type="number"
              step="0.01"
              required
              class="input w-full"
              placeholder="每股買入價格"
            />
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1">總成本</label>
            <input
              :value="getFormattedTotalCost()"
              type="number"
              step="0.01"
              disabled
              class="input w-full bg-gray-100"
            />
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1">賣出日期</label>
            <input
              v-model="tradeForm.date"
              type="date"
              required
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
          確定要刪除「{{
            trades[showDeleteConfirm]?.name
          }}」的已實現收益資料嗎？
        </p>
        <div class="flex justify-end space-x-3">
          <button
            @click="showDeleteConfirm = null"
            class="btn bg-gray-200 text-gray-800"
          >
            取消
          </button>
          <button @click="deleteTrade()" class="btn btn-danger">
            確認刪除
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import dayjs from 'dayjs';
import { computed, onActivated, onMounted, reactive, ref } from 'vue';
import { useStorage } from '../utils/storage';
import MarketPieChart from '../components/MarketPieChart.vue';
import MarketBarChart from '../components/MarketBarChart.vue';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement,
} from 'chart.js';

// 註冊 ChartJS 組件
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement,
);

// 使用儲存工具
const {
  getRealizedTrades,
  addRealizedTrade,
  updateRealizedTrade,
  deleteRealizedTrade,
} = useStorage();

// 狀態
const trades = ref([]);
const showAddForm = ref(false);
const editIndex = ref(null);
const showDeleteConfirm = ref(null);
const activeTab = ref('all'); // 'all', 'tw', 'us'
const updateCounter = ref(0); // 用於強制重新渲染圖表的計數器
const isInitialMount = ref(true); // 標記是否為初次掛載

// 已實現收益表單
const tradeForm = reactive({
  symbol: '',
  name: '',
  sellPrice: 0,
  quantity: 0,
  buyPrice: 0,
  date: new Date().toISOString().split('T')[0],
  market: '台股', // 新增：市場選項
});

// 計算屬性
const totalProfit = computed(() => {
  return filteredTrades.value.reduce((total, trade) => total + trade.profit, 0);
});

// 新增：平均報酬率計算
const averageROI = computed(() => {
  if (filteredTrades.value.length === 0) return 0;

  const totalCost = filteredTrades.value.reduce(
    (sum, trade) => sum + trade.cost,
    0,
  );
  if (totalCost === 0) return 0;

  const totalProfit = filteredTrades.value.reduce(
    (sum, trade) => sum + trade.profit,
    0,
  );
  return (totalProfit / totalCost) * 100;
});

// 新增：過濾後的交易數據
const filteredTrades = computed(() => {
  if (activeTab.value === 'all') {
    return sortedTrades.value;
  } else if (activeTab.value === 'tw') {
    return sortedTrades.value.filter((trade) => isTradeInMarket(trade, '台股'));
  } else if (activeTab.value === 'us') {
    return sortedTrades.value.filter((trade) => isTradeInMarket(trade, '美股'));
  }
  return sortedTrades.value;
});

// 判斷交易所屬市場
const isTradeInMarket = (trade, market) => {
  // 如果交易記錄有明確的market屬性，使用它
  if (trade.market) {
    return trade.market === market;
  }

  // 否則基於股票代碼判斷
  // 台股通常是4位數字，美股通常含有字母
  if (market === '台股') {
    return /^\d+$/.test(trade.symbol.split('.')[0]);
  } else if (market === '美股') {
    return /[A-Za-z]/.test(trade.symbol);
  }

  return false;
};

// 新增：計算各市場數據
const marketData = computed(() => {
  const data = {
    tw: { profit: 0, cost: 0 },
    us: { profit: 0, cost: 0 },
  };

  if (trades.value.length === 0) {
    return data;
  }

  trades.value.forEach((trade) => {
    if (isTradeInMarket(trade, '台股')) {
      data.tw.profit += trade.profit;
      data.tw.cost += trade.cost;
    } else if (isTradeInMarket(trade, '美股')) {
      data.us.profit += trade.profit;
      data.us.cost += trade.cost;
    }
  });

  return data;
});

// 新增：計算市場分佈
const marketDistribution = computed(() => {
  const twAbsProfit = Math.abs(marketData.value.tw.profit);
  const usAbsProfit = Math.abs(marketData.value.us.profit);
  const totalAbsProfit = twAbsProfit + usAbsProfit;

  return {
    tw: totalAbsProfit > 0 ? (twAbsProfit / totalAbsProfit) * 100 : 0,
    us: totalAbsProfit > 0 ? (usAbsProfit / totalAbsProfit) * 100 : 0,
  };
});

const sortedTrades = computed(() => {
  return [...trades.value].sort((a, b) => new Date(b.date) - new Date(a.date));
});

// 方法
const loadTrades = () => {
  trades.value = getRealizedTrades();

  // 增加計數器強制重新渲染圖表
  updateCounter.value++;
  console.log('載入交易數據後更新圖表計數器:', updateCounter.value);
};

// 獲取交易在陣列中的索引
const getTradeIndex = (trade) => {
  return trades.value.findIndex(
    (t) =>
      t.symbol === trade.symbol &&
      t.date === trade.date &&
      t.profit === trade.profit,
  );
};

const editTrade = (index) => {
  const trade = trades.value[index];
  editIndex.value = index;

  // 填充表單
  tradeForm.symbol = trade.symbol;
  tradeForm.name = trade.name;
  tradeForm.market =
    trade.market || (isTradeInMarket(trade, '台股') ? '台股' : '美股');
  tradeForm.sellPrice = trade.sellPrice;
  tradeForm.quantity = trade.quantity;
  tradeForm.buyPrice = trade.cost / trade.quantity || 0; // 從總成本反算買入價格
  tradeForm.date = trade.date;

  showAddForm.value = true;
};

const deleteTradeConfirm = (index) => {
  showDeleteConfirm.value = index;
};

const deleteTrade = () => {
  if (showDeleteConfirm.value !== null) {
    deleteRealizedTrade(showDeleteConfirm.value);
    loadTrades();
    showDeleteConfirm.value = null;
  }
};

const saveTrade = () => {
  // 計算總成本和利潤
  const totalCost = calculateTotalCost();
  const sellValue = tradeForm.sellPrice * tradeForm.quantity;
  const profit = sellValue - totalCost;

  const newTrade = {
    symbol: tradeForm.symbol,
    name: tradeForm.name,
    market: tradeForm.market,
    sellPrice: tradeForm.sellPrice,
    quantity: tradeForm.quantity,
    cost: totalCost,
    profit,
    date: tradeForm.date,
  };

  if (editIndex.value !== null) {
    updateRealizedTrade(editIndex.value, newTrade);
  } else {
    addRealizedTrade(newTrade);
  }

  // 重新載入資料
  loadTrades();

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
  tradeForm.symbol = '';
  tradeForm.name = '';
  tradeForm.market = '台股';
  tradeForm.sellPrice = 0;
  tradeForm.quantity = 0;
  tradeForm.buyPrice = 0;
  tradeForm.date = new Date().toISOString().split('T')[0];
};

// 格式化金額
const formatMoney = (amount) => {
  // 自定義貨幣符號顯示
  const currencySymbol = 'NT$';

  // 格式化數字
  const formattedNumber = new Intl.NumberFormat('zh-TW', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

  // 組合符號和數字
  return `${currencySymbol}${formattedNumber}`;
};

// 格式化價格
const formatPrice = (price) => {
  return `NT$${price.toFixed(2)}`;
};

// 格式化日期
const formatDate = (dateString) => {
  return dayjs(dateString).format('YYYY/MM/DD');
};

// 計算報酬率
const calculateROI = (trade) => {
  if (trade.cost === 0) return '0.00%';

  const roi = (trade.profit / trade.cost) * 100;
  const sign = roi >= 0 ? '+' : '';
  return `${sign}${roi.toFixed(2)}%`;
};

// 計算總成本
const calculateTotalCost = () => {
  const cost = tradeForm.buyPrice * tradeForm.quantity;
  // 直接返回數值，因為這是用在input的value中
  return cost;
};

// 獲取格式化的總成本（用於顯示）
const getFormattedTotalCost = () => {
  const cost = calculateTotalCost();
  return formatMoney(cost);
};

// 頁面載入時
onMounted(() => {
  loadTrades();
});

// 當組件激活時
onActivated(() => {
  console.log('RealizedView 被激活, 初次掛載狀態:', isInitialMount.value);

  // 如果是初次掛載，不執行重複的邏輯，只標記為非初次掛載
  if (isInitialMount.value) {
    isInitialMount.value = false;
    return;
  }

  // 先增加計數器強制重新渲染圖表
  updateCounter.value++;
  console.log('激活時更新圖表計數器:', updateCounter.value);

  // 載入交易數據
  loadTrades();

  // 添加延遲確保數據完全載入後再次更新圖表
  setTimeout(() => {
    updateCounter.value++;
    console.log('延遲後再次更新圖表計數器:', updateCounter.value);
  }, 300);
});
</script>
