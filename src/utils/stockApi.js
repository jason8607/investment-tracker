/**
 * 股票 API 工具函數
 * 使用 Yahoo Finance API 獲取股票價格
 * 支持台股和美股市場
 * 使用 CORS 代理解決跨來源問題
 */

// 設置 CORS 代理 (可選用不同的服務)
const CORS_PROXY = 'https://corsproxy.io/?';
// 備用代理
const BACKUP_CORS_PROXIES = [
  'https://api.allorigins.win/raw?url=',
  'https://cors-anywhere.herokuapp.com/',
];

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

  // 添加隨機參數避免緩存和限制
  const timestamp = new Date().getTime();
  // 構建原始 Yahoo Finance API URL
  const apiUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${normalizedSymbol}?interval=1d&t=${timestamp}`;

  // 使用主要 CORS 代理
  let proxyUrl = `${CORS_PROXY}${encodeURIComponent(apiUrl)}`;
  let currentProxyIndex = -1; // 從主代理開始

  console.log(`請求股票數據：${normalizedSymbol}`);

  // 允許最多嘗試所有代理
  const maxRetries = BACKUP_CORS_PROXIES.length + 1;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // 使用 Yahoo Finance API (通過代理)
      const response = await fetch(proxyUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          Accept: 'application/json',
          'Cache-Control': 'no-cache',
        },
      });

      // 檢查返回狀態
      if (!response.ok) {
        console.warn(
          `API 請求失敗 (${normalizedSymbol}): ${response.status} ${response.statusText}`,
        );

        // 如果還有備用代理可用，則嘗試下一個
        currentProxyIndex++;
        if (currentProxyIndex < BACKUP_CORS_PROXIES.length) {
          proxyUrl = `${
            BACKUP_CORS_PROXIES[currentProxyIndex]
          }${encodeURIComponent(apiUrl)}`;
          console.log(`嘗試下一個代理 #${currentProxyIndex + 1}...`);
          continue;
        }

        throw new Error(
          `API 請求失敗: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();

      // 檢查是否有錯誤
      if (data.chart?.error) {
        throw new Error(`Yahoo API 錯誤: ${JSON.stringify(data.chart.error)}`);
      }

      // 確保數據結構存在
      if (!data.chart?.result?.[0]?.meta) {
        throw new Error('API 返回數據結構異常');
      }

      // 獲取最新價格
      const result = data.chart.result[0];
      const price = result.meta.regularMarketPrice;

      // 貨幣符號 (台幣或美元)
      const currency =
        result.meta.currency ||
        (normalizedSymbol.endsWith('.TW') ? 'TWD' : 'USD');

      console.log(`成功獲取 ${normalizedSymbol} 價格: ${price} ${currency}`);

      return {
        symbol: normalizedSymbol,
        price,
        change: result.meta.regularMarketChange,
        changePercent: result.meta.regularMarketChangePercent,
        time: new Date(result.meta.regularMarketTime * 1000),
        currency,
        exchangeName: result.meta.exchangeName || '',
        lastUpdated: new Date(),
      };
    } catch (error) {
      // 如果這是最後一次嘗試，拋出錯誤
      if (
        attempt === maxRetries - 1 ||
        currentProxyIndex >= BACKUP_CORS_PROXIES.length - 1
      ) {
        console.error(`獲取 ${normalizedSymbol} 價格失敗:`, error);
        throw error;
      }

      // 否則嘗試下一個代理
      currentProxyIndex++;
      proxyUrl = `${BACKUP_CORS_PROXIES[currentProxyIndex]}${encodeURIComponent(
        apiUrl,
      )}`;
      console.log(`API 錯誤，嘗試下一個代理 #${currentProxyIndex + 1}...`);
    }
  }

  // 不應該到達這裡，但為了安全起見
  throw new Error(`無法獲取 ${normalizedSymbol} 的股票數據`);
}

// 獲取多個股票價格
export async function getMultipleStockPrices(symbols) {
  // 過濾掉空值
  const validSymbols = symbols.filter((s) => s && s.trim());

  if (validSymbols.length === 0) {
    return [];
  }

  // 同時獲取多個股票價格，但限制並發請求數量
  const results = [];
  const batchSize = 2; // 一次最多處理 2 個請求，避免超出限制

  console.log(`開始批量獲取 ${validSymbols.length} 支股票數據`);

  for (let i = 0; i < validSymbols.length; i += batchSize) {
    const batch = validSymbols.slice(i, i + batchSize);
    console.log(
      `處理批次 ${Math.floor(i / batchSize) + 1}/${Math.ceil(
        validSymbols.length / batchSize,
      )}: ${batch.join(', ')}`,
    );

    const promises = batch.map((symbol) =>
      getStockPrice(symbol).catch((error) => {
        console.error(`獲取 ${symbol} 數據失敗:`, error);
        return {
          error: true,
          errorMessage: error.message || '未知錯誤',
          symbol: normalizeSymbol(symbol),
          originalSymbol: symbol,
        };
      }),
    );

    const batchResults = await Promise.all(promises);
    results.push(...batchResults);

    if (i + batchSize < validSymbols.length) {
      // 添加延遲避免被限制請求
      console.log('延遲 1.5 秒後獲取下一批...');
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  }

  // 格式化返回結果
  return results.map((result, index) => {
    if (result.error) {
      return {
        originalSymbol: validSymbols[index],
        symbol: normalizeSymbol(validSymbols[index]),
        price: null,
        error: true,
        errorMessage: result.errorMessage || '獲取數據失敗',
      };
    }

    return {
      originalSymbol: validSymbols[index],
      ...result,
    };
  });
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
