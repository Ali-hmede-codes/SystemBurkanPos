const Store = require('../../models/Store');
const ApiResponse = require('../../helpers/apiResponse');

const storesController = {
  // GET /api/stores
  async getAll(req, res) {
    try {
      const stores = await Store.getAll();
      return ApiResponse.success(res, stores, 'Stores retrieved successfully');
    } catch (error) {
      console.error('Get stores error:', error.message);
      return ApiResponse.error(res, 'Failed to retrieve stores');
    }
  },

  // GET /api/stores/:id
  async getById(req, res) {
    try {
      const store = await Store.getById(req.params.id);
      if (!store) return ApiResponse.notFound(res, 'Store not found');
      return ApiResponse.success(res, store, 'Store retrieved successfully');
    } catch (error) {
      console.error('Get store error:', error.message);
      return ApiResponse.error(res, 'Failed to retrieve store');
    }
  },

  // POST /api/stores
  async create(req, res) {
    try {
      const { name, location, phone_number } = req.body;
      const store = await Store.create({ name, location, phone_number });
      return ApiResponse.created(res, store, 'Store created successfully');
    } catch (error) {
      console.error('Create store error:', error.message);
      return ApiResponse.error(res, 'Failed to create store');
    }
  },

  // PUT /api/stores/:id
  async update(req, res) {
    try {
      const existing = await Store.getById(req.params.id);
      if (!existing) return ApiResponse.notFound(res, 'Store not found');

      const { name, location, phone_number } = req.body;
      const store = await Store.update(req.params.id, { name, location, phone_number });
      return ApiResponse.success(res, store, 'Store updated successfully');
    } catch (error) {
      console.error('Update store error:', error.message);
      return ApiResponse.error(res, 'Failed to update store');
    }
  },

  // DELETE /api/stores/:id
  async delete(req, res) {
    try {
      const existing = await Store.getById(req.params.id);
      if (!existing) return ApiResponse.notFound(res, 'Store not found');

      await Store.delete(req.params.id);
      return ApiResponse.success(res, null, 'Store deleted successfully');
    } catch (error) {
      console.error('Delete store error:', error.message);
      return ApiResponse.error(res, 'Failed to delete store');
    }
  },
};

module.exports = storesController;
