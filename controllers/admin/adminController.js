// backend/src/controllers/admin/adminController.js
const adminService = require('../../services/adminService'); // À créer
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');

/**
 * @desc    Get Admin Dashboard Overview (summary of key metrics)
 * @route   GET /api/v1/admin/dashboard
 * @access  Private (Admin only)
 */
exports.getAdminDashboardOverview = catchAsync(async (req, res, next) => {
    // This route will be protected by an authorization middleware checking for 'admin' role.
    const overview = await adminService.getDashboardOverview();

    res.status(200).json({
        success: true,
        data: overview,
    });
});

/**
 * @desc    Update Global System Settings (e.g., commission rates, site status)
 * @route   PUT /api/v1/admin/settings
 * @access  Private (Admin only)
 */
exports.updateSystemSettings = catchAsync(async (req, res, next) => {
    const settingsData = req.body;

    const updatedSettings = await adminService.updateGlobalSettings(settingsData);

    res.status(200).json({
        success: true,
        message: 'System settings updated successfully.',
        data: updatedSettings,
    });
});

/**
 * @desc    Get System Health/Status Check
 * @route   GET /api/v1/admin/health-check
 * @access  Private (Admin only)
 */
exports.getSystemHealth = catchAsync(async (req, res, next) => {
    // This could check database connection, external API health, etc.
    const healthStatus = await adminService.getSystemHealthStatus();

    res.status(200).json({
        success: true,
        data: healthStatus,
    });
});