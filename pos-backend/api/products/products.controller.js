const Product = require('../../models/Product');
const ApiResponse = require('../../helpers/apiResponse');

const productsController = {
  // GET /api/products?store_id=X&category_id=Y
  async getAll(req, res) {
    try {
      const { store_id, category_id } = req.query;
      const products = await Product.getAll(store_id, category_id);
      return ApiResponse.success(res, products, 'Products retrieved successfully');
    } catch (error) {
      console.error('Get products error:', error.message);
      return ApiResponse.error(res, 'Failed to retrieve products');
    }
  },

  // GET /api/products/:id
  async getById(req, res) {
    try {
      const product = await Product.getById(req.params.id);
      if (!product) return ApiResponse.notFound(res, 'Product not found');
      return ApiResponse.success(res, product, 'Product retrieved successfully');
    } catch (error) {
      console.error('Get product error:', error.message);
      return ApiResponse.error(res, 'Failed to retrieve product');
    }
  },

  // GET /api/products/store/:storeId
  async getByStore(req, res) {
    try {
      const products = await Product.getByStoreId(req.params.storeId);
      return ApiResponse.success(res, products, 'Products retrieved successfully');
    } catch (error) {
      console.error('Get products by store error:', error.message);
      return ApiResponse.error(res, 'Failed to retrieve products');
    }
  },

  // POST /api/products
  async create(req, res) {
    try {
      const { store_id, category_id, name, price, description, sku } = req.body;
      const product = await Product.create({ store_id, category_id, name, price, description, sku });
      return ApiResponse.created(res, product, 'Product created successfully');
    } catch (error) {
      console.error('Create product error:', error.message);
      return ApiResponse.error(res, 'Failed to create product');
    }
  },

  // PUT /api/products/:id
  async update(req, res) {
    try {
      const existing = await Product.getById(req.params.id);
      if (!existing) return ApiResponse.notFound(res, 'Product not found');

      const { store_id, category_id, name, price, description, sku, is_active } = req.body;
      const product = await Product.update(req.params.id, {
        store_id, category_id, name, price, description, sku,
        is_active: is_active !== undefined ? is_active : existing.is_active,
      });
      return ApiResponse.success(res, product, 'Product updated successfully');
    } catch (error) {
      console.error('Update product error:', error.message);
      return ApiResponse.error(res, 'Failed to update product');
    }
  },

  // DELETE /api/products/:id
  async delete(req, res) {
    try {
      const existing = await Product.getById(req.params.id);
      if (!existing) return ApiResponse.notFound(res, 'Product not found');

      await Product.delete(req.params.id);
      return ApiResponse.success(res, null, 'Product deleted successfully');
    } catch (error) {
      console.error('Delete product error:', error.message);
      return ApiResponse.error(res, 'Failed to delete product');
    }
  },
};

module.exports = productsController;
