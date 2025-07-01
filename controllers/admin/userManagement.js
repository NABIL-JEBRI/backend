// backend/src/controllers/admin/userManagement.js
const userService = require('../../services/userService'); // Utilisé pour les opérations générales sur l'utilisateur
const sellerService = require('../../services/sellerService'); // Utilisé pour l'approbation des vendeurs
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');

/**
 * @desc    Get all users (with filters, pagination, sorting)
 * @route   GET /api/v1/admin/users
 * @access  Private (Admin only)
 */
exports.getAllUsers = catchAsync(async (req, res, next) => {
    const { users, pagination } = await userService.getAllUsers(req.query);

    res.status(200).json({
        success: true,
        count: users.length,
        pagination,
        data: users,
    });
});

/**
 * @desc    Get a single user by ID
 * @route   GET /api/v1/admin/users/:id
 * @access  Private (Admin only)
 */
exports.getUserById = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const user = await userService.getUserById(id);

    if (!user) {
        return next(new ApiError('User not found.', 404));
    }

    res.status(200).json({
        success: true,
        data: user,
    });
});

/**
 * @desc    Update a user's details (including role)
 * @route   PUT /api/v1/admin/users/:id
 * @access  Private (Admin only)
 */
exports.updateUser = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const updateData = req.body;

    const updatedUser = await userService.updateUser(id, updateData);

    res.status(200).json({
        success: true,
        message: 'User updated successfully.',
        data: updatedUser,
    });
});

/**
 * @desc    Delete a user
 * @route   DELETE /api/v1/admin/users/:id
 * @access  Private (Admin only)
 */
exports.deleteUser = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    await userService.deleteUser(id);

    res.status(200).json({
        success: true,
        message: 'User deleted successfully.',
    });
});

/**
 * @desc    Approve or Reject a Seller Registration Request
 * @route   PUT /api/v1/admin/sellers/:id/approve-reject
 * @access  Private (Admin only)
 */
exports.approveRejectSeller = catchAsync(async (req, res, next) => {
    const { id } = req.params; // User ID acting as seller
    const { action, reason } = req.body; // 'approve' or 'reject'

    if (!action || !['approve', 'reject'].includes(action)) {
        return next(new ApiError('Invalid action. Must be "approve" or "reject".', 400));
    }

    const updatedSeller = await sellerService.processSellerApproval(id, action, reason);

    res.status(200).json({
        success: true,
        message: `Seller request ${action}ed successfully.`,
        data: updatedSeller,
    });
});

/**
 * @desc    Get all sellers (or pending sellers)
 * @route   GET /api/v1/admin/sellers
 * @access  Private (Admin only)
 */
exports.getAllSellers = catchAsync(async (req, res, next) => {
    const { status, ...query } = req.query; // 'pending', 'approved', 'rejected', 'active', 'suspended' etc.
    const sellers = await sellerService.getAllSellers(status, query);

    res.status(200).json({
        success: true,
        count: sellers.length,
        data: sellers,
    });
});