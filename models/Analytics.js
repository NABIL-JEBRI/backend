// backend/src/models/Analytics.js
const mongoose = require('mongoose');

const AnalyticsSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: [true, 'La date des données analytiques est requise'],
        unique: true // Un seul enregistrement par jour
    },
    // Métriques générales
    totalSales: {
        type: Number,
        default: 0,
        min: 0
    },
    totalOrders: {
        type: Number,
        default: 0,
        min: 0
    },
    totalVisits: {
        type: Number,
        default: 0,
        min: 0
    },
    newUsers: {
        type: Number,
        default: 0,
        min: 0
    },
    // Métriques de conversion (ex: ajout au panier, passage de commande)
    addToCartRate: { // Taux d'ajout au panier (nb d'ajouts / nb de visites)
        type: Number,
        default: 0,
        min: 0,
        max: 1 // Représente un pourcentage (0 à 1)
    },
    orderConversionRate: { // Taux de conversion de commande (nb de commandes / nb de visites)
        type: Number,
        default: 0,
        min: 0,
        max: 1
    },
    // Métriques de produits (ex: produits les plus vus, les plus vendus)
    topProductsViewed: [
        {
            product: {
                type: mongoose.Schema.ObjectId,
                ref: 'Product'
            },
            views: {
                type: Number,
                default: 0
            }
        }
    ],
    topProductsSold: [
        {
            product: {
                type: mongoose.Schema.ObjectId,
                ref: 'Product'
            },
            sales: {
                type: Number,
                default: 0
            }
        }
    ],
    // Métriques de vendeurs (ex: meilleurs vendeurs)
    topSellers: [
        {
            seller: {
                type: mongoose.Schema.ObjectId,
                ref: 'User' // Un utilisateur avec le rôle 'seller'
            },
            sales: {
                type: Number,
                default: 0
            }
        }
    ],
    // Vous pouvez ajouter d'autres métriques spécifiques à votre activité
    // Ex: taux de retour, temps moyen de visite, etc.

}, {
    timestamps: true // Ajoute createdAt et updatedAt
});

module.exports = mongoose.model('Analytics', AnalyticsSchema);