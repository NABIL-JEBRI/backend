// backend/src/routes/relayPoints.js
const express = require('express');
const router = express.Router();

// Import du contrôleur de point relais (à créer)
const relayPointController = require('../controllers/relayPointController');

// GET /api/relay-points - Obtenir tous les points relais (peut inclure des filtres par gouvernorat, délégation, etc.)
// Accessible publiquement pour que les utilisateurs puissent les choisir.
router.get('/', relayPointController.getAllRelayPoints);

// GET /api/relay-points/:id - Obtenir les détails d'un point relais spécifique par ID
router.get('/:id', relayPointController.getRelayPointById);

// GET /api/relay-points/near - Obtenir les points relais proches d'une localisation (requiert coordonnées)
// Cette route utilisera la géolocalisation pour trouver les points les plus proches.
router.get('/near', relayPointController.getNearbyRelayPoints);

// Les routes POST, PUT, DELETE pour les points relais sont gérées dans routes/admin.js.

module.exports = router;