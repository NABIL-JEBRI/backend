// backend/src/controllers/admin/promotionController.js
const promotionService = require('../../services/promotionService');
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');

/**
 * @desc    Get all promotions/coupons
 * @route   GET /api/v1/admin/promotions
 * @access  Private (Admin only)
 */
exports.getAllPromotions = catchAsync(async (req, res, next) => {
    const promotions = await promotionService.getAllPromotions(req.query);

    res.status(200).json({
        success: true,
        count: promotions.length,
        data: promotions,
    });
});

/**
 * @desc    Get a single promotion by ID
 * @route   GET /api/v1/admin/promotions/:id
 * @access  Private (Admin only)
 */
exports.getPromotionById = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const promotion = await promotionService.getPromotionById(id);

    if (!promotion) {
        return next(new ApiError('Promotion not found.', 404));
    }

    res.status(200).json({
        success: true,
        data: promotion,
    });
});

/**
 * @desc    Create a new promotion (coupon, discount, etc.)
 * @route   POST /api/v1/admin/promotions
 * @access  Private (Admin only)
 */
exports.createPromotion = catchAsync(async (req, res, next) => {
    const promotionData = req.body;

    if (!promotionData.name || !promotionData.type || !promotionData.value || !promotionData.startDate || !promotionData.endDate) {
        return next(new ApiError('Name, type, value, start date, and end date are required for a promotion.', 400));
    }

    const newPromotion = await promotionService.createPromotion(promotionData);

    res.status(201).json({
        success: true,
        message: 'Promotion created successfully.',
        data: newPromotion,
    });
});

/**
 * @desc    Update an existing promotion
 * @route   PUT /api/v1/admin/promotions/:id
 * @access  Private (Admin only)
 */
exports.updatePromotion = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const updateData = req.body;

    const updatedPromotion = await promotionService.updatePromotion(id, updateData);

    res.status(200).json({
        success: true,
        message: 'Promotion updated successfully.',
        data: updatedPromotion,
    });
});

/**
 * @desc    Delete a promotion
 * @route   DELETE /api/v1/admin/promotions/:id
 * @access  Private (Admin only)
 */
exports.deletePromotion = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    await promotionService.deletePromotion(id);

    res.status(200).json({
        success: true,
        message: 'Promotion deleted successfully.',
    });
});