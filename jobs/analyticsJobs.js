// backend/src/jobs/analyticsJobs.js
const cron = require('node-cron');
const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const User = require('../models/userModel');
// const AnalyticsReport = require('../models/analyticsReportModel'); // Modèle pour stocker les rapports générés

/**
 * @desc Planifie la génération quotidienne des rapports d'analyse de base.
 * S'exécute tous les jours à une heure spécifique (ex: 3h du matin).
 */
exports.scheduleDailyAnalyticsReport = () => {
    cron.schedule('0 3 * * *', async () => { // Tous les jours à 03:00
        console.log('Running scheduled task: Generating daily analytics report...');
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Début du jour
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);

            // 1. Nouvelles commandes du jour précédent
            const newOrdersYesterday = await Order.countDocuments({
                createdAt: { $gte: yesterday, $lt: today }
            });

            // 2. Revenus du jour précédent
            const revenueResult = await Order.aggregate([
                { $match: {
                    createdAt: { $gte: yesterday, $lt: today },
                    status: { $in: ['delivered', 'completed', 'partially_refunded'] } // Incluez les statuts pertinents
                }},
                { $group: {
                    _id: null,
                    totalRevenue: { $sum: '$totalAmount' } // Assurez-vous que votre modèle Order a un champ totalAmount
                }}
            ]);
            const totalRevenueYesterday = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

            // 3. Nouveaux utilisateurs enregistrés du jour précédent
            const newUsersYesterday = await User.countDocuments({
                createdAt: { $gte: yesterday, $lt: today }
            });

            // 4. Produits les plus vendus (Top 5) - plus complexe, nécessite l'agrégation sur les articles de commande
            const topProductsResult = await Order.aggregate([
                { $match: {
                    createdAt: { $gte: yesterday, $lt: today },
                    status: { $in: ['delivered', 'completed'] }
                }},
                { $unwind: '$items' }, // Déconstruit le tableau d'articles
                { $group: {
                    _id: '$items.productId', // Group par ID de produit
                    totalSoldQuantity: { $sum: '$items.quantity' }
                }},
                { $sort: { totalSoldQuantity: -1 }},
                { $limit: 5 },
                { $lookup: { // Jointure avec la collection de produits pour obtenir les noms
                    from: 'products', // Nom de la collection products (par défaut, Mongoose met au pluriel)
                    localField: '_id',
                    foreignField: '_id',
                    as: 'productInfo'
                }},
                { $unwind: '$productInfo' },
                { $project: {
                    _id: 0,
                    productId: '$_id',
                    productName: '$productInfo.name',
                    quantity: '$totalSoldQuantity'
                }}
            ]);

            const analyticsData = {
                date: yesterday,
                newOrders: newOrdersYesterday,
                totalRevenue: parseFloat(totalRevenueYesterday.toFixed(2)),
                newUsers: newUsersYesterday,
                topSellingProducts: topProductsResult
            };

            console.log('Daily Analytics Report Generated:', analyticsData);

            // Optionnel: Stocker ce rapport dans une collection dédiée
            // await AnalyticsReport.create(analyticsData);

        } catch (error) {
            console.error('Error generating daily analytics report:', error);
        }
    }, {
        scheduled: process.env.NODE_ENV === 'production',
        timezone: "Europe/Paris"
    });
};

/**
 * @desc Planifie la génération mensuelle des rapports d'analyse de performance.
 * S'exécute le premier jour de chaque mois à une heure spécifique (ex: 4h du matin).
 */
exports.scheduleMonthlyPerformanceReport = () => {
    cron.schedule('0 4 1 * *', async () => { // Le 1er de chaque mois à 04:00
        console.log('Running scheduled task: Generating monthly performance report...');
        try {
            const firstDayOfCurrentMonth = new Date();
            firstDayOfCurrentMonth.setDate(1);
            firstDayOfCurrentMonth.setHours(0, 0, 0, 0);

            const lastDayOfPreviousMonth = new Date(firstDayOfCurrentMonth);
            lastDayOfPreviousMonth.setDate(0); // Va au dernier jour du mois précédent
            lastDayOfPreviousMonth.setHours(23, 59, 59, 999);

            const firstDayOfPreviousMonth = new Date(lastDayOfPreviousMonth);
            firstDayOfPreviousMonth.setDate(1);
            firstDayOfPreviousMonth.setHours(0, 0, 0, 0);

            // Exemple: Nombre total de vendeurs enregistrés
            const totalSellers = await User.countDocuments({ role: 'seller' });

            // Exemple: Valeur totale des commandes du mois précédent
            const totalMonthlyOrderValue = await Order.aggregate([
                { $match: {
                    createdAt: { $gte: firstDayOfPreviousMonth, $lte: lastDayOfPreviousMonth },
                    status: { $in: ['delivered', 'completed', 'partially_refunded'] }
                }},
                { $group: {
                    _id: null,
                    totalValue: { $sum: '$totalAmount' }
                }}
            ]);
            const monthlyRevenue = totalMonthlyOrderValue.length > 0 ? totalMonthlyOrderValue[0].totalValue : 0;

            const monthlyReport = {
                month: firstDayOfPreviousMonth.getMonth() + 1,
                year: firstDayOfPreviousMonth.getFullYear(),
                totalSellers,
                monthlyRevenue: parseFloat(monthlyRevenue.toFixed(2)),
                // Ajoutez d'autres métriques comme les utilisateurs actifs, les catégories les plus populaires, etc.
            };

            console.log('Monthly Performance Report Generated:', monthlyReport);
            // Optionnel: Stocker ce rapport
            // await AnalyticsReport.create(monthlyReport);

        } catch (error) {
            console.error('Error generating monthly performance report:', error);
        }
    }, {
        scheduled: process.env.NODE_ENV === 'production',
        timezone: "Europe/Paris"
    });
};