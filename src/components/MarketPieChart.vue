<template>
  <div class="market-pie-chart" style="width: 250px; height: 250px">
    <Pie
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
import { computed } from 'vue';
import { Pie } from 'vue-chartjs';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const props = defineProps({
  twValue: {
    type: Number,
    required: true,
  },
  usValue: {
    type: Number,
    required: true,
  },
});

const chartData = computed(() => {
  // 確保有數據時才顯示
  const hasData = props.twValue > 0 || props.usValue > 0;

  return {
    labels: ['台股', '美股'],
    datasets: [
      {
        backgroundColor: ['#36A2EB', '#FF6384'],
        data: hasData ? [props.twValue, props.usValue] : [],
      },
    ],
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
    },
    tooltip: {
      callbacks: {
        label: (context) => {
          const label = context.label || '';
          const value = context.raw || 0;
          const total = props.twValue + props.usValue;
          const percentage = total > 0 ? ((value / total) * 100).toFixed(2) : 0;
          return `${label}: ${percentage}%`;
        },
      },
    },
  },
};
</script>
