const Bill = require('../../models/Bill');
const ApiResponse = require('../../helpers/apiResponse');

const billsController = {
  // GET /api/bills?store_id=X&status=Y
  async getAll(req, res) {
    try {
      const { store_id, status } = req.query;
      const bills = await Bill.getAll(store_id, status);
      return ApiResponse.success(res, bills, 'Bills retrieved successfully');
    } catch (error) {
      console.error('Get bills error:', error.message);
      return ApiResponse.error(res, 'Failed to retrieve bills');
    }
  },

  // GET /api/bills/:id
  async getById(req, res) {
    try {
      const bill = await Bill.getById(req.params.id);
      if (!bill) return ApiResponse.notFound(res, 'Bill not found');
      return ApiResponse.success(res, bill, 'Bill retrieved successfully');
    } catch (error) {
      console.error('Get bill error:', error.message);
      return ApiResponse.error(res, 'Failed to retrieve bill');
    }
  },

  // POST /api/bills
  async create(req, res) {
    try {
      const { store_id, customer_name, customer_phone, customer_address, delivery_cost, notes, items } = req.body;

      if (!items || items.length === 0) {
        return ApiResponse.error(res, 'Bill must have at least one item', 400);
      }

      const bill = await Bill.create({
        store_id,
        customer_name,
        customer_phone,
        customer_address,
        delivery_cost,
        notes,
        items,
      });

      return ApiResponse.created(res, bill, 'Bill created successfully');
    } catch (error) {
      console.error('Create bill error:', error.message);
      return ApiResponse.error(res, 'Failed to create bill');
    }
  },

  // PUT /api/bills/:id
  async update(req, res) {
    try {
      const existing = await Bill.getById(req.params.id);
      if (!existing) return ApiResponse.notFound(res, 'Bill not found');

      const { store_id, customer_name, customer_phone, customer_address, delivery_cost, status, notes, items } = req.body;

      if (!items || items.length === 0) {
        return ApiResponse.error(res, 'Bill must have at least one item', 400);
      }

      const bill = await Bill.update(req.params.id, {
        store_id,
        customer_name,
        customer_phone,
        customer_address,
        delivery_cost,
        status,
        notes,
        items,
      });

      return ApiResponse.success(res, bill, 'Bill updated successfully');
    } catch (error) {
      console.error('Update bill error:', error.message);
      return ApiResponse.error(res, 'Failed to update bill');
    }
  },

  // PATCH /api/bills/:id/status
  async updateStatus(req, res) {
    try {
      const existing = await Bill.getById(req.params.id);
      if (!existing) return ApiResponse.notFound(res, 'Bill not found');

      const { status } = req.body;
      const validStatuses = ['draft', 'confirmed', 'delivered', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return ApiResponse.error(res, `Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
      }

      const bill = await Bill.updateStatus(req.params.id, status);
      return ApiResponse.success(res, bill, 'Bill status updated successfully');
    } catch (error) {
      console.error('Update bill status error:', error.message);
      return ApiResponse.error(res, 'Failed to update bill status');
    }
  },

  // DELETE /api/bills/:id
  async delete(req, res) {
    try {
      const existing = await Bill.getById(req.params.id);
      if (!existing) return ApiResponse.notFound(res, 'Bill not found');

      await Bill.delete(req.params.id);
      return ApiResponse.success(res, null, 'Bill deleted successfully');
    } catch (error) {
      console.error('Delete bill error:', error.message);
      return ApiResponse.error(res, 'Failed to delete bill');
    }
  },
};

module.exports = billsController;
