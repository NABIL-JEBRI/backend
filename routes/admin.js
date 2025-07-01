// backend/src/routes/admin.js
const express = require('express');
const router = express.Router();

// Import des middlewares d'authentification et d'autorisation
const { protect, authorize } = require('../middleware/authMiddleware');

// Import de tous les contrôleurs nécessaires pour l'administration
const adminController = require('../controllers/adminController');
const userController = require('../controllers/userController');
const productController = require('../controllers/productController');
const orderController = require('../controllers/orderController');
const categoryController = require('../controllers/categoryController');
const brandController = require('../controllers/brandController');
const promotionController = require('../controllers/promotionController');
const relayPointController = require('../controllers/relayPointController');
const deliverySlotController = require('../controllers/deliverySlotController');
const reviewController = require('../controllers/reviewController');
const analyticsController = require('../controllers/analyticsController');
// const notificationController = require('../controllers/notificationController'); // Si l'admin envoie des notifications

// Toutes les routes ici nécessitent que l'utilisateur soit authentifié (`protect`)
// ET qu'il ait le rôle 'admin' (`authorize('admin')`)

// Tableau de bord admin
router.get('/dashboard', protect, authorize('admin'), adminController.getAdminDashboardStats);

// Gestion des Utilisateurs
router.route('/users')
    .get(protect, authorize('admin'), userController.getAllUsers);      // Lister tous les utilisateurs
router.route('/users/:id')
    .get(protect, authorize('admin'), userController.getUserById)       // Obtenir les détails d'un utilisateur
    .put(protect, authorize('admin'), userController.updateUserRole)    // Mettre à jour le rôle d'un utilisateur
    .delete(protect, authorize('admin'), userController.deleteUser);    // Supprimer un utilisateur

// Gestion des demandes de vendeur
router.get('/seller-applications', protect, authorize('admin'), userController.getSellerApplications);
router.put('/seller-applications/:id/approve', protect, authorize('admin'), userController.approveSellerApplication);
router.put('/seller-applications/:id/reject', protect, authorize('admin'), userController.rejectSellerApplication);


// Gestion des Produits (par l'admin)
router.route('/products')
    .post(protect, authorize('admin'), productController.createProductByAdmin) // Ajouter un produit (si l'admin peut le faire)
    .get(protect, authorize('admin'), productController.getAllProductsForAdmin); // Lister tous les produits (avec filtres admin)

router.route('/products/:id')
    .get(protect, authorize('admin'), productController.getProductByIdForAdmin) // Obtenir les détails d'un produit
    .put(protect, authorize('admin'), productController.updateProductByAdmin)   // Mettre à jour un produit
    .delete(protect, authorize('admin'), productController.deleteProductByAdmin); // Supprimer un produit

router.put('/products/:id/status', protect, authorize('admin'), productController.updateProductValidationStatus); // Changer le statut de validation

// Gestion des Catégories
router.route('/categories')
    .post(protect, authorize('admin'), categoryController.createCategory)
    .get(protect, authorize('admin'), categoryController.getAllCategories); // Si l'admin a une vue spécifique
router.route('/categories/:id')
    .put(protect, authorize('admin'), categoryController.updateCategory)
    .delete(protect, authorize('admin'), categoryController.deleteCategory);

// Gestion des Marques
router.route('/brands')
    .post(protect, authorize('admin'), brandController.createBrand)
    .get(protect, authorize('admin'), brandController.getAllBrands); // Si l'admin a une vue spécifique
router.route('/brands/:id')
    .put(protect, authorize('admin'), brandController.updateBrand)
    .delete(protect, authorize('admin'), brandController.deleteBrand);

// Gestion des Promotions
router.route('/promotions')
    .post(protect, authorize('admin'), promotionController.createPromotion)
    .get(protect, authorize('admin'), promotionController.getAllPromotions);
router.route('/promotions/:id')
    .put(protect, authorize('admin'), promotionController.updatePromotion)
    .delete(protect, authorize('admin'), promotionController.deletePromotion);

// Gestion des Points Relais
router.route('/relay-points')
    .post(protect, authorize('admin'), relayPointController.createRelayPoint)
    .get(protect, authorize('admin'), relayPointController.getAllRelayPoints);
router.route('/relay-points/:id')
    .put(protect, authorize('admin'), relayPointController.updateRelayPoint)
    .delete(protect, authorize('admin'), relayPointController.deleteRelayPoint);

// Gestion des Créneaux de Livraison
router.route('/delivery-slots')
    .post(protect, authorize('admin'), deliverySlotController.createDeliverySlot)
    .get(protect, authorize('admin'), deliverySlotController.getAllDeliverySlots);
router.route('/delivery-slots/:id')
    .put(protect, authorize('admin'), deliverySlotController.updateDeliverySlot)
    .delete(protect, authorize('admin'), deliverySlotController.deleteDeliverySlot);

// Gestion des Avis
router.route('/reviews')
    .get(protect, authorize('admin'), reviewController.getAllReviewsForAdmin); // Lister tous les avis (y compris en attente)
router.route('/reviews/:id/status')
    .put(protect, authorize('admin'), reviewController.updateReviewStatus); // Approuver/rejeter un avis
router.delete('/reviews/:id', protect, authorize('admin'), reviewController.deleteReviewByAdmin); // Supprimer un avis

// Gestion des Commandes (par l'admin)
router.route('/orders')
    .get(protect, authorize('admin'), orderController.getAllOrdersForAdmin); // Lister toutes les commandes
router.route('/orders/:id')
    .get(protect, authorize('admin'), orderController.getOrderByIdForAdmin) // Obtenir les détails d'une commande
    .put(protect, authorize('admin'), orderController.updateOrderStatusByAdmin); // Mettre à jour le statut d'une commande

// Analytics
router.get('/analytics/daily', protect, authorize('admin'), analyticsController.getDailyAnalytics);
router.get('/analytics/summary', protect, authorize('admin'), analyticsController.getAnalyticsSummary);

// Vous pouvez ajouter des routes pour les notifications globales envoyées par l'admin

module.exports = router;