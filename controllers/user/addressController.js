// backend/src/controllers/user/addressController.js
const userProfileService = require('../../services/userProfileService');
const catchAsync = require('../../utils/catchAsync');
const ApiError = require('../../utils/ApiError');

/**
 * @desc    Get all addresses for the logged-in user
 * @route   GET /api/v1/users/addresses
 * @access  Private
 */
exports.getUserAddresses = catchAsync(async (req, res, next) => {
    const addresses = await userProfileService.getUserAddresses(req.user.id);

    res.status(200).json({
        success: true,
        count: addresses.length,
        data: addresses,
    });
});

/**
 * @desc    Add a new address for the logged-in user
 * @route   POST /api/v1/users/addresses
 * @access  Private
 */
exports.addAddress = catchAsync(async (req, res, next) => {
    const { street, city, governorate, postalCode, country, isDefault } = req.body;

    if (!street || !city || !governorate || !postalCode || !country) {
        return next(new ApiError('Please provide all required address fields: street, city, governorate, postalCode, country.', 400));
    }

    const newAddress = await userProfileService.addUserAddress(req.user.id, {
        street,
        city,
        governorate,
        postalCode,
        country,
        isDefault: isDefault || false, // Default to false if not provided
    });

    res.status(201).json({
        success: true,
        message: 'Address added successfully.',
        data: newAddress,
    });
});

/**
 * @desc    Update an existing address for the logged-in user
 * @route   PUT /api/v1/users/addresses/:id
 * @access  Private
 */
exports.updateAddress = catchAsync(async (req, res, next) => {
    const { id } = req.params; // Address ID
    const updateData = req.body; // Fields to update

    // Ensure user cannot change 'user' field in address data
    if (updateData.user) {
        delete updateData.user;
    }

    const updatedAddress = await userProfileService.updateUserAddress(id, req.user.id, updateData);

    res.status(200).json({
        success: true,
        message: 'Address updated successfully.',
        data: updatedAddress,
    });
});

/**
 * @desc    Delete an address for the logged-in user
 * @route   DELETE /api/v1/users/addresses/:id
 * @access  Private
 */
exports.deleteAddress = catchAsync(async (req, res, next) => {
    const { id } = req.params; // Address ID

    await userProfileService.deleteUserAddress(id, req.user.id);

    res.status(200).json({
        success: true,
        message: 'Address deleted successfully.',
    });
});