// backend/src/controllers/notification/emailNotificationController.js
const emailService = require('../../services/emailService'); // Ce service gérera l'envoi d'e-mails via un fournisseur
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');

/**
 * @desc    (Internal/System-triggered) Send a transactional email
 * This endpoint is typically NOT exposed directly to the frontend.
 * It's usually called by other internal services (e.g., after an order is placed, password reset).
 * For demonstration, we'll expose it with Admin access, but in a real app, it's often service-to-service.
 * @route   POST /api/v1/admin/emails/send-transactional
 * @access  Private (Admin or Internal Service)
 */
exports.sendTransactionalEmail = catchAsync(async (req, res, next) => {
    // This route would be called by other parts of your backend logic, not directly by a user.
    // For manual testing by admin, you can allow admin role.
    if (req.user.role !== 'admin') {
         return next(new ApiError('Not authorized. Only admin or internal services can send transactional emails via this endpoint.', 403));
    }

    const { to, subject, templateName, templateData } = req.body;

    if (!to || !subject || !templateName) {
        return next(new ApiError('Recipient, subject, and template name are required.', 400));
    }

    await emailService.sendEmail(to, subject, templateName, templateData);

    res.status(200).json({
        success: true,
        message: `Transactional email sent to ${to} using template ${templateName}.`,
    });
});

/**
 * @desc    (Admin only) Send a promotional/newsletter email to a list of recipients
 * @route   POST /api/v1/admin/emails/send-promotional
 * @access  Private (Admin Only)
 */
exports.sendPromotionalEmail = catchAsync(async (req, res, next) => {
    // This route requires 'admin' role
    if (req.user.role !== 'admin') {
        return next(new ApiError('Not authorized. Only administrators can send promotional emails.', 403));
    }

    const { recipients, subject, body, isHtml } = req.body; // recipients can be an array of emails or 'all'

    if (!recipients || recipients.length === 0 || !subject || !body) {
        return next(new ApiError('Recipients, subject, and body are required for promotional email.', 400));
    }

    // The service will handle iterating through recipients, templating, and sending.
    const sentCount = await emailService.sendPromotionalEmail(recipients, subject, body, isHtml);

    res.status(200).json({
        success: true,
        message: `${sentCount} promotional emails dispatched successfully.`,
        data: { sentCount },
    });
});

// You might also add endpoints for:
// - Getting email logs (Admin)
// - Managing email templates (Admin)