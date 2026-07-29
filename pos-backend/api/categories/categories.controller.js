const Category = require('../../models/Category');
const ApiResponse = require('../../helpers/apiResponse');

const categoriesController = {
  // GET /api/categories?store_id=X
  async getAll(req, res) {
    try {
      const { store_id } = req.query;
      const categories = await Category.getAll(store_id);
      return ApiResponse.success(res, categories, 'Categories retrieved successfully');
    } catch (error) {
      console.error('Get categories error:', error.message);
      return ApiResponse.error(res, 'Failed to retrieve categories');
    }
  },

  // GET /api/categories/:id
  async getById(req, res) {
    try {
      const category = await Category.getById(req.params.id);
      if (!category) return ApiResponse.notFound(res, 'Category not found');
      return ApiResponse.success(res, category, 'Category retrieved successfully');
    } catch (error) {
      console.error('Get category error:', error.message);
      return ApiResponse.error(res, 'Failed to retrieve category');
    }
  },

  // GET /api/categories/store/:storeId
  async getByStore(req, res) {
    try {
      const categories = await Category.getByStoreId(req.params.storeId);
      return ApiResponse.success(res, categories, 'Categories retrieved successfully');
    } catch (error) {
      console.error('Get categories by store error:', error.message);
      return ApiResponse.error(res, 'Failed to retrieve categories');
    }
  },

  // POST /api/categories
  async create(req, res) {
    try {
      const { store_id, name, description } = req.body;
      const category = await Category.create({ store_id, name, description });
      return ApiResponse.created(res, category, 'Category created successfully');
    } catch (error) {
      console.error('Create category error:', error.message);
      return ApiResponse.error(res, 'Failed to create category');
    }
  },

  // PUT /api/categories/:id
  async update(req, res) {
    try {
      const existing = await Category.getById(req.params.id);
      if (!existing) return ApiResponse.notFound(res, 'Category not found');

      const { store_id, name, description } = req.body;
      const category = await Category.update(req.params.id, { store_id, name, description });
      return ApiResponse.success(res, category, 'Category updated successfully');
    } catch (error) {
      console.error('Update category error:', error.message);
      return ApiResponse.error(res, 'Failed to update category');
    }
  },

  // DELETE /api/categories/:id
  async delete(req, res) {
    try {
      const existing = await Category.getById(req.params.id);
      if (!existing) return ApiResponse.notFound(res, 'Category not found');

      await Category.delete(req.params.id);
      return ApiResponse.success(res, null, 'Category deleted successfully');
    } catch (error) {
      console.error('Delete category error:', error.message);
      return ApiResponse.error(res, 'Failed to delete category');
    }
  },
};

module.exports = categoriesController;
