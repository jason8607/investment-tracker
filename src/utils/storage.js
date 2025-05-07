const STOCKS_KEY = 'investment-tracker-stocks';
const REALIZED_KEY = 'investment-tracker-realized';

export function useStorage() {
  // 獲取持股資料
  const getStocks = () => {
    try {
      const data = localStorage.getItem(STOCKS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('無法讀取持股資料', error);
      return [];
    }
  };

  // 設置持股資料
  const setStocks = (stocks) => {
    try {
      localStorage.setItem(STOCKS_KEY, JSON.stringify(stocks));
    } catch (error) {
      console.error('無法儲存持股資料', error);
    }
  };

  // 新增持股
  const addStock = (stock) => {
    const stocks = getStocks();
    stocks.push(stock);
    setStocks(stocks);
  };

  // 更新持股
  const updateStock = (index, updatedStock) => {
    const stocks = getStocks();
    stocks[index] = updatedStock;
    setStocks(stocks);
  };

  // 刪除持股
  const deleteStock = (index) => {
    const stocks = getStocks();
    stocks.splice(index, 1);
    setStocks(stocks);
  };

  // 獲取已實現收益資料
  const getRealizedTrades = () => {
    try {
      const data = localStorage.getItem(REALIZED_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('無法讀取已實現收益資料', error);
      return [];
    }
  };

  // 設置已實現收益資料
  const setRealizedTrades = (trades) => {
    try {
      localStorage.setItem(REALIZED_KEY, JSON.stringify(trades));
    } catch (error) {
      console.error('無法儲存已實現收益資料', error);
    }
  };

  // 新增已實現收益
  const addRealizedTrade = (trade) => {
    const trades = getRealizedTrades();
    trades.push(trade);
    setRealizedTrades(trades);
  };

  // 更新已實現收益
  const updateRealizedTrade = (index, updatedTrade) => {
    const trades = getRealizedTrades();
    trades[index] = updatedTrade;
    setRealizedTrades(trades);
  };

  // 刪除已實現收益
  const deleteRealizedTrade = (index) => {
    const trades = getRealizedTrades();
    trades.splice(index, 1);
    setRealizedTrades(trades);
  };

  return {
    getStocks,
    setStocks,
    addStock,
    updateStock,
    deleteStock,
    getRealizedTrades,
    setRealizedTrades,
    addRealizedTrade,
    updateRealizedTrade,
    deleteRealizedTrade,
  };
}
