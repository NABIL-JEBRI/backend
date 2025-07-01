// backend/src/services/searchService.js
const Product = require('../models/Product'); // Assurez-vous que le modèle Product est défini
const Category = require('../models/Category'); // Assurez-vous que le modèle Category est défini
const Brand = require('../models/Brand'); // Assurez-vous que le modèle Brand est défini
const ApiError = require('../utils/ApiError');

/**
 * Effectue une recherche globale sur les produits, catégories et marques.
 * @param {string} query - Le terme de recherche.
 * @param {object} filters - Filtres supplémentaires (catégorie, marque, minPrice, maxPrice, etc.).
 * @param {object} options - Options de pagination et de tri (page, limit, sort).
 * @returns {object} Résultats de la recherche (produits, catégories, marques).
 */
exports.globalSearch = async (query, filters = {}, options = {}) => {
    const { page = 1, limit = 10, sort = '-createdAt' } = options;
    const skip = (page - 1) * limit;

    const searchQuery = {};
    if (query) {
        // Utiliser des expressions régulières pour une recherche flexible (non sensible à la casse)
        searchQuery.$or = [
            { name: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } },
            // Ajoutez d'autres champs si vous voulez qu'ils soient recherchables
        ];
    }

    // Appliquer les filtres spécifiques
    if (filters.category) {
        // Trouver l'ID de la catégorie si le nom est passé, sinon utiliser directement l'ID
        const category = await Category.findOne({ name: { $regex: filters.category, $options: 'i' } });
        if (category) {
            searchQuery.category = category._id;
        } else {
            // Si la catégorie n'existe pas, aucun produit ne correspondra
            return { products: [], categories: [], brands: [], pagination: { total: 0 } };
        }
    }
    if (filters.brand) {
        const brand = await Brand.findOne({ name: { $regex: filters.brand, $options: 'i' } });
        if (brand) {
            searchQuery.brand = brand._id;
        } else {
            return { products: [], categories: [], brands: [], pagination: { total: 0 } };
        }
    }
    if (filters.minPrice) searchQuery.price = { ...searchQuery.price, $gte: parseFloat(filters.minPrice) };
    if (filters.maxPrice) searchQuery.price = { ...searchQuery.price, $lte: parseFloat(filters.maxPrice) };

    try {
        // Recherche de produits
        const productsQuery = Product.find({ ...searchQuery, isApproved: true }); // Seulement les produits approuvés
        const totalProducts = await Product.countDocuments({ ...searchQuery, isApproved: true });
        const products = await productsQuery
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .populate('category brand seller', 'name'); // Peupler les informations pertinentes

        // Recherche de catégories (si la requête concerne aussi les catégories)
        let categories = [];
        if (query) {
            categories = await Category.find({ name: { $regex: query, $options: 'i' } }).limit(5);
        }

        // Recherche de marques (si la requête concerne aussi les marques)
        let brands = [];
        if (query) {
            brands = await Brand.find({ name: { $regex: query, $options: 'i' } }).limit(5);
        }

        const pagination = {
            total: totalProducts,
            limit,
            currentPage: page,
            nextPage: totalProducts > (page * limit) ? page + 1 : null,
            prevPage: page > 1 ? page - 1 : null,
            totalPages: Math.ceil(totalProducts / limit)
        };

        return { products, categories, brands, pagination };
    } catch (error) {
        console.error('Erreur lors de la recherche globale :', error);
        throw new ApiError('Échec de la recherche.', 500);
    }
};

// ... Ajoutez d'autres fonctions de recherche spécifiques si nécessaire (ex: suggestions)