// backend/src/routes/cashOnDelivery.js
const express = require('express');
const router = express.Router();

// Import du contrôleur COD (à créer, ou la logique sera dans orderController)
const cashOnDeliveryController = require('../controllers/cashOnDeliveryController');
const { protect } = require('../middleware/authMiddleware');

// Cette route pourrait être utilisée pour finaliser une commande COD si elle nécessite une étape distincte
// ou pour des mises à jour de statut spécifiques au paiement COD après la livraison.
// Le "protect" est ici pour s'assurer que c'est un utilisateur légitime qui interagit.
router.post('/confirm-payment/:orderId', protect, cashOnDeliveryController.confirmCashPayment);

// Note : La sélection de l'option "paiement à la livraison" se fera au moment de la création de la commande
// via la route POST /api/orders. Ce fichier sera plus pour la gestion post-commande si besoin.

module.exports = router;