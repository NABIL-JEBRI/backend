// backend/src/utils/constants/userRoles.js

/**
 * @desc Enum-like object for defining user roles within the application.
 * These roles control access and permissions.
 */
const USER_ROLES = Object.freeze({
    CUSTOMER: 'customer',   // Standard user who can browse, purchase, review
    SELLER: 'seller',       // User who can list and sell products
    DELIVERY: 'delivery',   // User responsible for delivering orders
    ADMIN: 'admin',         // Super user with full access and management capabilities
    MODERATOR: 'moderator'  // Optional: User with specific moderation privileges (e.g., content)
});

module.exports = USER_ROLES;