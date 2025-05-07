<template>
  <div class="market-bar-chart" style="width: 250px; height: 250px">
    <Bar
      v-if="chartData.datasets[0].data.length > 0"
      :data="chartData"
      :options="chartOptions"
      :height="250"
    />
    <div
      v-else
      class="text-center text-gray-500 h-full flex items-center justify-center"
    >
      暫無資料
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, watch, nextTick } from 'vue';
import { Bar } from 'vue-chartjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

const props = defineProps({
  twProfit: {
    type: Number,
    required: true,
  },
  usProfit: {
    type: Number,
    required: true,
  },
  twCost: {
    type: Number,
    required: true,
  },
  usCost: {
    type: Number,
    required: true,
  },
});

// 獲取報酬率，避免除以零的錯誤
const getReturnRate = (profit, cost) => {
  if (cost <= 0) return 0;
  return (profit / cost) * 100;
};

const chartData = computed(() => {
  const twRate = getReturnRate(props.twProfit, props.twCost);
  const usRate = getReturnRate(props.usProfit, props.usCost);

  // 確保有數據時才顯示
  const hasData = props.twCost > 0 || props.usCost > 0;

  return {
    labels: ['台股', '美股'],
    datasets: [
      {
        label: '報酬率 (%)',
        backgroundColor: [
          twRate >= 0 ? 'rgba(76, 175, 80, 0.6)' : 'rgba(244, 67, 54, 0.6)',
          usRate >= 0 ? 'rgba(76, 175, 80, 0.6)' : 'rgba(244, 67, 54, 0.6)',
        ],
        borderColor: [
          twRate >= 0 ? 'rgba(76, 175, 80, 1)' : 'rgba(244, 67, 54, 1)',
          usRate >= 0 ? 'rgba(76, 175, 80, 1)' : 'rgba(244, 67, 54, 1)',
        ],
        borderWidth: 1,
        data: hasData ? [twRate, usRate] : [],
      },
    ],
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: (context) => {
          const value = context.raw || 0;
          return `報酬率: ${value.toFixed(2)}%`;
        },
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: '報酬率 (%)',
      },
      ticks: {
        callback: function (value) {
          return value + '%';
        },
      },
    },
  },
};

// 確保圖表在 DOM 準備好後渲染
onMounted(() => {
  nextTick(() => {
    // 強制觸發圖表更新
    if (chartData.value.datasets[0].data.length > 0) {
      console.log('Chart data loaded:', chartData.value);
    }
  });
});

// 監聽 props 變化並更新圖表
watch(
  () => [props.twProfit, props.usProfit, props.twCost, props.usCost],
  () => {
    nextTick(() => {
      // 確保圖表重新渲染
      console.log('Props updated, chart should re-render');
    });
  },
);
</script>
