<template>
  <div>
    <h2 class="text-xl font-bold mb-4">已實現收益</h2>

    <!-- 已實現總覽卡片 -->
    <div class="card bg-white p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      </div>
    </div>

    <!-- 新增已實現收益按鈕 -->
    <div class="flex justify-between items-center mb-4">
      <button @click="showAddForm = true" class="btn btn-primary">
        + 新增已實現收益
      </button>
    </div>

    <!-- 已實現收益列表 -->
    <div class="card">
      <div v-if="trades.length === 0" class="text-center py-6 text-gray-500">
        尚未新增已實現收益資料，請點擊「新增已實現收益」按鈕進行新增。
      </div>
      <div v-else class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>日期</th>
              <th>代碼</th>
              <th>名稱</th>
              <th>賣出價格</th>
              <th>數量</th>
              <th>總成本</th>
              <th>實現損益</th>
              <th>報酬率</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(trade, index) in sortedTrades" :key="index">
              <td>{{ formatDate(trade.date) }}</td>
              <td>{{ trade.symbol }}</td>
              <td>{{ trade.name }}</td>
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
                    @click="editTrade(index)"
                    class="text-primary text-sm"
                  >
                    編輯
                  </button>
                  <button
                    @click="deleteTradeConfirm(index)"
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
              :value="calculateTotalCost()"
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
import { computed, onMounted, reactive, ref } from 'vue';
import { useStorage } from '../utils/storage';

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

// 已實現收益表單
const tradeForm = reactive({
  symbol: '',
  name: '',
  sellPrice: 0,
  quantity: 0,
  buyPrice: 0,
  date: new Date().toISOString().split('T')[0],
});

// 計算屬性
const totalProfit = computed(() => {
  return trades.value.reduce((total, trade) => total + trade.profit, 0);
});

const sortedTrades = computed(() => {
  return [...trades.value].sort((a, b) => new Date(b.date) - new Date(a.date));
});

// 方法
const loadTrades = () => {
  trades.value = getRealizedTrades();
};

const editTrade = (index) => {
  const trade = trades.value[index];
  editIndex.value = index;

  // 填充表單
  tradeForm.symbol = trade.symbol;
  tradeForm.name = trade.name;
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
  tradeForm.sellPrice = 0;
  tradeForm.quantity = 0;
  tradeForm.buyPrice = 0;
  tradeForm.date = new Date().toISOString().split('T')[0];
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

// 格式化價格
const formatPrice = (price) => {
  return price.toFixed(2);
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
  return tradeForm.buyPrice * tradeForm.quantity;
};

// 頁面載入時
onMounted(() => {
  loadTrades();
});
</script>
