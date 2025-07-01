// backend/src/controllers/notification/notificationController.js
const notificationService = require('../../services/notificationService'); // Ce service gérera la logique de notification
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');

/**
 * @desc    Get all notifications for the authenticated user
 * @route   GET /api/v1/notifications
 * @access  Private (Authenticated User)
 */
exports.getUserNotifications = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const { status, limit, page } = req.query; // Filters: 'read', 'unread', pagination

    const { notifications, pagination } = await notificationService.getNotificationsByUserId(
        userId,
        status,
        limit,
        page
    );

    res.status(200).json({
        success: true,
        count: notifications.length,
        pagination,
        data: notifications,
    });
});

/**
 * @desc    Mark one or more notifications as read for the authenticated user
 * @route   PUT /api/v1/notifications/mark-read
 * @access  Private (Authenticated User)
 */
exports.markNotificationsAsRead = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const { notificationIds } = req.body; // Array of notification IDs to mark as read

    if (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0) {
        return next(new ApiError('Notification IDs array is required.', 400));
    }

    await notificationService.markNotificationsAsRead(userId, notificationIds);

    res.status(200).json({
        success: true,
        message: 'Notifications marked as read.',
    });
});

/**
 * @desc    Delete one or more notifications for the authenticated user
 * @route   DELETE /api/v1/notifications/delete
 * @access  Private (Authenticated User)
 */
exports.deleteNotifications = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const { notificationIds } = req.body; // Array of notification IDs to delete

    if (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0) {
        return next(new ApiError('Notification IDs array is required.', 400));
    }

    await notificationService.deleteNotifications(userId, notificationIds);

    res.status(200).json({
        success: true,
        message: 'Notifications deleted successfully.',
    });
});

/**
 * @desc    (Admin only) Send a broad notification to multiple users or a segment
 * @route   POST /api/v1/admin/notifications/send-bulk
 * @access  Private (Admin Only)
 */
exports.sendBulkNotification = catchAsync(async (req, res, next) => {
    // This route needs to be protected by an authorization middleware that checks for 'admin' role.
    const { recipientIds, title, message, type } = req.body; // recipientIds can be null for all users

    if (!title || !message) {
        return next(new ApiError('Title and message are required for bulk notification.', 400));
    }

    const createdNotifications = await notificationService.createNotification(
        recipientIds,
        title,
        message,
        type,
        true // isBulk flag
    );

    res.status(201).json({
        success: true,
        message: 'Bulk notifications sent successfully.',
        data: createdNotifications,
    });
});