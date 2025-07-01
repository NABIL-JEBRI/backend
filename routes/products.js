// backend/src/routes/products.js
const express = require('express');
const router = express.Router();

// Import des contrôleurs et middlewares
const productController = require('../controllers/productController');
const reviewController = require('../controllers/reviewController'); // Pour les avis liés aux produits
const { protect } = require('../middleware/authMiddleware'); // Pour les favoris, etc.

// GET /api/products - Obtenir tous les produits
// Acceptera des paramètres de requête pour le filtrage, la recherche, la pagination, le tri.
router.get('/', productController.getAllProducts);

// GET /api/products/:id - Obtenir les détails d'un produit spécifique
router.get('/:id', productController.getProductById);

// GET /api/products/:id/reviews - Obtenir les avis pour un produit spécifique (redondant avec /api/reviews/product/:productId mais pratique ici)
router.get('/:id/reviews', reviewController.getProductReviews);

// GET /api/products/flash-sales - Obtenir les produits en vente flash
router.get('/flash-sales', productController.getFlashSalesProducts);

// GET /api/products/best-sellers - Obtenir les produits les plus vendus
router.get('/best-sellers', productController.getBestSellingProducts);

// GET /api/products/new-arrivals - Obtenir les nouveautés
router.get('/new-arrivals', productController.getNewArrivalsProducts);


// Routes pour les produits favoris (nécessite une authentification)
router.post('/:id/favorite', protect, productController.addProductToFavorites); // Ajouter/supprimer des favoris
router.get('/favorites/my', protect, productController.getMyFavoriteProducts); // Obtenir les favoris de l'utilisateur
router.delete('/:id/favorite', protect, productController.removeProductFromFavorites); // Supprimer des favoris

// Note : Les routes POST, PUT, DELETE pour les produits (gestion CRUD) sont gérées dans routes/seller.js (pour le vendeur) et routes/admin.js (pour l'admin).
// Note : Les routes pour les produits par catégorie ou par marque sont déjà couvertes par `/api/categories/:id/products` et `/api/brands/:id/products` ou peuvent être intégrées comme filtres à `GET /api/products`.

module.exports = router;