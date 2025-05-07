/**
 * 股票 API 工具函數
 * 使用 Yahoo Finance API 獲取股票價格
 * 添加錯誤處理和模擬數據備用方案
 */

// 獲取單個股票價格
export async function getStockPrice(symbol) {
  try {
    // 添加隨機參數避免緩存和限制
    const timestamp = new Date().getTime();
    // 使用 Yahoo Finance API
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&t=${timestamp}`,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          Accept: 'application/json',
          'Cache-Control': 'no-cache',
        },
        mode: 'cors',
      },
    );

    // 檢查返回狀態
    if (!response.ok) {
      console.warn(`API 請求失敗: ${response.status} ${response.statusText}`);
      return getSimulatedStockData(symbol); // 使用模擬數據
    }

    const data = await response.json();

    // 檢查是否有錯誤
    if (data.chart?.error) {
      console.error('獲取股票價格出錯', data.chart.error);
      return getSimulatedStockData(symbol); // 使用模擬數據
    }

    // 確保數據結構存在
    if (!data.chart?.result?.[0]?.meta) {
      console.warn('API 返回結構異常', data);
      return getSimulatedStockData(symbol); // 使用模擬數據
    }

    // 獲取最新價格
    const result = data.chart.result[0];
    const price = result.meta.regularMarketPrice;

    return {
      price,
      change: result.meta.regularMarketChange,
      changePercent: result.meta.regularMarketChangePercent,
      time: new Date(result.meta.regularMarketTime * 1000),
    };
  } catch (error) {
    console.error('獲取股票價格出錯', error);
    return getSimulatedStockData(symbol); // 使用模擬數據
  }
}

// 獲取多個股票價格
export async function getMultipleStockPrices(symbols) {
  try {
    // 同時獲取多個股票價格，但限制並發請求數量
    const results = [];
    const batchSize = 3; // 一次最多處理 3 個請求

    for (let i = 0; i < symbols.length; i += batchSize) {
      const batch = symbols.slice(i, i + batchSize);
      const promises = batch.map((symbol) => getStockPrice(symbol));
      const batchResults = await Promise.allSettled(promises);

      results.push(...batchResults);

      if (i + batchSize < symbols.length) {
        // 添加延遲避免被限制請求
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    // 處理結果
    return results.map((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        return {
          symbol: symbols[index],
          ...result.value,
        };
      } else {
        return {
          symbol: symbols[index],
          price: null,
          error: true,
        };
      }
    });
  } catch (error) {
    console.error('獲取多個股票價格出錯', error);
    return symbols.map((symbol) => ({
      symbol,
      price: null,
      error: true,
    }));
  }
}

// 生成模擬股票數據的函數（備用方案）
function getSimulatedStockData(symbol) {
  // 為不同股票生成不同但穩定的價格
  const basePrice = (getHashCode(symbol) % 1000) + 100;

  // 生成小幅波動 (-5% ~ +5%)
  const changePercent = (Math.random() * 10 - 5) / 100;
  const change = basePrice * changePercent;
  const price = basePrice + change;

  console.log(`使用模擬數據 ${symbol}: ${price.toFixed(2)}`);

  return {
    price,
    change,
    changePercent,
    time: new Date(),
    simulated: true, // 標記為模擬數據
  };
}

// 簡單的字串哈希函數
function getHashCode(str) {
  let hash = 0;
  if (str.length === 0) return hash;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

// 格式化價格
export function formatPrice(price, digits = 2) {
  if (price === null || price === undefined) return '-';
  return price.toFixed(digits);
}

// 格式化漲跌幅
export function formatChange(change, changePercent, digits = 2) {
  if (change === null || change === undefined) return '-';

  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(digits)} (${sign}${changePercent.toFixed(
    digits,
  )}%)`;
}

// 取得 CSS 類名
export function getPriceClass(change) {
  if (change === null || change === undefined) return '';
  return change > 0 ? 'positive' : change < 0 ? 'negative' : '';
}
