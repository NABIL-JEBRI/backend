// backend/src/routes/reviews.js
const express = require('express');
const router = express.Router();

// Import des contrôleurs et middlewares
const reviewController = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware'); // Pour s'assurer que l'utilisateur est connecté pour poster/modifier son avis

// GET /api/reviews/product/:productId - Obtenir tous les avis (approuvés) pour un produit spécifique
router.get('/product/:productId', reviewController.getProductReviews);

// POST /api/reviews - Poster un nouvel avis sur un produit
// L'utilisateur doit être connecté pour poster un avis.
router.post('/', protect, reviewController.createReview);

// PUT /api/reviews/:id - Mettre à jour son propre avis
// L'utilisateur doit être le propriétaire de l'avis et être connecté.
router.put('/:id', protect, reviewController.updateReview);

// DELETE /api/reviews/:id - Supprimer son propre avis
// L'utilisateur doit être le propriétaire de l'avis et être connecté.
router.delete('/:id', protect, reviewController.deleteReview);

// GET /api/reviews/my - Obtenir tous les avis de l'utilisateur connecté
router.get('/my', protect, reviewController.getMyReviews);

// Note : Les routes pour la modération des avis (approbation/rejet) sont dans routes/admin.js

module.exports = router;