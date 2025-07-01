// backend/src/controllers/delivery/relayPointController.js
const relayPointService = require('../../services/relayPointService');
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');

/**
 * @desc    Get all relay points (can be filtered by location, availability, etc.)
 * @route   GET /api/v1/relay-points
 * @access  Public
 */
exports.getAllRelayPoints = catchAsync(async (req, res, next) => {
    // Pass query parameters for filtering (e.g., /api/v1/relay-points?city=Paris&status=open)
    const relayPoints = await relayPointService.getRelayPoints(req.query);

    res.status(200).json({
        success: true,
        count: relayPoints.length,
        data: relayPoints,
    });
});

/**
 * @desc    Get a single relay point by ID
 * @route   GET /api/v1/relay-points/:id
 * @access  Public
 */
exports.getRelayPointById = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const relayPoint = await relayPointService.getRelayPointById(id);

    if (!relayPoint) {
        return next(new ApiError('Relay point not found.', 404));
    }

    res.status(200).json({
        success: true,
        data: relayPoint,
    });
});

/**
 * @desc    Create a new relay point
 * @route   POST /api/v1/admin/relay-points
 * @access  Private (Admin only)
 */
exports.createRelayPoint = catchAsync(async (req, res, next) => {
    // Authorization check: only admins can create relay points
    if (req.user.role !== 'admin') {
        return next(new ApiError('Not authorized. Only administrators can create relay points.', 403));
    }

    const { name, address, operatingHours, contact, status } = req.body;

    if (!name || !address || !address.street || !address.city || !address.postalCode) {
        return next(new ApiError('Name and complete address are required for a relay point.', 400));
    }

    const newRelayPoint = await relayPointService.createRelayPoint({
        name,
        address,
        operatingHours,
        contact,
        status: status || 'open',
    });

    res.status(201).json({
        success: true,
        message: 'Relay point created successfully.',
        data: newRelayPoint,
    });
});

/**
 * @desc    Update an existing relay point
 * @route   PUT /api/v1/admin/relay-points/:id
 * @access  Private (Admin only)
 */
exports.updateRelayPoint = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const updateData = req.body;

    // Authorization check: only admins can update relay points
    if (req.user.role !== 'admin') {
        return next(new ApiError('Not authorized. Only administrators can update relay points.', 403));
    }

    const updatedRelayPoint = await relayPointService.updateRelayPoint(id, updateData);

    res.status(200).json({
        success: true,
        message: 'Relay point updated successfully.',
        data: updatedRelayPoint,
    });
});

/**
 * @desc    Delete a relay point
 * @route   DELETE /api/v1/admin/relay-points/:id
 * @access  Private (Admin only)
 */
exports.deleteRelayPoint = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    // Authorization check: only admins can delete relay points
    if (req.user.role !== 'admin') {
        return next(new ApiError('Not authorized. Only administrators can delete relay points.', 403));
    }

    await relayPointService.deleteRelayPoint(id);

    res.status(200).json({
        success: true,
        message: 'Relay point deleted successfully.',
    });
});