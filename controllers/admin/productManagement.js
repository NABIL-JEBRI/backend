// backend/src/controllers/admin/productManagement.js
const productManagementService = require('../../services/productManagementService');
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');

/**
 * @desc    Get all products (including unapproved ones for admin review)
 * @route   GET /api/v1/admin/products
 * @access  Private (Admin only)
 */
exports.getAllProductsAdmin = catchAsync(async (req, res, next) => {
    // Admin can see all products, including pending approval
    const queryParams = { ...req.query };
    delete queryParams.isApproved; // Admin overrides this filter for full view

    const { products, pagination } = await productManagementService.getProducts(queryParams);

    res.status(200).json({
        success: true,
        count: products.length,
        pagination,
        data: products,
    });
});

/**
 * @desc    Approve or Reject a Product
 * @route   PUT /api/v1/admin/products/:id/approve-reject
 * @access  Private (Admin only)
 */
exports.approveRejectProduct = catchAsync(async (req, res, next) => {
    const { id } = req.params; // Product ID
    const { action, reason } = req.body; // 'approve' or 'reject'

    if (!action || !['approve', 'reject'].includes(action)) {
        return next(new ApiError('Invalid action. Must be "approve" or "reject".', 400));
    }

    const updatedProduct = await productManagementService.processProductApproval(id, action, reason);

    res.status(200).json({
        success: true,
        message: `Product ${action}ed successfully.`,
        data: updatedProduct,
    });
});

/**
 * @desc    Force Delete a Product (admin override)
 * @route   DELETE /api/v1/admin/products/:id
 * @access  Private (Admin only)
 */
exports.deleteProductAdmin = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    // The service might have a flag to indicate admin deletion vs seller deletion
    await productManagementService.deleteProduct(id, null, true); // null for sellerId, true for admin override

    res.status(200).json({
        success: true,
        message: 'Product deleted by admin successfully.',
    });
});

// Note: Category and Brand management might be in separate controllers or handled by a dedicated service.
// For now, let's assume they are handled within a 'CategoryService' and 'BrandService' if needed.
// Or, if simple, directly in productManagement.js controller for admin.
// For now, we'll assume `categoryController.js` handles CRUD for categories for both public view and admin management.
// So no separate category/brand methods here.