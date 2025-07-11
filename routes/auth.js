// backend/src/routes/auth.js
const express = require('express');
const router = express.Router();

// Import du contrôleur d'authentification (à créer)
const authController = require('../controllers/auth/authController');
const { protect } = require('../middleware/auth'); // Pour des routes comme 'logout' ou 'getMe'

// POST /api/auth/register - Inscription d'un nouvel utilisateur
router.post('/register', authController.register);

// POST /api/auth/login - Connexion de l'utilisateur
router.post('/login', authController.login);

// GET /api/auth/logout - Déconnexion de l'utilisateur (optionnel, souvent géré côté client avec suppression du token)
router.get('/logout', protect, authController.logout); // Protégé pour invalider le token côté serveur si nécessaire

// POST /api/auth/forgot-password - Demande de réinitialisation de mot de passe
router.post('/forgot-password', authController.forgotPassword);

// PUT /api/auth/reset-password/:token - Réinitialisation de mot de passe avec un token
router.put('/reset-password/:token', authController.resetPassword);

// GET /api/auth/verify-email/:token - Vérification d'email
// router.get('/verify-email/:token', authController.verifyEmail);

// GET /api/auth/me - Obtenir les informations de l'utilisateur connecté (équivalent à /api/users/profile mais pour l'auth)
router.get('/me', protect, authController.getMe);

// Routes pour l'authentification sociale (Google, Facebook) - Requiert Passport.js
// Elles seront implémentées si vous décidez d'utiliser ces méthodes d'authentification.
// router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
// router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), authController.googleCallback);
// router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));
// router.get('/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }), authController.facebookCallback);

module.exports = router;