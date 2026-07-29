const Stats = require('../../models/Stats');
const ApiResponse = require('../../helpers/apiResponse');

const statsController = {
  // GET /api/stats/today
  async getToday(req, res) {
    try {
      const today = await Stats.getToday();
      const byStatus = await Stats.getTodayByStatus();
      return ApiResponse.success(res, { today, by_status: byStatus }, 'Today stats retrieved');
    } catch (error) {
      console.error('Get today stats error:', error.message);
      return ApiResponse.error(res, 'Failed to get today stats');
    }
  },

  // GET /api/stats/monthly?year=2026
  async getMonthly(req, res) {
    try {
      const { year } = req.query;
      const monthly = await Stats.getMonthly(year ? parseInt(year) : null);
      return ApiResponse.success(res, monthly, 'Monthly stats retrieved');
    } catch (error) {
      console.error('Get monthly stats error:', error.message);
      return ApiResponse.error(res, 'Failed to get monthly stats');
    }
  },

  // GET /api/stats/daily?year=2026&month=7
  async getDaily(req, res) {
    try {
      const { year, month } = req.query;
      const y = year ? parseInt(year) : new Date().getFullYear();
      const m = month ? parseInt(month) : new Date().getMonth() + 1;
      const daily = await Stats.getDaily(y, m);
      return ApiResponse.success(res, daily, 'Daily stats retrieved');
    } catch (error) {
      console.error('Get daily stats error:', error.message);
      return ApiResponse.error(res, 'Failed to get daily stats');
    }
  },

  // GET /api/stats/by-store?start_date=2026-01-01&end_date=2026-12-31
  async getByStore(req, res) {
    try {
      const { start_date, end_date } = req.query;
      const data = await Stats.getByStore(start_date, end_date);
      return ApiResponse.success(res, data, 'Store stats retrieved');
    } catch (error) {
      console.error('Get store stats error:', error.message);
      return ApiResponse.error(res, 'Failed to get store stats');
    }
  },
};

module.exports = statsController;
