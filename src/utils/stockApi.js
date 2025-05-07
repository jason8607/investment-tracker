/**
 * 股票 API 工具函數
 * 使用 Yahoo Finance API 獲取股票價格
 * 支持台股和美股市場
 * 使用自託管的後端服務解決跨來源問題
 */

import axios from 'axios';

// 設置後端 API 基礎URL
const API_BASE_URL = 'https://yahoo-finance-backend.vercel.app';

// 匯率緩存，避免頻繁請求
let exchangeRateCache = {
  USD_TWD: null,
  lastUpdated: null,
};

// 獲取美元兌台幣的匯率
export async function getUSDToTWDRate() {
  // 如果緩存存在且未過期（1小時內有效），則使用緩存
  const now = new Date();
  if (
    exchangeRateCache.USD_TWD &&
    exchangeRateCache.lastUpdated &&
    now - exchangeRateCache.lastUpdated < 3600000
  ) {
    console.log('使用緩存的匯率數據');
    return exchangeRateCache.USD_TWD;
  }

  try {
    // 嘗試使用不同的匯率代碼格式
    const symbols = ['USDTWD=X', 'TWD=X'];

    // 首先嘗試 USDTWD=X
    let response;
    let rate = null;

    for (const symbol of symbols) {
      try {
        const apiUrl = `${API_BASE_URL}/api/stock/${symbol}`;
        console.log(`請求美元兌台幣匯率 (${symbol})...`);

        response = await axios.get(apiUrl, {
          headers: {
            Accept: 'application/json',
            'Cache-Control': 'no-cache',
          },
          timeout: 10000,
        });

        if (!response.data.error && response.data.price) {
          rate = response.data.price;
          console.log(
            `成功獲取美元兌台幣匯率: 1 USD = ${rate} TWD (使用${symbol})`,
          );
          break;
        }
      } catch (err) {
        console.error(`使用 ${symbol} 獲取匯率失敗:`, err.message);
      }
    }

    // 如果沒有獲取到有效匯率，使用備用方法：固定值約30
    if (!rate) {
      console.log('無法從API獲取匯率，使用預設值');
      rate = 30;
    }

    // 更新緩存
    exchangeRateCache = {
      USD_TWD: rate,
      lastUpdated: now,
    };

    // 同時存入localStorage以便跨會話使用
    try {
      localStorage.setItem(
        'exchange-rate-cache',
        JSON.stringify(exchangeRateCache),
      );
    } catch (error) {
      console.error('無法將匯率數據存入localStorage', error);
    }

    return rate;
  } catch (error) {
    console.error('獲取匯率失敗:', error);

    // 如果請求失敗，嘗試從localStorage讀取舊數據
    try {
      const cachedData = localStorage.getItem('exchange-rate-cache');
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        console.log('使用localStorage中的匯率數據');
        return parsed.USD_TWD;
      }
    } catch (e) {
      console.error('讀取緩存匯率失敗', e);
    }

    // 如果所有方法都失敗，返回一個預設值（約30，實際匯率會波動）
    return 30;
  }
}

// 將美元轉換為新台幣
export function convertUSDToTWD(usdAmount, exchangeRate) {
  if (!usdAmount) return 0;
  if (!exchangeRate) exchangeRate = 30; // 預設匯率約30
  return usdAmount * exchangeRate;
}

/**
 * 確保股票代碼包含正確的後綴
 * 台股應該是 4碼.TW 格式，如 2330.TW
 * 美股不需要後綴，但可以是 AAPL 或 AAPL.US 格式
 */
export function normalizeSymbol(symbol) {
  if (!symbol) return '';

  // 已經有後綴的情況
  if (symbol.includes('.')) return symbol;

  // 從純數字判斷改為更準確的判斷方式
  const isTaiwanStock =
    symbol.includes('.TW') ||
    (symbol.length <= 6 && /^\d{4,}[A-Za-z]?$/.test(symbol));

  if (isTaiwanStock) {
    return `${symbol}.TW`;
  } else {
    return symbol; // 美股保持原樣
  }
}

// 獲取單個股票價格
export async function getStockPrice(symbol) {
  // 確保股票代碼格式正確
  const originalSymbol = symbol;
  const normalizedSymbol = normalizeSymbol(symbol);
  const apiUrl = `${API_BASE_URL}/api/stock/${normalizedSymbol}`;

  console.log(`請求股票數據：${normalizedSymbol}`);

  try {
    const response = await axios.get(apiUrl, {
      headers: {
        Accept: 'application/json',
        'Cache-Control': 'no-cache',
      },
      timeout: 10000, // 10秒超時
    });

    // 檢查是否有錯誤
    if (response.data.error) {
      throw new Error(`API 錯誤: ${response.data.error}`);
    }

    console.log(
      `成功獲取 ${normalizedSymbol} 價格: ${response.data.price} ${response.data.currency}`,
    );

    // 確保返回的數據中包含原始符號
    return {
      ...response.data,
      originalSymbol: originalSymbol,
    };
  } catch (error) {
    console.error(`獲取 ${normalizedSymbol} 價格失敗:`, error);
    if (error.response) {
      // 服務器返回了錯誤狀態碼
      throw new Error(
        `API 請求失敗: ${error.response.status} ${error.response.statusText}`,
      );
    } else if (error.request) {
      // 請求已發送但沒有收到回應
      throw new Error('無法連接到服務器，請檢查網絡連接');
    } else {
      // 在請求設置時發生錯誤
      throw error;
    }
  }
}

// 獲取多個股票價格
export async function getMultipleStockPrices(symbols) {
  // 過濾掉空值
  const validSymbols = symbols.filter((s) => s && s.trim());

  if (validSymbols.length === 0) {
    return [];
  }

  // 使用批量API端點
  // 創建包含原始與標準化symbol的映射以便於後續處理
  const normalizedSymbols = validSymbols.map((symbol) =>
    normalizeSymbol(symbol),
  );
  const apiUrl = `${API_BASE_URL}/api/stocks?symbols=${normalizedSymbols.join(
    ',',
  )}`;
  console.log(`批量獲取股票數據: ${validSymbols.join(', ')}`);

  try {
    const response = await axios.get(apiUrl, {
      headers: {
        Accept: 'application/json',
        'Cache-Control': 'no-cache',
      },
      timeout: 15000, // 15秒超時，批量請求可能需要更長時間
    });

    console.log(`成功獲取 ${response.data.length} 支股票數據`);

    // 確保每個結果都有originalSymbol屬性，如果後端沒提供
    const results = response.data.map((item, index) => {
      if (!item.originalSymbol) {
        item.originalSymbol = validSymbols[index];
      }
      return item;
    });

    return results;
  } catch (error) {
    console.error('批量獲取股票數據失敗:', error);

    // 如果批量API失敗，退回到逐個請求
    console.log('嘗試逐個獲取股票數據...');

    const promises = validSymbols.map((symbol) =>
      getStockPrice(symbol).catch((err) => {
        console.error(`獲取 ${symbol} 數據失敗:`, err);
        return {
          error: true,
          errorMessage: err.message || '未知錯誤',
          symbol: normalizeSymbol(symbol),
          originalSymbol: symbol,
        };
      }),
    );

    return Promise.all(promises);
  }
}

// 格式化價格
export function formatPrice(price, currency, digits = 2) {
  if (price === null || price === undefined) return '-';

  // 貨幣符號
  const currencySymbol = currency === 'TWD' ? 'NT$' : 'US$';

  return `${currencySymbol}${price.toFixed(digits)}`;
}

// 格式化美股價格（顯示美元和台幣）
export function formatUSPrice(price, exchangeRate, digits = 2) {
  if (price === null || price === undefined) return '-';

  const usdFormatted = `US$${price.toFixed(digits)}`;
  const twdFormatted = `NT$${(price * exchangeRate).toFixed(digits)}`;

  return `${usdFormatted} (${twdFormatted})`;
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
