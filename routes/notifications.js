// backend/src/routes/notifications.js
const express = require('express');
const router = express.Router();

// Import du contrôleur de notifications et du middleware de protection
const notificationController = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware'); // Les notifications sont personnelles

// Toutes ces routes nécessitent que l'utilisateur soit authentifié (`protect`)

// GET /api/notifications/my - Obtenir toutes les notifications de l'utilisateur connecté
router.get('/my', protect, notificationController.getMyNotifications);

// GET /api/notifications/my/unread - Obtenir les notifications non lues de l'utilisateur
router.get('/my/unread', protect, notificationController.getMyUnreadNotifications);

// PUT /api/notifications/:id/read - Marquer une notification spécifique comme lue
router.put('/:id/read', protect, notificationController.markNotificationAsRead);

// PUT /api/notifications/mark-all-read - Marquer toutes les notifications comme lues
router.put('/mark-all-read', protect, notificationController.markAllNotificationsAsRead);

// DELETE /api/notifications/:id - Supprimer une notification spécifique
router.delete('/:id', protect, notificationController.deleteNotification);

// Note : L'envoi de notifications (création) sera généralement fait par les contrôleurs d'autres modules
// (ex: orderController après une mise à jour de statut de commande, ou un admin via une route spécifique).

module.exports = router;