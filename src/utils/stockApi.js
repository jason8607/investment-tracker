/**
 * 股票 API 工具函數
 * 使用 Yahoo Finance API 獲取股票價格
 * 支持台股和美股市場
 * 使用自託管的後端服務解決跨來源問題
 */

// 設置後端 API 基礎URL
const API_BASE_URL = 'https://yahoo-finance-backend.vercel.app/api/stock';

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
  // 確保股票代碼格式正確
  const normalizedSymbol = normalizeSymbol(symbol);
  const apiUrl = `${API_BASE_URL}/api/stock/${normalizedSymbol}`;

  console.log(`請求股票數據：${normalizedSymbol}`);

  try {
    const response = await fetch(apiUrl, {
      headers: {
        Accept: 'application/json',
        'Cache-Control': 'no-cache',
      },
    });

    // 檢查返回狀態
    if (!response.ok) {
      console.warn(
        `API 請求失敗 (${normalizedSymbol}): ${response.status} ${response.statusText}`,
      );
      throw new Error(
        `API 請求失敗: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();

    // 檢查是否有錯誤
    if (data.error) {
      throw new Error(`API 錯誤: ${data.error}`);
    }

    console.log(
      `成功獲取 ${normalizedSymbol} 價格: ${data.price} ${data.currency}`,
    );

    return data;
  } catch (error) {
    console.error(`獲取 ${normalizedSymbol} 價格失敗:`, error);
    throw error;
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
  const apiUrl = `${API_BASE_URL}/api/stocks?symbols=${validSymbols.join(',')}`;
  console.log(`批量獲取股票數據: ${validSymbols.join(', ')}`);

  try {
    const response = await fetch(apiUrl, {
      headers: {
        Accept: 'application/json',
        'Cache-Control': 'no-cache',
      },
    });

    if (!response.ok) {
      console.warn(
        `批量API請求失敗: ${response.status} ${response.statusText}`,
      );
      throw new Error(
        `批量API請求失敗: ${response.status} ${response.statusText}`,
      );
    }

    const results = await response.json();
    console.log(`成功獲取 ${results.length} 支股票數據`);

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
