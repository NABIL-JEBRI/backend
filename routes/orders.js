// backend/src/routes/orders.js
const express = require('express');
const router = express.Router();

// Import des contrôleurs et middlewares
const orderController = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware'); // Pour les utilisateurs connectés

// POST /api/orders - Créer une nouvelle commande
// Cette route doit gérer à la fois les commandes d'utilisateurs connectés et les commandes d'invités.
// Le contrôleur devra vérifier la présence d'un utilisateur authentifié ou des informations d'invité.
router.post('/', orderController.createOrder);

// GET /api/orders/my - Obtenir l'historique des commandes de l'utilisateur connecté
// Cette route est protégée, car elle concerne les données personnelles de l'utilisateur.
router.get('/my', protect, orderController.getMyOrders);

// GET /api/orders/:id - Obtenir les détails d'une commande spécifique par son ID
// L'utilisateur doit être le propriétaire de la commande pour y accéder.
router.get('/:id', protect, orderController.getOrderById);

// Note : Les routes de gestion des commandes par les vendeurs sont dans routes/seller.js
// Note : Les routes de gestion des commandes par les admins sont dans routes/admin.js

module.exports = router;