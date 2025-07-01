// backend/src/services/analyticsService.js
const Order = require('../models/Order');     // Assurez-vous que le modèle Order est défini
const Product = require('../models/Product'); // Assurez-vous que le modèle Product est défini
const User = require('models/User');       // Assurez-vous que le modèle User est défini
const ApiError = require('../utils/ApiError');

/**
 * Récupère un résumé des métriques clés pour le tableau de bord admin.
 * @returns {object} Statistiques de résumé.
 */
exports.getOverallAnalyticsSummary = async () => {
    try {
        const totalOrders = await Order.countDocuments();
        const totalProducts = await Product.countDocuments();
        const totalUsers = await User.countDocuments();
        const totalSellers = await User.countDocuments({ role: 'seller' });

        // Calcul du revenu total (ex: en sommant le total de toutes les commandes finalisées)
        const totalRevenueResult = await Order.aggregate([
            { $match: { status: 'completed' } }, // Ou 'delivered', 'paid', selon votre logique de finalisation
            { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
        ]);
        const totalRevenue = totalRevenueResult.length > 0 ? totalRevenueResult[0].totalRevenue : 0;

        // Nombre de commandes en attente
        const pendingOrders = await Order.countDocuments({ status: 'pending' });

        return {
            totalOrders,
            totalProducts,
            totalUsers,
            totalSellers,
            totalRevenue,
            pendingOrders
        };
    } catch (error) {
        console.error('Erreur dans getOverallAnalyticsSummary:', error);
        throw new ApiError('Impossible de récupérer le résumé analytique.', 500);
    }
};

/**
 * Récupère les statistiques de ventes ou d'activités sur une période donnée (ex: quotidiennes).
 * @param {Date} startDate - Date de début.
 * @param {Date} endDate - Date de fin.
 * @returns {Array<object>} Données agrégées par jour.
 */
exports.getDailyAnalytics = async (startDate, endDate) => {
    try {
        const dailyData = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate },
                    status: { $in: ['completed', 'delivered', 'paid'] } // Commandes qui contribuent aux ventes
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                        day: { $dayOfMonth: '$createdAt' }
                    },
                    totalSales: { $sum: '$totalAmount' },
                    totalOrders: { $sum: 1 }
                }
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
            },
            {
                $project: {
                    _id: 0,
                    date: {
                        $dateFromParts: {
                            year: '$_id.year',
                            month: '$_id.month',
                            day: '$_id.day'
                        }
                    },
                    totalSales: 1,
                    totalOrders: 1
                }
            }
        ]);
        return dailyData;
    } catch (error) {
        console.error('Erreur dans getDailyAnalytics:', error);
        throw new ApiError('Impossible de récupérer les données analytiques quotidiennes.', 500);
    }
};

/**
 * Récupère les produits les plus vendus.
 * @param {number} limit - Nombre de produits à retourner.
 * @returns {Array<object>} Liste des produits les plus vendus.
 */
exports.getTopSoldProducts = async (limit = 10) => {
    try {
        const topProducts = await Order.aggregate([
            { $unwind: '$items' }, // Désagrège les articles de commande
            {
                $group: {
                    _id: '$items.product', // Groupe par ID de produit
                    totalQuantitySold: { $sum: '$items.quantity' },
                    totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
                }
            },
            { $sort: { totalQuantitySold: -1 } }, // Trie par quantité vendue décroissante
            { $limit: limit },
            {
                $lookup: { // Jointure avec le modèle Product pour obtenir les détails du produit
                    from: 'products', // Nom de la collection (généralement en minuscules et pluriel)
                    localField: '_id',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            },
            { $unwind: '$productDetails' }, // Désagrège le tableau de productDetails
            {
                $project: { // Projette les champs désirés
                    productId: '$_id',
                    productName: '$productDetails.name',
                    productImage: '$productDetails.images', // ou une image spécifique si plusieurs
                    totalQuantitySold: 1,
                    totalRevenue: 1
                }
            }
        ]);
        return topProducts;
    } catch (error) {
        console.error('Erreur dans getTopSoldProducts:', error);
        throw new ApiError('Impossible de récupérer les produits les plus vendus.', 500);
    }
};

// Ajoutez d'autres fonctions analytiques (ex: getTopViewedProducts, getTopSellers, getConversionRates)
// Pour getTopViewedProducts, vous auriez besoin d'un champ `viewsCount` dans votre modèle Product
// ou d'un système de log d'impressions.

// Pour getTopSellers, vous agrégeriez les commandes par vendeur.
/*
exports.getTopSellers = async (limit = 5) => {
    try {
        const topSellers = await Order.aggregate([
            { $unwind: '$items' },
            {
                $lookup: {
                    from: 'products',
                    localField: 'items.product',
                    foreignField: '_id',
                    as: 'productInfo'
                }
            },
            { $unwind: '$productInfo' },
            {
                $group: {
                    _id: '$productInfo.seller',
                    totalSalesValue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
                    totalItemsSold: { $sum: '$items.quantity' }
                }
            },
            { $sort: { totalSalesValue: -1 } },
            { $limit: limit },
            {
                $lookup: {
                    from: 'users', // Nom de la collection des utilisateurs
                    localField: '_id',
                    foreignField: '_id',
                    as: 'sellerDetails'
                }
            },
            { $unwind: '$sellerDetails' },
            {
                $project: {
                    sellerId: '$_id',
                    sellerName: '$sellerDetails.name',
                    totalSalesValue: 1,
                    totalItemsSold: 1
                }
            }
        ]);
        return topSellers;
    } catch (error) {
        console.error('Erreur dans getTopSellers:', error);
        throw new ApiError('Impossible de récupérer les meilleurs vendeurs.', 500);
    }
};
*/