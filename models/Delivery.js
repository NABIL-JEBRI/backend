// backend/src/models/Delivery.js
const mongoose = require('mongoose');

const DeliverySchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.ObjectId,
        ref: 'Order',
        required: [true, 'La commande associée à la livraison est requise'],
        unique: true // Une livraison par commande
    },
    deliveryOption: { // Type de livraison choisi pour cette commande
        type: String,
        enum: ['home_delivery', 'relay_point'],
        required: [true, 'L\'option de livraison est requise']
    },
    // Référence à l'adresse de livraison si 'home_delivery'
    shippingAddress: {
        type: mongoose.Schema.ObjectId,
        ref: 'Address',
        required: function() { return this.deliveryOption === 'home_delivery'; }
    },
    // Référence au point relais si 'relay_point'
    relayPoint: {
        type: mongoose.Schema.ObjectId,
        ref: 'RelayPoint', // Nous allons créer ce modèle ensuite
        required: function() { return this.deliveryOption === 'relay_point'; }
    },
    // Informations sur le créneau de livraison si choisi
    deliverySlot: {
        type: mongoose.Schema.ObjectId,
        ref: 'DeliverySlot', // Nous allons créer ce modèle ensuite
        required: false // Peut ne pas être choisi pour certaines options
    },
    carrier: { // Transporteur (ex: Poste Tunisienne, Aramex, livreur interne)
        type: String,
        trim: true,
        maxlength: [50, 'Le nom du transporteur ne peut pas dépasser 50 caractères']
    },
    trackingNumber: { // Numéro de suivi fourni par le transporteur
        type: String,
        trim: true,
        unique: true,
        sparse: true // Permet plusieurs documents avec null
    },
    deliveryStatus: {
        type: String,
        enum: [
            'pending_pickup',   // En attente de ramassage par le transporteur
            'in_transit',       // En transit
            'out_for_delivery', // En cours de livraison (pour livraison à domicile)
            'ready_for_pickup', // Prêt à être retiré (pour point relais)
            'delivered',        // Livré au client / Retiré du point relais
            'failed_attempt',   // Tentative de livraison échouée
            'returned',         // Retour à l'expéditeur
            'cancelled'         // Livraison annulée
        ],
        default: 'pending_pickup'
    },
    scheduledDeliveryDate: {
        type: Date, // Date de livraison prévue
        required: false
    },
    actualDeliveryDate: {
        type: Date // Date de livraison réelle
    },
    deliveredBy: { // Référence au livreur (si interne)
        type: mongoose.Schema.ObjectId,
        ref: 'User', // Un utilisateur avec un rôle 'delivery_driver' par exemple
        required: false
    },
    // Coordonnées de livraison si besoin de géolocalisation en temps réel
    currentLocation: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: { // [longitude, latitude]
            type: [Number],
            index: '2dsphere'
        }
    },
    notes: { // Notes supplémentaires sur la livraison
        type: String,
        trim: true,
        maxlength: [500, 'Les notes ne peuvent pas dépasser 500 caractères']
    }
}, {
    timestamps: true // Ajoute createdAt et updatedAt
});

module.exports = mongoose.model('Delivery', DeliverySchema);