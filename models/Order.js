// backend/src/models/Order.js
const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: false // La commande peut être passée par un invité
    },
    guestInfo: { // Informations pour les commandes passées par des invités
        name: { type: String, trim: true },
        email: { type: String, trim: true },
        phone: { type: String, trim: true }
    },
    orderItems: [ // Produits inclus dans la commande
        {
            name: { type: String, required: true },
            qty: { type: Number, required: true },
            image: { type: String, required: true }, // URL de l'image du produit
            price: { type: Number, required: true }, // Prix unitaire au moment de la commande
            product: {
                type: mongoose.Schema.ObjectId,
                ref: 'Product',
                required: true
            },
            seller: {
                type: mongoose.Schema.ObjectId,
                ref: 'User',
                required: true
            }
        }
    ],
    // Référence à l'adresse de livraison depuis le modèle Address.js
    shippingAddress: {
        type: mongoose.Schema.ObjectId,
        ref: 'Address',
        // Requis si la livraison est à domicile ET que ce n'est pas une commande invité
        // Pour une commande invité, les infos d'adresse seront dans guestInfo pour simplifier
        required: function() { return this.deliveryOption === 'home_delivery' && this.user; }
    },
    // OU les détails de l'adresse pour un invité, non lié à une adresse enregistrée
    guestShippingAddressDetails: {
        street: { type: String },
        city: { type: String },
        governorate: { type: String },
        delegation: { type: String },
        zipCode: { type: String },
        country: { type: String, default: 'Tunisia' },
        fullName: { type: String },
        phone: { type: String },
        buildingDetails: { type: String }
    },
    relayPoint: { // Référence au point relais si choisi
        type: mongoose.Schema.ObjectId,
        ref: 'RelayPoint', // Nous créerons ce modèle ensuite
        required: function() { return this.deliveryOption === 'relay_point'; }
    },
    deliveryOption: { // Type de livraison choisi
        type: String,
        enum: ['home_delivery', 'relay_point'],
        required: true
    },
    itemsPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    shippingPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    totalPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    paymentMethod: {
        type: String,
        enum: ['cash_on_delivery', 'online_payment'],
        required: true
    },
    paymentResult: {
        id: { type: String },
        status: { type: String },
        update_time: { type: String },
        email_address: { type: String }
    },
    isPaid: {
        type: Boolean,
        default: false
    },
    paidAt: {
        type: Date
    },
    orderStatus: {
        type: String,
        enum: [
            'pending',
            'confirmed',
            'processing',
            'shipped',
            'out_for_delivery',
            'ready_for_pickup',
            'delivered',
            'cancelled',
            'refunded'
        ],
        default: 'pending'
    },
    deliveredAt: {
        type: Date
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Order', OrderSchema);