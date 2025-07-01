// backend/src/routes/carts.js
const express = require('express');
const router = express.Router();

// Import des contrôleurs et middlewares
const cartController = require('../controllers/cartController');
// La protection du panier est un peu différente :
// - Si l'utilisateur est connecté, on utilise protect.
// - Si c'est un invité, on utilise une session ID (pas de 'protect' direct).
// Le contrôleur devra gérer cette logique.
// const { protect } = require('../middleware/authMiddleware');

// GET /api/cart - Obtenir le contenu du panier (pour utilisateur connecté ou basé sur sessionId)
router.get('/', cartController.getCart);

// POST /api/cart/add - Ajouter un produit au panier
router.post('/add', cartController.addItemToCart);

// PUT /api/cart/update/:productId - Mettre à jour la quantité d'un produit dans le panier
router.put('/update/:productId', cartController.updateCartItemQuantity);

// DELETE /api/cart/remove/:productId - Supprimer un produit du panier
router.delete('/remove/:productId', cartController.removeCartItem);

// DELETE /api/cart/clear - Vider le panier
router.delete('/clear', cartController.clearCart);

module.exports = router;