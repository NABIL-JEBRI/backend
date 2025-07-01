// backend/src/controllers/seller/sellerController.js
const sellerService = require('../../services/sellerService');
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');

/**
 * @desc    Get the authenticated seller's profile and store information
 * @route   GET /api/v1/seller/me
 * @access  Private (Seller only)
 */
exports.getSellerProfile = catchAsync(async (req, res, next) => {
    // req.user should be populated by authentication middleware and role checked by authorization middleware
    const sellerId = req.user.id;

    const sellerProfile = await sellerService.getSellerProfileById(sellerId);

    if (!sellerProfile) {
        return next(new ApiError('Seller profile not found.', 404));
    }

    res.status(200).json({
        success: true,
        data: sellerProfile,
    });
});

/**
 * @desc    Update the authenticated seller's profile and store information
 * @route   PUT /api/v1/seller/me
 * @access  Private (Seller only)
 */
exports.updateSellerProfile = catchAsync(async (req, res, next) => {
    const sellerId = req.user.id;
    const updateData = req.body;

    // Filter out fields that sellers shouldn't directly update (e.g., role, approvalStatus)
    // This is primarily handled in the service layer, but good to be explicit.
    delete updateData.role;
    delete updateData.approvalStatus;

    const updatedSeller = await sellerService.updateSellerProfile(sellerId, updateData);

    res.status(200).json({
        success: true,
        message: 'Seller profile updated successfully.',
        data: updatedSeller,
    });
});

/**
 * @desc    (Optional) Request to become a seller
 * This would typically be a process where a regular user requests a role change.
 * @route   POST /api/v1/seller/register-request
 * @access  Private (Authenticated User)
 */
exports.requestSellerRegistration = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const { storeName, businessDetails, bankDetails } = req.body;

    if (!storeName || !businessDetails) {
        return next(new ApiError('Store name and business details are required for seller registration.', 400));
    }

    // The service handles creating the seller profile, setting it to pending approval, etc.
    const sellerRequest = await sellerService.requestSellerRegistration(userId, {
        storeName,
        businessDetails,
        bankDetails,
    });

    res.status(202).json({ // 202 Accepted for a request pending approval
        success: true,
        message: 'Seller registration request submitted successfully. Awaiting approval.',
        data: sellerRequest,
    });
});

/**
 * @desc    Get seller's dashboard overview (e.g., sales summary, product count, recent orders)
 * @route   GET /api/v1/seller/dashboard-overview
 * @access  Private (Seller only)
 */
exports.getDashboardOverview = catchAsync(async (req, res, next) => {
    const sellerId = req.user.id;

    // The service will aggregate data from various sources (orders, products)
    const overviewData = await sellerService.getSellerDashboardOverview(sellerId);

    res.status(200).json({
        success: true,
        data: overviewData,
    });
});

// You might also have endpoints for seller verification documents, payout settings, etc.