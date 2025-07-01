// backend/src/controllers/user/userController.js
const userProfileService = require('../../services/userProfileService');
const catchAsync = require('../../utils/catchAsync');
const ApiError = require('../../utils/ApiError');

/**
 * @desc    Get current user profile
 * @route   GET /api/v1/users/me
 * @access  Private
 */
exports.getMe = catchAsync(async (req, res, next) => {
    // req.user should be populated by the authentication middleware
    if (!req.user) {
        return next(new ApiError('User not authenticated.', 401));
    }

    // Since req.user already contains the user object, we can return it directly.
    // However, if you want to fetch it again to ensure it's fresh from the DB,
    // or if req.user is just an ID, you'd call a service method like:
    // const user = await userProfileService.getUserProfileById(req.user.id);
    // For now, we assume req.user is the full user object from the auth middleware.

    res.status(200).json({
        success: true,
        data: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
            isEmailVerified: req.user.isEmailVerified,
            phoneNumber: req.user.phoneNumber, // Include other relevant profile fields
            profilePicture: req.user.profilePicture,
            // Exclude sensitive data like password, tokens
        },
    });
});

/**
 * @desc    Update current user profile information
 * @route   PUT /api/v1/users/me
 * @access  Private
 */
exports.updateMyProfile = catchAsync(async (req, res, next) => {
    const { name, email, phoneNumber, profilePicture } = req.body;

    // Filter out potentially sensitive fields that shouldn't be updated directly via this route
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    if (profilePicture) updateData.profilePicture = profilePicture; // Assuming this is a URL/ID after upload

    // Delegate to the service layer for business logic and database interaction
    const updatedUser = await userProfileService.updateUserProfile(req.user.id, updateData);

    res.status(200).json({
        success: true,
        message: 'Profile updated successfully.',
        data: {
            id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            isEmailVerified: updatedUser.isEmailVerified,
            phoneNumber: updatedUser.phoneNumber,
            profilePicture: updatedUser.profilePicture,
        },
    });
});

/**
 * @desc    (Optional) Change user password (requires current password verification)
 * @route   PUT /api/v1/users/change-password
 * @access  Private
 *
 * NOTE: This is distinct from forgot/reset password. It's for logged-in users.
 * This functionality could also reside in passwordController.js if preferred.
 * For simplicity, and as it's a user-specific profile action, keeping it here.
 */
exports.changePassword = catchAsync(async (req, res, next) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return next(new ApiError('Please provide current password and new password.', 400));
    }

    // Call authService for password change logic, as it interacts with hashing and user model methods
    await authService.changePassword(req.user.id, currentPassword, newPassword);

    res.status(200).json({
        success: true,
        message: 'Password changed successfully.',
    });
});