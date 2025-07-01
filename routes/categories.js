// backend/src/routes/categories.js
const express = require('express');
const router = express.Router();

// Import des contrôleurs (seront créés plus tard)
const categoryController = require('../controllers/categoryController');
const productController = require('../controllers/productController'); // Pour les produits par catégorie

// GET /api/categories - Obtenir toutes les catégories (incluant les sous-catégories hiérarchiquement)
// Accessible publiquement pour la navigation sur le site.
router.get('/', categoryController.getAllCategories);

// GET /api/categories/:id - Obtenir une catégorie spécifique par ID
router.get('/:id', categoryController.getCategoryById);

// GET /api/categories/:id/products - Obtenir tous les produits d'une catégorie spécifique
router.get('/:id/products', productController.getProductsByCategory);

// GET /api/categories/:id/subcategories - Obtenir les sous-catégories d'une catégorie parente
router.get('/:id/subcategories', categoryController.getSubCategories);

// Les routes POST, PUT, DELETE pour les catégories sont gérées dans routes/admin.js.

module.exports = router;