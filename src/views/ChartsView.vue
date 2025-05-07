<template>
  <div>
    <h2 class="text-xl font-bold mb-4">圖表分析</h2>

    <!-- 切換圖表類型 -->
    <div class="mb-6">
      <div class="flex flex-wrap space-x-2">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          class="px-4 py-2 rounded-md transition-colors mb-2"
          :class="
            activeTab === tab.id
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700'
          "
        >
          {{ tab.name }}
        </button>
      </div>
    </div>

    <!-- 圖表區域 -->
    <div class="card">
      <div v-if="activeTab === 'allocation'" class="p-4">
        <h3 class="text-lg font-medium mb-4">持股分配</h3>

        <div v-if="!hasStocks" class="text-center py-6 text-gray-500">
          尚未新增持股資料，請先在持股管理頁面新增股票。
        </div>

        <div v-else class="flex flex-col md:flex-row">
          <div class="w-full md:w-1/2 min-h-[300px]">
            <Pie :chart-data="allocationData" :chart-options="pieOptions" />
          </div>
          <div class="w-full md:w-1/2 p-4">
            <h4 class="text-md font-medium mb-2">持股比例</h4>
            <div
              v-for="(stock, index) in stocksWithValue"
              :key="index"
              class="flex items-center mb-2"
            >
              <div
                class="w-4 h-4 rounded-full mr-2"
                :style="{
                  backgroundColor: chartColors[index % chartColors.length],
                }"
              ></div>
              <div class="flex-1">{{ stock.name }} ({{ stock.symbol }})</div>
              <div class="text-right">{{ stock.percentage.toFixed(2) }}%</div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'profit'" class="p-4">
        <h3 class="text-lg font-medium mb-4">總體損益</h3>

        <div v-if="!hasData" class="text-center py-6 text-gray-500">
          尚未有足夠資料，請先新增持股或已實現收益。
        </div>

        <div v-else class="min-h-[300px]">
          <Bar :chart-data="profitData" :chart-options="barOptions" />
        </div>
      </div>

      <div v-if="activeTab === 'realized'" class="p-4">
        <h3 class="text-lg font-medium mb-4">已實現收益分析</h3>

        <div v-if="!hasRealizedTrades" class="text-center py-6 text-gray-500">
          尚未新增已實現收益資料，請先在已實現收益頁面新增資料。
        </div>

        <div v-else class="min-h-[300px]">
          <Line :chart-data="realizedData" :chart-options="lineOptions" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import dayjs from 'dayjs';
import { computed, onMounted, ref } from 'vue';
import { Bar, Line, Pie } from 'vue-chartjs';
import { useStorage } from '../utils/storage';

// 註冊 ChartJS 組件
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
);

// 使用儲存工具
const { getStocks, getRealizedTrades } = useStorage();

// 狀態
const activeTab = ref('allocation');
const stocks = ref([]);
const realizedTrades = ref([]);
const stockPrices = ref({});

// 標籤
const tabs = [
  { id: 'allocation', name: '持股分配' },
  { id: 'profit', name: '總體損益' },
  { id: 'realized', name: '已實現收益趨勢' },
];

// 圖表顏色
const chartColors = [
  '#4CAF50',
  '#2196F3',
  '#F44336',
  '#FF9800',
  '#9C27B0',
  '#3F51B5',
  '#009688',
  '#795548',
  '#607D8B',
  '#E91E63',
];

// 計算屬性
const hasStocks = computed(() => stocks.value.length > 0);
const hasRealizedTrades = computed(() => realizedTrades.value.length > 0);
const hasData = computed(() => hasStocks.value || hasRealizedTrades.value);

// 持股市值比例數據
const stocksWithValue = computed(() => {
  if (!hasStocks.value) return [];

  // 計算每個股票的總市值
  const stocksWithMarketValue = stocks.value.map((stock) => {
    const price = stockPrices.value[stock.symbol]?.price || stock.cost;
    const marketValue = price * stock.quantity;
    return {
      ...stock,
      marketValue,
    };
  });

  // 計算總市值
  const totalMarketValue = stocksWithMarketValue.reduce(
    (total, stock) => total + stock.marketValue,
    0,
  );

  // 計算每個股票的百分比
  return stocksWithMarketValue
    .map((stock) => ({
      ...stock,
      percentage: (stock.marketValue / totalMarketValue) * 100,
    }))
    .sort((a, b) => b.marketValue - a.marketValue);
});

// 持股分配圖表數據
const allocationData = computed(() => {
  if (!hasStocks.value) return { datasets: [] };

  return {
    labels: stocksWithValue.value.map((stock) => stock.name),
    datasets: [
      {
        data: stocksWithValue.value.map((stock) => stock.marketValue),
        backgroundColor: stocksWithValue.value.map(
          (_, index) => chartColors[index % chartColors.length],
        ),
        hoverOffset: 4,
      },
    ],
  };
});

// 總體損益圖表數據
const profitData = computed(() => {
  const categories = ['未實現損益', '已實現收益', '總體損益'];

  // 計算未實現損益
  const unrealizedProfit = stocks.value.reduce((total, stock) => {
    const price = stockPrices.value[stock.symbol]?.price || stock.cost;
    const marketValue = price * stock.quantity;
    const cost = stock.cost * stock.quantity;
    return total + (marketValue - cost);
  }, 0);

  // 計算已實現收益
  const realizedProfit = realizedTrades.value.reduce(
    (total, trade) => total + trade.profit,
    0,
  );

  // 總體損益
  const totalProfit = unrealizedProfit + realizedProfit;

  // 創建數據
  const profitValues = [unrealizedProfit, realizedProfit, totalProfit];

  return {
    labels: categories,
    datasets: [
      {
        label: '損益金額',
        data: profitValues,
        backgroundColor: profitValues.map((value) =>
          value >= 0 ? 'rgba(76, 175, 80, 0.6)' : 'rgba(244, 67, 54, 0.6)',
        ),
        borderColor: profitValues.map((value) =>
          value >= 0 ? 'rgb(76, 175, 80)' : 'rgb(244, 67, 54)',
        ),
        borderWidth: 1,
      },
    ],
  };
});

// 已實現收益趨勢圖表數據
const realizedData = computed(() => {
  if (!hasRealizedTrades.value) return { datasets: [] };

  // 按日期排序
  const sortedTrades = [...realizedTrades.value].sort(
    (a, b) => new Date(a.date) - new Date(b.date),
  );

  // 創建累計收益的數組
  let cumulativeProfit = 0;
  const cumulativeProfits = [];
  const dates = [];

  sortedTrades.forEach((trade) => {
    cumulativeProfit += trade.profit;
    cumulativeProfits.push(cumulativeProfit);
    dates.push(dayjs(trade.date).format('YYYY/MM/DD'));
  });

  return {
    labels: dates,
    datasets: [
      {
        label: '累計已實現收益',
        data: cumulativeProfits,
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        tension: 0.1,
        pointBackgroundColor: cumulativeProfits.map((profit) =>
          profit >= 0 ? 'rgb(76, 175, 80)' : 'rgb(244, 67, 54)',
        ),
      },
    ],
  };
});

// 餅圖選項
const pieOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: function (context) {
          const label = context.label || '';
          const value = context.raw || 0;
          const percentage =
            (value / context.dataset.data.reduce((a, b) => a + b, 0)) * 100;
          return `${label}: ${formatMoney(value)} (${percentage.toFixed(2)}%)`;
        },
      },
    },
  },
};

// 條形圖選項
const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: function (context) {
          return `${context.dataset.label}: ${formatMoney(context.raw)}`;
        },
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: function (value) {
          return formatMoney(value);
        },
      },
    },
  },
};

// 折線圖選項
const lineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    tooltip: {
      callbacks: {
        label: function (context) {
          return `${context.dataset.label}: ${formatMoney(context.raw)}`;
        },
      },
    },
  },
  scales: {
    y: {
      ticks: {
        callback: function (value) {
          return formatMoney(value);
        },
      },
    },
  },
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

// 方法
const loadData = () => {
  stocks.value = getStocks();
  realizedTrades.value = getRealizedTrades();

  // 為持股數據創建價格資料（使用成本價作為默認值）
  const pricesObj = {};
  stocks.value.forEach((stock) => {
    pricesObj[stock.symbol] = {
      price: stock.cost,
      change: 0,
      changePercent: 0,
    };
  });

  stockPrices.value = pricesObj;

  // 從 localStorage 中讀取價格更新
  try {
    const cachedPrices = localStorage.getItem('investment-tracker-prices');
    if (cachedPrices) {
      stockPrices.value = { ...stockPrices.value, ...JSON.parse(cachedPrices) };
    }
  } catch (error) {
    console.error('無法讀取價格資料', error);
  }
};

// 頁面載入時
onMounted(() => {
  loadData();

  // 監聽儲存變化事件
  window.addEventListener('storage', (event) => {
    if (
      event.key === 'investment-tracker-stocks' ||
      event.key === 'investment-tracker-realized' ||
      event.key === 'investment-tracker-prices'
    ) {
      loadData();
    }
  });
});
</script>
