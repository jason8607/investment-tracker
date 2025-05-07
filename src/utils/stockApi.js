/**
 * 股票 API 工具函數
 * 使用 Yahoo Finance API 獲取股票價格
 */

// 獲取單個股票價格
export async function getStockPrice(symbol) {
  try {
    // 使用 Yahoo Finance API
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d`,
    );
    const data = await response.json();

    // 檢查是否有錯誤
    if (data.chart.error) {
      console.error('獲取股票價格出錯', data.chart.error);
      return null;
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
    return null;
  }
}

// 獲取多個股票價格
export async function getMultipleStockPrices(symbols) {
  try {
    // 同時獲取多個股票價格
    const promises = symbols.map((symbol) => getStockPrice(symbol));
    const results = await Promise.allSettled(promises);

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
