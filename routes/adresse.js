// backend/src/routes/addresses.js
const express = require('express');
const router = express.Router();

// Import des contrôleurs et middlewares
const addressController = require('../controllers/addressController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Ces routes pourraient être pour la gestion des adresses par un ADMIN
// Ou pour des opérations avancées d'adresses non directement liées à l'utilisateur connecté (moins courant)

// Exemple de route ADMIN pour lister toutes les adresses du système
router.get('/', protect, authorize('admin'), addressController.getAllAddresses);

// Exemple de route ADMIN pour obtenir une adresse par son ID
router.get('/:id', protect, authorize('admin'), addressController.getAddressById);

// Les routes pour ajouter/modifier/supprimer les adresses d'un UTILISATEUR spécifique sont dans routes/users.js

module.exports = router;