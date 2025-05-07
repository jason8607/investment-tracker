import { createApp } from 'vue';
import { createRouter, createWebHashHistory } from 'vue-router';
import App from './App.vue';
import './assets/main.css';

// 引入視圖
import ChartsView from './views/ChartsView.vue';
import HomeView from './views/HomeView.vue';
import RealizedView from './views/RealizedView.vue';

// 定義路由
const routes = [
  { path: '/', component: HomeView },
  { path: '/realized', component: RealizedView },
  { path: '/charts', component: ChartsView },
];

// 創建路由
const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

// 創建應用
const app = createApp(App);
app.use(router);
app.mount('#app');
