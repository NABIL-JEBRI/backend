// backend/src/controllers/payment/cashOnDeliveryController.js
const cashOnDeliveryService = require('../../services/cashOnDeliveryService');
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');

/**
 * @desc    Confirm a Cash on Delivery payment for a specific order.
 * This would typically be called by a delivery person or an admin after cash is collected.
 * @route   PUT /api/v1/payments/cod/confirm/:orderId
 * @access  Private (Delivery Person, Admin)
 */
exports.confirmCashPayment = catchAsync(async (req, res, next) => {
    const { orderId } = req.params;
    const { amountPaid, paymentDate, notes } = req.body;
    const userId = req.user.id; // User confirming the payment (delivery person or admin)

    if (!orderId) {
        return next(new ApiError('Order ID is required to confirm payment.', 400));
    }
    // Basic validation for amountPaid if needed, though service should handle detailed validation
    if (amountPaid && (isNaN(amountPaid) || amountPaid <= 0)) {
        return next(new ApiError('Amount paid must be a positive number.', 400));
    }

    // Delegate to the service to handle the business logic:
    // - Find the order and verify its status (e.g., 'pending_cod')
    // - Record the payment details
    // - Update the order status (e.g., to 'paid' or 'delivered_and_paid')
    // - Trigger notifications
    const updatedOrder = await cashOnDeliveryService.confirmCashPayment(
        orderId,
        userId, // The person confirming the payment
        { amountPaid, paymentDate, notes }
    );

    res.status(200).json({
        success: true,
        message: 'Cash on Delivery payment confirmed successfully.',
        data: updatedOrder,
    });
});

/**
 * @desc    Get a list of orders pending Cash on Delivery payment.
 * This would be useful for delivery persons or financial managers.
 * @route   GET /api/v1/payments/cod/pending
 * @access  Private (Delivery Person, Admin, Finance)
 */
exports.getPendingCashOnDeliveryOrders = catchAsync(async (req, res, next) => {
    // Optional: add filters like location, delivery person, date range from req.query
    const queryParams = req.query;

    const pendingOrders = await cashOnDeliveryService.getPendingCashOnDeliveryOrders(queryParams);

    res.status(200).json({
        success: true,
        count: pendingOrders.length,
        data: pendingOrders,
    });
});

// You could add other specific COD-related functions here if needed,
// for example, to mark a COD order as failed to collect, or to adjust payment.