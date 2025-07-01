// backend/src/models/Promotion.js
const mongoose = require('mongoose');

const PromotionSchema = new mongoose.Schema({
    code: { // Code du coupon (ex: "SUMMER20", "FREESHIP")
        type: String,
        unique: true,
        trim: true,
        uppercase: true,
        minlength: [4, 'Le code de promotion doit contenir au moins 4 caractères'],
        maxlength: [20, 'Le code de promotion ne peut pas dépasser 20 caractères'],
        sparse: true // Permet d'avoir des promotions sans code (ex: promotions automatiques)
    },
    name: { // Nom interne de la promotion (ex: "Soldes d'été", "Livraison Gratuite Fête des Mères")
        type: String,
        required: [true, 'Le nom de la promotion est requis'],
        trim: true,
        maxlength: [100, 'Le nom de la promotion ne peut pas dépasser 100 caractères']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'La description de la promotion ne peut pas dépasser 500 caractères']
    },
    type: {
        type: String,
        enum: ['percentage', 'fixed_amount', 'free_shipping'], // Type de réduction
        required: [true, 'Le type de promotion est requis']
    },
    value: { // La valeur de la réduction (ex: 20 pour 20%, 10 pour 10 TND)
        type: Number,
        required: function() { return this.type !== 'free_shipping'; }, // Non requis si livraison gratuite
        min: [0, 'La valeur de la promotion ne peut pas être négative']
    },
    minimumOrderAmount: { // Montant minimum de commande pour appliquer la promo
        type: Number,
        default: 0,
        min: [0, 'Le montant minimum ne peut pas être négatif']
    },
    usageLimit: { // Nombre maximum d'utilisations pour ce code de promotion
        type: Number,
        default: -1, // -1 signifie illimité
        min: [-1, 'La limite d\'utilisation ne peut pas être inférieure à -1']
    },
    timesUsed: { // Nombre de fois que ce code a été utilisé
        type: Number,
        default: 0,
        min: [0, 'Le nombre d\'utilisations ne peut pas être négatif']
    },
    startDate: {
        type: Date,
        required: [true, 'La date de début est requise']
    },
    endDate: {
        type: Date,
        required: [true, 'La date de fin est requise']
    },
    isActive: { // Pour activer/désactiver manuellement une promotion
        type: Boolean,
        default: true
    },
    // Conditions d'application (si la promotion s'applique à des produits/catégories spécifiques)
    appliesTo: {
        type: String,
        enum: ['all_products', 'specific_products', 'specific_categories', 'specific_brands', 'specific_sellers'],
        default: 'all_products'
    },
    appliedProducts: [ // IDs des produits spécifiques si appliesTo = 'specific_products'
        {
            type: mongoose.Schema.ObjectId,
            ref: 'Product'
        }
    ],
    appliedCategories: [ // IDs des catégories spécifiques si appliesTo = 'specific_categories'
        {
            type: mongoose.Schema.ObjectId,
            ref: 'Category'
        }
    ],
    appliedBrands: [ // IDs des marques spécifiques si appliesTo = 'specific_brands'
        {
            type: mongoose.Schema.ObjectId,
            ref: 'Brand'
        }
    ],
    appliedSellers: [ // IDs des vendeurs spécifiques si appliesTo = 'specific_sellers'
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User' // Référence à un utilisateur avec le rôle 'seller'
        }
    ],
    createdBy: { // Qui a créé la promotion (probablement un admin)
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: false // Peut être géré par des scripts si besoin
    }
}, {
    timestamps: true // Ajoute createdAt et updatedAt
});

// Index pour optimiser la recherche par code, date de début/fin
PromotionSchema.index({ code: 1, startDate: 1, endDate: 1 });

module.exports = mongoose.model('Promotion', PromotionSchema);