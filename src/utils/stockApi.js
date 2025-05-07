/**
 * 股票 API 工具函數
 * 使用 Yahoo Finance API 獲取股票價格
 * 添加錯誤處理和模擬數據備用方案
 * 支持台股和美股市場
 */

/**
 * 確保股票代碼包含正確的後綴
 * 台股應該是 4碼.TW 格式，如 2330.TW
 * 美股不需要後綴，但可以是 AAPL 或 AAPL.US 格式
 */
export function normalizeSymbol(symbol) {
  if (!symbol) return '';

  // 已經有後綴的情況
  if (symbol.includes('.')) return symbol;

  // 判斷是台股還是美股（簡單規則：台股通常是數字，美股通常包含字母）
  const isTaiwanStock = /^\d+$/.test(symbol);

  if (isTaiwanStock) {
    return `${symbol}.TW`;
  } else {
    return symbol; // 美股保持原樣
  }
}

// 獲取單個股票價格
export async function getStockPrice(symbol) {
  try {
    // 確保股票代碼格式正確
    const normalizedSymbol = normalizeSymbol(symbol);

    // 添加隨機參數避免緩存和限制
    const timestamp = new Date().getTime();
    // 使用 Yahoo Finance API
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${normalizedSymbol}?interval=1d&t=${timestamp}`,
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
      console.warn(
        `API 請求失敗 (${normalizedSymbol}): ${response.status} ${response.statusText}`,
      );
      return getSimulatedStockData(normalizedSymbol); // 使用模擬數據
    }

    const data = await response.json();

    // 檢查是否有錯誤
    if (data.chart?.error) {
      console.error(`獲取股票價格出錯 (${normalizedSymbol})`, data.chart.error);
      return getSimulatedStockData(normalizedSymbol); // 使用模擬數據
    }

    // 確保數據結構存在
    if (!data.chart?.result?.[0]?.meta) {
      console.warn(`API 返回結構異常 (${normalizedSymbol})`, data);
      return getSimulatedStockData(normalizedSymbol); // 使用模擬數據
    }

    // 獲取最新價格
    const result = data.chart.result[0];
    const price = result.meta.regularMarketPrice;

    // 貨幣符號 (台幣或美元)
    const currency =
      result.meta.currency ||
      (normalizedSymbol.endsWith('.TW') ? 'TWD' : 'USD');

    return {
      symbol: normalizedSymbol,
      price,
      change: result.meta.regularMarketChange,
      changePercent: result.meta.regularMarketChangePercent,
      time: new Date(result.meta.regularMarketTime * 1000),
      currency,
      exchangeName: result.meta.exchangeName || '',
    };
  } catch (error) {
    console.error(`獲取股票價格出錯 (${symbol})`, error);
    return getSimulatedStockData(normalizeSymbol(symbol)); // 使用模擬數據
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
          originalSymbol: symbols[index],
          ...result.value,
        };
      } else {
        return {
          originalSymbol: symbols[index],
          symbol: normalizeSymbol(symbols[index]),
          price: null,
          error: true,
        };
      }
    });
  } catch (error) {
    console.error('獲取多個股票價格出錯', error);
    return symbols.map((symbol) => ({
      originalSymbol: symbol,
      symbol: normalizeSymbol(symbol),
      price: null,
      error: true,
    }));
  }
}

// 生成模擬股票數據的函數（備用方案）
function getSimulatedStockData(symbol) {
  // 為不同股票生成不同但穩定的價格
  const isTaiwanStock = symbol.endsWith('.TW');

  // 台股基礎價格範圍較小，美股範圍較大
  const minPrice = isTaiwanStock ? 50 : 100;
  const maxPrice = isTaiwanStock ? 500 : 1000;
  const range = maxPrice - minPrice;

  const basePrice = (getHashCode(symbol) % range) + minPrice;

  // 生成小幅波動 (-5% ~ +5%)
  const changePercent = (Math.random() * 10 - 5) / 100;
  const change = basePrice * changePercent;
  const price = basePrice + change;

  // 貨幣設置
  const currency = isTaiwanStock ? 'TWD' : 'USD';
  const exchangeName = isTaiwanStock ? 'TWSE' : 'NASDAQ';

  console.log(`使用模擬數據 ${symbol}: ${price.toFixed(2)} ${currency}`);

  return {
    symbol,
    price,
    change,
    changePercent,
    time: new Date(),
    currency,
    exchangeName,
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
export function formatPrice(price, currency, digits = 2) {
  if (price === null || price === undefined) return '-';

  // 貨幣符號
  const currencySymbol = currency === 'TWD' ? 'NT$' : '$';

  return `${currencySymbol}${price.toFixed(digits)}`;
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
