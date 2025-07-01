// backend/src/controllers/user/profileController.js
const userProfileService = require('../../services/userProfileService');
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');

/**
 * @desc    Get user's detailed profile (could be for public view or specific settings)
 * This might fetch more elaborate data than getMe in userController.
 * @route   GET /api/v1/profile/:userId (or /api/v1/profile/me for authenticated user's own profile)
 * @access  Public (for viewing others' profiles, Private for own settings)
 */
exports.getProfile = catchAsync(async (req, res, next) => {
    // Determine which user's profile to fetch
    // If it's '/profile/me', use req.user.id. If it's '/profile/:userId', use req.params.userId.
    const targetUserId = req.params.userId || (req.user ? req.user.id : null);

    if (!targetUserId) {
        return next(new ApiError('User ID is required to fetch profile.', 400));
    }

    const userProfile = await userProfileService.getUserProfileById(targetUserId);

    if (!userProfile) {
        return next(new ApiError('Profile not found.', 404));
    }

    // Filter data based on whether it's the user's own profile or a public view
    let responseData = {
        id: userProfile._id,
        name: userProfile.name,
        profilePicture: userProfile.profilePicture,
        bio: userProfile.bio, // Example: a seller's biography
        // Add more public fields relevant to a profile
    };

    // If it's the authenticated user requesting their *own* profile details/settings
    if (req.user && req.user.id === targetUserId.toString()) {
        responseData.email = userProfile.email;
        responseData.phoneNumber = userProfile.phoneNumber;
        responseData.preferences = userProfile.preferences; // Example: user notification preferences
        responseData.isEmailVerified = userProfile.isEmailVerified;
        responseData.role = userProfile.role;
        // ... include sensitive/private fields only for the owner
    }

    res.status(200).json({
        success: true,
        data: responseData,
    });
});

/**
 * @desc    Update specific profile settings or public profile information
 * @route   PUT /api/v1/profile/me
 * @access  Private (only authenticated user can update their own profile)
 */
exports.updateProfileSettings = catchAsync(async (req, res, next) => {
    if (!req.user) {
        return next(new ApiError('User not authenticated.', 401));
    }

    const { bio, preferences, publicFields } = req.body; // Example fields for profile settings

    const updateData = {};
    if (bio !== undefined) updateData.bio = bio;
    if (preferences !== undefined) updateData.preferences = preferences;
    // Add other specific profile fields that can be updated here

    // IMPORTANT: Ensure no sensitive fields (like role, password, email) are updated via this route
    // The userProfileService.updateUserProfile function should already handle this filtering,
    // but it's good practice to be explicit in the controller too.

    const updatedUser = await userProfileService.updateUserProfile(req.user.id, updateData);

    res.status(200).json({
        success: true,
        message: 'Profile settings updated successfully.',
        data: {
            id: updatedUser._id,
            name: updatedUser.name,
            bio: updatedUser.bio,
            preferences: updatedUser.preferences,
            profilePicture: updatedUser.profilePicture, // Assuming this might be part of profile settings
        },
    });
});