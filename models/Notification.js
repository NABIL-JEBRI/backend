// backend/src/models/Notification.js
const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'L\'utilisateur concerné par la notification est requis']
    },
    message: {
        type: String,
        required: [true, 'Le message de la notification est requis'],
        trim: true,
        maxlength: [500, 'Le message ne peut pas dépasser 500 caractères']
    },
    type: {
        type: String,
        enum: [
            'order_update',     // Mise à jour de commande
            'new_message',      // Nouveau message (ex: chat)
            'promotion',        // Promotion/Offre
            'product_update',   // Mise à jour de produit (prix, stock)
            'account_update',   // Mise à jour de compte
            'new_review',       // Nouvel avis
            'low_stock_alert',  // Alerte de stock bas
            'general'           // Notification générale
        ],
        required: [true, 'Le type de notification est requis']
    },
    isRead: {
        type: Boolean,
        default: false
    },
    // Données supplémentaires liées à la notification (ex: l'ID de la commande, l'ID du produit)
    relatedTo: {
        type: mongoose.Schema.ObjectId,
        required: false, // Pas toujours requis
        refPath: 'relatedToModel' // Défini dynamiquement le modèle référencé
    },
    relatedToModel: { // Le nom du modèle auquel relatedTo fait référence
        type: String,
        enum: ['Order', 'Product', 'Message', 'Promotion', 'Review'], // Les modèles possibles
        required: false
    },
    // Pour les notifications de groupe (ex: à tous les vendeurs)
    isGroupNotification: {
        type: Boolean,
        default: false
    },
    // Si c'est une notification de groupe, à quel groupe s'applique-t-elle ?
    group: {
        type: String,
        enum: ['all_users', 'sellers', 'admins'],
        required: function() { return this.isGroupNotification === true; }
    }
}, {
    timestamps: true // Ajoute createdAt et updatedAt
});

module.exports = mongoose.model('Notification', NotificationSchema);