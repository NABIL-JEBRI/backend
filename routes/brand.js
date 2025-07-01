// backend/src/routes/brands.js
const express = require('express');
const router = express.Router();

// Import des contrôleurs (seront créés plus tard)
const brandController = require('../controllers/brandController');
const productController = require('../controllers/productController'); // Pour les produits par marque

// Routes publiques pour les marques
// GET /api/brands - Obtenir toutes les marques
router.get('/', brandController.getAllBrands);

// GET /api/brands/:id - Obtenir une marque spécifique par ID
router.get('/:id', brandController.getBrandById);

// GET /api/brands/:id/products - Obtenir tous les produits d'une marque spécifique
router.get('/:id/products', productController.getProductsByBrand);

// Les routes POST, PUT, DELETE pour les marques sont gérées dans routes/admin.js
// car seul un administrateur devrait pouvoir créer, modifier ou supprimer des marques.

module.exports = router;