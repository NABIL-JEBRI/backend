// backend/src/controllers/admin/orderManagement.js
const orderProcessingService = require('../../services/orderProcessingService');
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');

/**
 * @desc    Get all orders (for full visibility by admin)
 * @route   GET /api/v1/admin/orders
 * @access  Private (Admin only)
 */
exports.getAllOrdersAdmin = catchAsync(async (req, res, next) => {
    const { orders, pagination } = await orderProcessingService.getAllOrders(req.query);

    res.status(200).json({
        success: true,
        count: orders.length,
        pagination,
        data: orders,
    });
});

/**
 * @desc    Get a single order by ID (for admin)
 * @route   GET /api/v1/admin/orders/:id
 * @access  Private (Admin only)
 */
exports.getOrderByIdAdmin = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const order = await orderProcessingService.getOrderById(id); // Re-use existing service method

    if (!order) {
        return next(new ApiError('Order not found.', 404));
    }

    res.status(200).json({
        success: true,
        data: order,
    });
});

/**
 * @desc    Update the overall status of an order (e.g., 'processing', 'shipped', 'delivered')
 * @route   PUT /api/v1/admin/orders/:id/status
 * @access  Private (Admin only)
 */
exports.updateOrderStatusAdmin = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { newStatus } = req.body;

    if (!newStatus) {
        return next(new ApiError('New status is required.', 400));
    }

    const updatedOrder = await orderProcessingService.updateOrderStatus(id, newStatus, req.user.id);

    res.status(200).json({
        success: true,
        message: `Order status updated to "${newStatus}".`,
        data: updatedOrder,
    });
});

/**
 * @desc    Process a refund for an order (admin initiated)
 * @route   POST /api/v1/admin/orders/:id/refund
 * @access  Private (Admin only)
 */
exports.processRefundAdmin = catchAsync(async (req, res, next) => {
    const { id } = req.params; // Order ID
    const { amount, reason } = req.body;

    if (!amount || !reason) {
        return next(new ApiError('Amount and reason are required for a refund.', 400));
    }

    // This would call a service method that handles financial transactions
    const refundResult = await orderProcessingService.processOrderRefund(id, amount, reason, req.user.id);

    res.status(200).json({
        success: true,
        message: 'Refund processed successfully.',
        data: refundResult,
    });
});

/**
 * @desc    Approve/Reject an initiated return request
 * @route   PUT /api/v1/admin/orders/:orderId/returns/:returnId/status
 * @access  Private (Admin only)
 */
exports.updateReturnStatus = catchAsync(async (req, res, next) => {
    const { orderId, returnId } = req.params;
    const { newStatus, notes } = req.body; // e.g., 'approved', 'rejected', 'completed'

    if (!newStatus) {
        return next(new ApiError('New status for return request is required.', 400));
    }

    const updatedReturn = await orderProcessingService.updateReturnRequestStatus(
        orderId,
        returnId,
        newStatus,
        notes,
        req.user.id
    );

    res.status(200).json({
        success: true,
        message: `Return request status updated to "${newStatus}".`,
        data: updatedReturn,
    });
});