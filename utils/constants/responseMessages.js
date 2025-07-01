// backend/src/utils/constants/responseMessages.js

/**
 * @desc Object for standardized API response messages.
 * Centralizing these messages helps maintain consistency and simplifies localization.
 */
const RESPONSE_MESSAGES = Object.freeze({
    // Success Messages
    SUCCESS: 'Opération réussie.',
    CREATED: 'Ressource créée avec succès.',
    UPDATED: 'Ressource mise à jour avec succès.',
    DELETED: 'Ressource supprimée avec succès.',
    LOGGED_IN: 'Connexion réussie.',
    LOGGED_OUT: 'Déconnexion réussie.',
    EMAIL_SENT: 'Email envoyé avec succès.',
    PASSWORD_RESET_SUCCESS: 'Mot de passe réinitialisé avec succès.',
    PASSWORD_CHANGED_SUCCESS: 'Mot de passe modifié avec succès.',

    // Error Messages - General
    ERROR: 'Une erreur est survenue.',
    NOT_FOUND: 'Ressource non trouvée.',
    INVALID_ID: 'ID invalide.',
    BAD_REQUEST: 'Requête invalide.',
    UNAUTHORIZED: 'Accès non autorisé. Veuillez vous connecter.',
    FORBIDDEN: 'Accès interdit. Vous n\'avez pas les permissions nécessaires.',
    INTERNAL_SERVER_ERROR: 'Erreur interne du serveur.',
    VALIDATION_FAILED: 'Échec de la validation des données.',
    ALREADY_EXISTS: 'La ressource existe déjà.',
    CONFLICT: 'Conflit de données.',

    // Error Messages - Specific (examples)
    USER: {
        NOT_FOUND: 'Utilisateur non trouvé.',
        ALREADY_EXISTS: 'Cet email est déjà enregistré.',
        INVALID_CREDENTIALS: 'Email ou mot de passe incorrect.',
        PASSWORD_INCORRECT: 'Mot de passe actuel incorrect.',
        PASSWORD_RESET_TOKEN_INVALID: 'Jeton de réinitialisation invalide ou expiré.'
    },
    PRODUCT: {
        NOT_FOUND: 'Produit non trouvé.',
        INSUFFICIENT_STOCK: 'Stock insuffisant pour ce produit.'
    },
    ORDER: {
        NOT_FOUND: 'Commande non trouvée.',
        EMPTY_CART: 'Le panier ne peut pas être vide pour passer une commande.',
        INVALID_STATUS_TRANSITION: 'Transition de statut de commande invalide.'
    },
    DELIVERY: {
        NOT_FOUND: 'Livraison non trouvée.',
        SLOT_UNAVAILABLE: 'Le créneau de livraison sélectionné n\'est plus disponible.',
        AREA_NOT_SERVICEABLE: 'Zone non desservie.'
    },
    PAYMENT: {
        FAILED: 'Le paiement a échoué.',
        INVALID_DETAILS: 'Détails de paiement invalides.'
    }
});

module.exports = RESPONSE_MESSAGES;