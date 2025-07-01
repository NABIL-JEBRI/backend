// backend/src/controllers/payment/paymentController.js
const paymentService = require('../../services/paymentService'); // This service will interact with Stripe, PayPal, etc.
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');

/**
 * @desc    Initiate an online payment for an order.
 * This typically involves creating a payment intent or a checkout session with the payment gateway.
 * @route   POST /api/v1/payments/initiate
 * @access  Private (authenticated user placing an order)
 */
exports.initiatePayment = catchAsync(async (req, res, next) => {
    const { orderId, paymentMethodType, currency } = req.body; // paymentMethodType could be 'stripe', 'paypal', etc.
    const userId = req.user.id; // User who is initiating the payment

    if (!orderId || !paymentMethodType || !currency) {
        return next(new ApiError('Order ID, payment method type, and currency are required.', 400));
    }

    // The paymentService will handle the actual interaction with the chosen payment gateway.
    // It will return necessary details for the frontend to complete the payment (e.g., client secret for Stripe).
    const paymentIntentDetails = await paymentService.createPaymentIntent(
        orderId,
        userId,
        paymentMethodType,
        currency
    );

    res.status(200).json({
        success: true,
        message: 'Payment initiation successful. Proceed with client-side payment confirmation.',
        data: paymentIntentDetails, // Contains info like client_secret, sessionId, publishableKey, etc.
    });
});

/**
 * @desc    Handle webhook notifications from payment gateways.
 * This route is publicly accessible to receive asynchronous updates about payment status (e.g., Stripe, PayPal).
 * Security is handled by verifying the webhook signature.
 * @route   POST /api/v1/payments/webhook/:gateway
 * @access  Public (but requires robust signature verification)
 */
exports.handleWebhook = catchAsync(async (req, res, next) => {
    const { gateway } = req.params; // e.g., 'stripe', 'paypal'
    const signature = req.headers['stripe-signature'] || req.headers['paypal-signature']; // Get signature from headers

    if (!signature) {
        return next(new ApiError('Webhook signature missing.', 400));
    }

    // The paymentService will verify the signature and process the event payload.
    // It will update the order status, trigger notifications, etc.
    await paymentService.processWebhookEvent(gateway, req.body, signature);

    // Respond quickly to the webhook to avoid timeouts from the payment gateway
    res.status(200).json({ received: true, message: 'Webhook event processed successfully.' });
});

/**
 * @desc    Process a refund for a specific payment/order.
 * @route   POST /api/v1/payments/refund
 * @access  Private (Admin, or specific roles with refund permissions)
 */
exports.processRefund = catchAsync(async (req, res, next) => {
    // You would typically have a middleware to check if req.user has 'admin' or 'finance' role.
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'finance')) {
        return next(new ApiError('Not authorized to process refunds.', 403));
    }

    const { orderId, amount, reason } = req.body;

    if (!orderId || !amount || amount <= 0) {
        return next(new ApiError('Order ID, amount, and reason are required for a refund.', 400));
    }

    const refundResult = await paymentService.processRefund(orderId, amount, reason, req.user.id);

    res.status(200).json({
        success: true,
        message: 'Refund initiated successfully.',
        data: refundResult,
    });
});

/**
 * @desc    Retrieve payment status for a given order ID.
 * This can be used to poll for payment status or confirm after a client-side payment flow.
 * @route   GET /api/v1/payments/status/:orderId
 * @access  Private (user who owns the order, or Admin)
 */
exports.getPaymentStatus = catchAsync(async (req, res, next) => {
    const { orderId } = req.params;
    const userId = req.user.id; // User requesting status

    const paymentStatus = await paymentService.getPaymentStatus(orderId, userId);

    res.status(200).json({
        success: true,
        data: paymentStatus,
    });
});