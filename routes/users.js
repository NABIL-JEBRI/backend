// backend/src/routes/users.js
const express = require('express');
const router = express.Router();

// Import des middlewares d'authentification et d'autorisation
const { protect } = require('../middleware/authMiddleware'); // 'authorize' ne sera pas directement utilisé ici car ce sont des routes de l'utilisateur standard

// Import des contrôleurs
const userController = require('../controllers/userController');
const addressController = require('../controllers/addressController'); // Pour la gestion des adresses

// Toutes ces routes nécessitent que l'utilisateur soit authentifié (`protect`)

// Routes de profil utilisateur
router.route('/profile')
    .get(protect, userController.getUserProfile)        // Récupérer le profil de l'utilisateur connecté
    .put(protect, userController.updateUserProfile);    // Mettre à jour le profil de l'utilisateur connecté

router.put('/change-password', protect, userController.changePassword); // Changer le mot de passe de l'utilisateur

// Routes de gestion des adresses de l'utilisateur
router.route('/addresses')
    .get(protect, addressController.getUserAddresses)    // Récupérer les adresses de l'utilisateur connecté
    .post(protect, addressController.addAddress);       // Ajouter une nouvelle adresse pour l'utilisateur

router.route('/addresses/:id')
    .put(protect, addressController.updateAddress)      // Mettre à jour une adresse spécifique de l'utilisateur
    .delete(protect, addressController.deleteAddress);  // Supprimer une adresse de l'utilisateur

// Route pour la demande de devenir vendeur
router.post('/become-seller', protect, userController.requestBecomeSeller);

// Note sur les commandes : Les routes /api/orders/my seront définies dans routes/orders.js
// Pour éviter une redondance ou une confusion, nous allons y centraliser la gestion des commandes.

module.exports = router;