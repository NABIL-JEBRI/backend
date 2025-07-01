// backend/src/routes/analytics.js
const express = require('express');
const router = express.Router();

// Import du contrôleur d'analytiques et des middlewares de protection
const analyticsController = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Toutes les routes d'analytiques sont protégées et réservées aux administrateurs.

// GET /api/analytics/summary - Obtenir un résumé des métriques clés
router.get('/summary', protect, authorize('admin'), analyticsController.getOverallAnalyticsSummary);

// GET /api/analytics/daily - Obtenir les données analytiques par jour pour une période donnée
router.get('/daily', protect, authorize('admin'), analyticsController.getDailyAnalytics);

// GET /api/analytics/products/top-viewed - Obtenir les produits les plus vus
router.get('/products/top-viewed', protect, authorize('admin'), analyticsController.getTopViewedProducts);

// GET /api/analytics/products/top-sold - Obtenir les produits les plus vendus
router.get('/products/top-sold', protect, authorize('admin'), analyticsController.getTopSoldProducts);

// GET /api/analytics/sellers/top - Obtenir les meilleurs vendeurs
router.get('/sellers/top', protect, authorize('admin'), analyticsController.getTopSellers);

// GET /api/analytics/conversions - Obtenir les taux de conversion
router.get('/conversions', protect, authorize('admin'), analyticsController.getConversionRates);

// Vous pouvez ajouter d'autres routes spécifiques pour des rapports plus détaillés.

module.exports = router;