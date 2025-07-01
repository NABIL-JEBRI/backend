// backend/src/controllers/seller/sellerOrderController.js
const orderProcessingService = require('../../services/orderProcessingService');
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');

/**
 * @desc    Get all orders relevant to the authenticated seller (orders containing their products)
 * @route   GET /api/v1/seller/orders
 * @access  Private (Seller only)
 */
exports.getSellerOrders = catchAsync(async (req, res, next) => {
    const sellerId = req.user.id;
    // Filters could include status, date range, customer, etc.
    const queryParams = req.query;

    const { orders, pagination } = await orderProcessingService.getOrdersForSeller(sellerId, queryParams);

    res.status(200).json({
        success: true,
        count: orders.length,
        pagination,
        data: orders,
    });
});

/**
 * @desc    Get a single order relevant to the authenticated seller
 * @route   GET /api/v1/seller/orders/:orderId
 * @access  Private (Seller only)
 */
exports.getSellerOrderById = catchAsync(async (req, res, next) => {
    const { orderId } = req.params;
    const sellerId = req.user.id;

    const order = await orderProcessingService.getOrderForSeller(orderId, sellerId);

    if (!order) {
        return next(new ApiError('Order not found or you are not authorized to view it.', 404));
    }

    res.status(200).json({
        success: true,
        data: order,
    });
});

/**
 * @desc    Update the status of specific items within an order for the seller
 * This is crucial for sellers to mark items as processed, shipped, etc.
 * @route   PUT /api/v1/seller/orders/:orderId/items/:itemId/status
 * @access  Private (Seller only)
 */
exports.updateOrderItemStatus = catchAsync(async (req, res, next) => {
    const { orderId, itemId } = req.params;
    const { newStatus } = req.body;
    const sellerId = req.user.id;

    if (!newStatus) {
        return next(new ApiError('New status is required.', 400));
    }

    const updatedOrder = await orderProcessingService.updateOrderItemStatus(orderId, itemId, newStatus, sellerId);

    res.status(200).json({
        success: true,
        message: `Item ${itemId} status updated to "${newStatus}".`,
        data: updatedOrder,
    });
});

/**
 * @desc    (Optional) Confirm order fulfillment by seller (e.g., ready for pickup/shipment)
 * This might trigger a notification to the delivery system.
 * @route   PUT /api/v1/seller/orders/:orderId/confirm-fulfillment
 * @access  Private (Seller only)
 */
exports.confirmOrderFulfillment = catchAsync(async (req, res, next) => {
    const { orderId } = req.params;
    const sellerId = req.user.id;

    const updatedOrder = await orderProcessingService.confirmSellerFulfillment(orderId, sellerId);

    res.status(200).json({
        success: true,
        message: 'Order fulfillment confirmed by seller.',
        data: updatedOrder,
    });
});

// You might also add endpoints for:
// - Seller processing returns/refunds for their products
// - Viewing order analytics