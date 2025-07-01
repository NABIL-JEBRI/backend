// backend/src/routes/search.js
const express = require('express');
const router = express.Router();

// Import du contrôleur de recherche (à créer)
const searchController = require('../controllers/searchController');

// GET /api/search - Route de recherche principale
// Cette route permettra la recherche de produits, catégories, marques, etc.
// Elle acceptera des paramètres de requête comme 'q' (query), 'category', 'brand', 'minPrice', 'maxPrice', 'sort', 'page', 'limit'
router.get('/', searchController.globalSearch);

// Vous pouvez ajouter des routes de recherche plus spécifiques si nécessaire,
// par exemple pour l'auto-complétion ou des suggestions.
// router.get('/suggestions', searchController.getSearchSuggestions);

module.exports = router;