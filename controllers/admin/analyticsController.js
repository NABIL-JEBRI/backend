// backend/src/controllers/admin/analyticsController.js
const analyticsService = require('../../services/analyticsService'); // À créer
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');

/**
 * @desc    Get Sales Analytics (e.g., daily, weekly, monthly sales, best-selling products)
 * @route   GET /api/v1/admin/analytics/sales
 * @access  Private (Admin only)
 */
exports.getSalesAnalytics = catchAsync(async (req, res, next) => {
    const { startDate, endDate, period } = req.query; // period: 'day', 'week', 'month', 'year'

    if (!startDate || !endDate || !period) {
        return next(new ApiError('Start date, end date, and period are required for sales analytics.', 400));
    }

    const salesData = await analyticsService.getSalesAnalytics(startDate, endDate, period);

    res.status(200).json({
        success: true,
        data: salesData,
    });
});

/**
 * @desc    Get User Engagement Analytics (e.g., new registrations, active users)
 * @route   GET /api/v1/admin/analytics/users
 * @access  Private (Admin only)
 */
exports.getUserAnalytics = catchAsync(async (req, res, next) => {
    const { startDate, endDate, type } = req.query; // type: 'new_registrations', 'active_users'

    if (!startDate || !endDate || !type) {
        return next(new ApiError('Start date, end date, and type are required for user analytics.', 400));
    }

    const userData = await analyticsService.getUserAnalytics(startDate, endDate, type);

    res.status(200).json({
        success: true,
        data: userData,
    });
});

/**
 * @desc    Get Product Performance Analytics (e.g., top-viewed, low stock, conversion rates)
 * @route   GET /api/v1/admin/analytics/products
 * @access  Private (Admin only)
 */
exports.getProductAnalytics = catchAsync(async (req, res, next) => {
    const { startDate, endDate, type } = req.query; // type: 'top_selling', 'low_stock', 'most_viewed'

    if (!type) {
        return next(new ApiError('Type is required for product analytics.', 400));
    }

    const productData = await analyticsService.getProductAnalytics(startDate, endDate, type);

    res.status(200).json({
        success: true,
        data: productData,
    });
});

/**
 * @desc    Get Review/Feedback Analytics (e.g., average ratings, reviews by product)
 * @route   GET /api/v1/admin/analytics/reviews
 * @access  Private (Admin only)
 */
exports.getReviewAnalytics = catchAsync(async (req, res, next) => {
    const { productId, minRating, maxRating } = req.query;

    const reviewData = await analyticsService.getReviewAnalytics(productId, minRating, maxRating);

    res.status(200).json({
        success: true,
        data: reviewData,
    });
});