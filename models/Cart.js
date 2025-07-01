// backend/src/models/Cart.js
const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: false, // Peut être null pour un panier d'invité
        unique: true, // Un seul panier par utilisateur connecté
        sparse: true // Permet plusieurs paniers "null" pour les invités (ou si le user est null)
    },
    sessionId: { // Pour les utilisateurs non connectés (invités)
        type: String,
        required: function() { return !this.user; }, // Requis si pas d'utilisateur connecté
        unique: true,
        sparse: true // Permet plusieurs documents avec une valeur 'null' si l'utilisateur est connecté
    },
    items: [ // Tableau des produits dans le panier
        {
            product: {
                type: mongoose.Schema.ObjectId,
                ref: 'Product',
                required: true
            },
            name: { type: String, required: true },
            image: { type: String, required: true }, // URL de l'image du produit
            price: { type: Number, required: true }, // Prix unitaire au moment de l'ajout au panier
            qty: {
                type: Number,
                required: true,
                min: [1, 'La quantité doit être au moins 1']
            },
            seller: { // Le vendeur du produit
                type: mongoose.Schema.ObjectId,
                ref: 'User',
                required: true
            }
        }
    ],
    totalQuantity: { // Nombre total d'articles différents dans le panier
        type: Number,
        default: 0
    },
    totalPrice: { // Prix total du panier (avant frais de livraison)
        type: Number,
        default: 0.0
    }
}, {
    timestamps: true // Ajoute createdAt et updatedAt
});

// Middleware pour calculer totalQuantity et totalPrice avant de sauvegarder
CartSchema.pre('save', function(next) {
    let totalQty = 0;
    let totalPrice = 0;
    this.items.forEach(item => {
        totalQty += item.qty;
        totalPrice += item.qty * item.price;
    });
    this.totalQuantity = totalQty;
    this.totalPrice = totalPrice;
    next();
});

module.exports = mongoose.model('Cart', CartSchema);