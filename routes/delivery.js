// backend/src/routes/deliveries.js
const express = require('express');
const router = express.Router();

// Import du contrôleur de livraisons et du middleware de protection
const deliveryController = require('../controllers/deliveryController');
const { protect, authorize } = require('../middleware/authMiddleware'); // Pour l'accès aux infos de livraison

// GET /api/deliveries/my - Obtenir les livraisons de l'utilisateur connecté
router.get('/my', protect, deliveryController.getMyDeliveries);

// GET /api/deliveries/:id - Obtenir les détails d'une livraison spécifique (si l'utilisateur est concerné)
router.get('/:id', protect, deliveryController.getDeliveryById);

// GET /api/deliveries/track/:trackingNumber - Suivre une livraison par numéro de suivi (peut être public ou protégé)
// Si public, pas de `protect`. Si nécessite une session ou un compte, ajoutez `protect`.
router.get('/track/:trackingNumber', deliveryController.trackDelivery); // Sans protection pour un suivi public

// Routes pour les livreurs (rôle `delivery_driver` si vous en avez un)
// router.get('/driver/assigned', protect, authorize('delivery_driver'), deliveryController.getDriverAssignedDeliveries);
// router.put('/driver/:id/status', protect, authorize('delivery_driver'), deliveryController.updateDeliveryStatusByDriver);

// Note : Les routes de gestion complète des livraisons par les admins sont dans routes/admin.js.
// La création d'une Delivery est souvent un événement déclenché par le système (ex: lors de la confirmation de commande).

module.exports = router;