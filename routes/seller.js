// backend/src/routes/seller.js
const express = require('express');
const router = express.Router();

// Import des middlewares d'authentification et d'autorisation
const { protect, authorize } = require('../middleware/authMiddleware');

// Import des contrôleurs spécifiques au vendeur et aux entités qu'il gère
const sellerController = require('../controllers/sellerController');
const productController = require('../controllers/productController'); // Pour gérer les produits du vendeur
const orderController = require('../controllers/orderController'); // Pour gérer les commandes du vendeur

// Toutes les routes ici nécessitent que l'utilisateur soit authentifié (`protect`)
// ET qu'il ait le rôle 'seller' (`authorize('seller')`)

// Tableau de bord du vendeur
router.get('/dashboard', protect, authorize('seller'), sellerController.getSellerDashboardStats);

// Gestion des produits du vendeur (seuls ses propres produits)
router.route('/products')
    .post(protect, authorize('seller'), productController.createProduct)        // Ajouter un nouveau produit
    .get(protect, authorize('seller'), productController.getSellerProducts);    // Lister les produits du vendeur

router.route('/products/:id')
    .get(protect, authorize('seller'), productController.getSellerProductById)   // Obtenir les détails d'UN de SES produits
    .put(protect, authorize('seller'), productController.updateSellerProduct)    // Mettre à jour UN de SES produits
    .delete(protect, authorize('seller'), productController.deleteSellerProduct); // Supprimer UN de SES produits

// Gestion des commandes du vendeur (celles qui contiennent ses produits)
router.get('/orders', protect, authorize('seller'), orderController.getSellerOrders);
router.get('/orders/:id', protect, authorize('seller'), orderController.getSellerOrderById);
router.put('/orders/:id/status', protect, authorize('seller'), orderController.updateSellerOrderStatus);

// Vous pouvez ajouter des routes pour la gestion de l'inventaire du vendeur, etc.

module.exports = router;